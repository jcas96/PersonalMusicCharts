import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
const API_KEY = import.meta.env.VITE_API_KEY;
let params = new URLSearchParams(window.location.search);
let code = params.get("code");


function App() {

  const [image, setImage] = useState(null);
  const[name, setName] = useState("Nobody");
  const[uri, setUri] = useState(null);


  const getData = async() => {
    if(!code){
      
      console.log("running");
      redirectToAuthFlow(API_KEY);
    }else{
      console.log("running else");
      let accessToken = await getAccessToken(API_KEY,code);
      let profile = await fetchProfile(accessToken);
      const trackMed = await fetchTopTracksMed(accessToken);
      const trackShort = await fetchTopTracksShort(accessToken);
      const artistMed = await fetchTopArtistsMed(accessToken);
      const artistShort = await fetchTopArtistsShort(accessToken);
      populateUP(profile);
      populateUM(trackMed);
      populateSU(trackShort);
      populateAU(artistMed);
      populateAUS(artistShort);
    }
  }


  const redirectToAuthFlow = async(clientId)=>{

    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier",verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri","https://yourtopstats.netlify.app/callback");
    params.append("scope","user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

const generateCodeVerifier = (length) => {
  let text = "";
  let possible ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for(let i =0; i<length;i++){
    text+= possible.charAt(Math.floor(Math.random()*possible.length));
  }

  return text;
}

const  generateCodeChallenge = async(codeVerifier)=> {
  const data = new TextEncoder().encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256',data);

  return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
}

const getAccessToken = async(clientId, code) =>{
  console.log("RUnnin token");
  const verifier = localStorage.getItem("verifier");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("grant_type", "authorization_code");
  params.append("code", code);
  params.append("redirect_uri", "https://yourtopstats.netlify.app/callback");
  params.append("code_verifier", verifier);

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const { access_token } = await result.json();
  return access_token;
}

const fetchProfile = async(token) =>{

  const result = await fetch("https://api.spotify.com/v1/me",{
      method:"GET",headers:{ Authorization: `Bearer ${token}`}
  });
  return await result.json();
}

const populateUP = (profile)=>{
  setName(profile.display_name);
  if(profile.images[0]){
      const profileImage = new Image(200,200);
      profileImage.src = profile.images[0].url;
      setImage(profileImage.src);
      document.getElementById("avatar").appendChild(profileImage);
  }
  document.getElementById("uri").innerText = profile.uri;
  document.getElementById("uri").setAttribute("href", profile.external_urls.spotify);
}

 const fetchTopTracksMed = async(token)=>{
  const result1 = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=medium_term&limit=10&offset=0",{
      method:"GET", headers: {Authorization: `Bearer ${token}` }
  });
  return await result1.json();
}

 const fetchTopTracksShort = async(token)=>{
  const resultShort = await fetch("https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=0",{
      method:"GET", headers: {Authorization: `Bearer ${token}`}
  });
  return await resultShort.json();
}

 const fetchTopArtistsMed = async(token)=>{
  const resultArtM = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=medium_term&limit=10&offset=0",{
      method:"GET", headers:{Authorization: `Bearer ${token}`}
  });
  return await resultArtM.json();
}

 const fetchTopArtistsShort = async(token)=>{
  const resultArtS = await fetch("https://api.spotify.com/v1/me/top/artists?time_range=short_term&limit=10&offset=0",{
      method:"GET", headers:{Authorization: `Bearer ${token}`}
  });
  return await resultArtS.json();
}

const populateUM =(profile)=>{
  for(let i=0;i<10;i++){
      let c = "num"+(i+1);
      document.getElementById(c).innerText = profile.items[i].name;
  }
}

const populateSU =(profile)=>{
  for(let i=0;i<10;i++){
      let c= "sNum"+(i+1);
      document.getElementById(c).innerText = profile.items[i].name;
  }
}

const populateAU =(profile)=>{
  for(let i=0;i<10;i++){
      let c = "aNum"+(i+1);
      document.getElementById(c).innerText = profile.items[i].name;
  }
}

const populateAUS =(profile)=>{
  for(let i=0;i<10;i++){
      let c ="aNumS"+(i+1);
      document.getElementById(c).innerText = profile.items[i].name;
  }
}

  return (
    <>
      <div className="MainPage">
          <h1>Your Spotify Profile data</h1>
          <div className="btnBox">
          <button onClick={getData} >Get Your Charts!</button>
          </div>
          <section id="profile">
            <h2>
              Logged in as {name} <span id="displayName"></span>
            </h2>
            <span id="avatar"></span>
            <ul>
              <li>
                Spotify URI: <a id="uri" href="#"></a>
              </li>
              <p></p>
              <li>
                Your Top Tracks in the last 6 months:{" "}
                <span id="tracks">
                  <ul>
                  <li>
                    1. <span id="num1"></span>
                  </li>
                  <li>
                    2. <span id="num2"></span>
                  </li>
                  <li>
                    3. <span id="num3"></span>
                  </li>
                  <li>
                    4. <span id="num4"></span>
                  </li>
                  <li>
                    5. <span id="num5"></span>
                  </li>
                  <li>
                    6. <span id="num6"></span>
                  </li>
                  <li>
                    7. <span id="num7"></span>
                  </li>
                  <li>
                    8. <span id="num8"></span>
                  </li>
                  <li>
                    9. <span id="num9"></span>
                  </li>
                  <li>
                    10. <span id="num10"></span>
                  </li>
                  </ul>
                </span>
              </li>
              <p> </p>
              <li>
                Your Top Tracks in the last 4 weeks:{" "}
                <span id="tracksS">
                  <ul>
                  <li>
                    1. <span id="sNum1"></span>
                  </li>
                  <li>
                    2. <span id="sNum2"></span>
                  </li>
                  <li>
                    3. <span id="sNum3"></span>
                  </li>
                  <li>
                    4. <span id="sNum4"></span>
                  </li>
                  <li>
                    5. <span id="sNum5"></span>
                  </li>
                  <li>
                    6. <span id="sNum6"></span>
                  </li>
                  <li>
                    7. <span id="sNum7"></span>
                  </li>
                  <li>
                    8. <span id="sNum8"></span>
                  </li>
                  <li>
                    9. <span id="sNum9"></span>
                  </li>
                  <li>
                    10. <span id="sNum10"></span>
                  </li>
                  </ul>
                </span>
              </li>
              <p></p>
              <li>
                Your Top Artists in the last 6 months:{" "}
                <span id="artistM">
                  <ul>
                  <li>
                    1. <span id="aNum1"></span>
                  </li>
                  <li>
                    2. <span id="aNum2"></span>
                  </li>
                  <li>
                    3. <span id="aNum3"></span>
                  </li>
                  <li>
                    4. <span id="aNum4"></span>
                  </li>
                  <li>
                    5. <span id="aNum5"></span>
                  </li>
                  <li>
                    6. <span id="aNum6"></span>
                  </li>
                  <li>
                    7. <span id="aNum7"></span>
                  </li>
                  <li>
                    8. <span id="aNum8"></span>
                  </li>
                  <li>
                    9. <span id="aNum9"></span>
                  </li>
                  <li>
                    10. <span id="aNum10"></span>
                  </li>
                  </ul>
                </span>
              </li>
              <p></p>
              <li>
                Your Top Artists in the last 4 weeks:{" "}
                <span id="artistS">
                  <ul>
                  <li>
                    1. <span id="aNumS1"></span>
                  </li>
                  <li>
                    2. <span id="aNumS2"></span>
                  </li>
                  <li>
                    3. <span id="aNumS3"></span>
                  </li>
                  <li>
                    4. <span id="aNumS4"></span>
                  </li>
                  <li>
                    5. <span id="aNumS5"></span>
                  </li>
                  <li>
                    6. <span id="aNumS6"></span>
                  </li>
                  <li>
                    7. <span id="aNumS7"></span>
                  </li>
                  <li>
                    8. <span id="aNumS8"></span>
                  </li>
                  <li>
                    9. <span id="aNumS9"></span>
                  </li>
                  <li>
                    10. <span id="aNumS10"></span>
                  </li>
                  </ul>
                </span>
              </li>
            </ul>
          </section>
      </div>
    </>
  );
}

export default App;
