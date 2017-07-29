import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

let firebase = window.firebase;

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

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
