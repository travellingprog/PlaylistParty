import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat';

const App = () => (
  <BrowserRouter>
    <div>
      <Route exact path="/" component={Login}/>
      <Route path="/chat" component={Chat}/>
    </div>
  </BrowserRouter>
);

export default App;
