import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

let firebase = window.firebase;
let firebaseui = window.firebaseui;

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

// Initialize Firebase
const config = {
  apiKey: "AIzaSyDYrG8FoFjqW5QgJjg6fZsmdKb-sFuAajw",
  authDomain: "playlistparty-3b246.firebaseapp.com",
  databaseURL: "https://playlistparty-3b246.firebaseio.com",
  projectId: "playlistparty-3b246",
  storageBucket: "playlistparty-3b246.appspot.com",
  messagingSenderId: "17232661694"
};
firebase.initializeApp(config);

// FirebaseUI config.
const uiConfig = {
  signInSuccessUrl: 'http://localhost:3000/',
  signInOptions: [
    firebase.auth.FacebookAuthProvider.PROVIDER_ID
  ]
};

// Initialize the FirebaseUI Widget using Firebase.
var ui = new firebaseui.auth.AuthUI(firebase.auth());
ui.start('#firebaseui-auth-container', uiConfig);
