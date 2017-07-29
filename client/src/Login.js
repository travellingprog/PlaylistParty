import React, { Component } from 'react';
import './Login.css';
import logo from './logo.svg';

let firebase = window.firebase;
let firebaseui = window.firebaseui;

class Login extends Component {
  /** lifecycle hook after component renders */
  componentDidMount () {
    this.initFirebaseUI();
  }

  /** renders the Firebase UI on the login page */
  initFirebaseUI () {
    const uiConfig = {
      signInSuccessUrl: 'http://localhost:3000/chat',
      signInOptions: [
        firebase.auth.FacebookAuthProvider.PROVIDER_ID
      ]
    };

    var ui = new firebaseui.auth.AuthUI(firebase.auth());
    ui.start('#firebaseui-auth-container', uiConfig);
  }

  /** rendering of the Login page */
  render () {
    return (
      <div className="Login">
        <div className="Login-header">
          <img src={logo} className="Login-logo" alt="logo" />
          <h2>Welcome to PlaylistParty</h2>
        </div>
        <div className="Login-into">
          <div id="firebaseui-auth-container"></div>
        </div>
      </div>
    );
  }
}

export default Login;
