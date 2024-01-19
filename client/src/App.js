//import my CSS
import './mycss/custom.css';
//import bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';
//import react-bootstrap components
import { Container } from 'react-bootstrap';
//imports needed to use state
import React, { useState, useEffect } from 'react';
//import my components
import NavBar from './components/Navbar';
import LoginForm from './components/Login';
import MainContent from './components/MainContent';
import DefaultRoute from './components/DefaultRoute';
//import react-router-dom components
import { BrowserRouter as Router } from 'react-router-dom';
import { Route, Switch, Redirect } from 'react-router-dom';
//import APIs
import API from './API';
//import HashLoader spinner component
import HashLoader from "react-spinners/HashLoader";
//import Utils
import UTILS from './Utils';

function App() {
  //Define a state to manage login. undefined -> request not satisfied yet, false -> user not logged in, true -> user logged in
  //ATTENTION, the check loggedIn? is not enough, every time we need to check against true/false since undefined is a falsy
  const [loggedIn, setLoggedIn] = useState(undefined);
  //Define a state to manage user name
  const [userName, setUserName] = useState('');
  //Define a state to manage user id
  const [userId, setUserId] = useState(undefined);
  //Define a state for a message to show ("incorrect username and/or password") during the login
  const [message, setMessage] = useState('');
  //Define a state that will be set to true when we need to go to the login page, so that a redirect is rendered
  const [goToLogin, setGoToLogin] = useState(false);
  //Define the list of memes
  const [memeList, setMemeList] = useState([]);
  //Define a dirty state that will be true whenever we need to fetch memes from the server and will be set to false
  //as soon as the operation finishes
  const [dirty, setDirty] = useState(true);
  //Define a loading state used to show a loading spinner while HTTP requests are performed
  const [loading, setLoading] = useState(true);
  //Define a state that will be used to render a redirect to /
  const [goToIndex, setGoToIndex] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      API.getUserInfo()
        .then((user) => { setUserName(user.name); setUserId(user.id); setLoggedIn(true); })
        .catch((err) => { console.error(err.error); setLoggedIn(false) });
    }
    checkAuth();
  }, []);

  // Used at App component mount and triggered every time dirty and loggedIn change. 
  // If dirty is true it performs a request to GET the list of memes/public memes from the back-end and updates the current memeList state.
  // Then set the dirty and the loading states to false. 
  useEffect(() => {
    const getMemes = () => {
      if (dirty && loggedIn !== undefined) {
        let func = undefined;
        if (loggedIn === false) {
          func = API.loadPublicMemes;
        }
        else if (loggedIn === true) {
          func = API.loadAllMemes;
        }
        func()
          .then(newMemesList => setMemeList(newMemesList))
          .catch(() => setMemeList([]))
          .finally(() => {
            setLoading(false);
            setDirty(false);
          })
      }
    }
    getMemes();
  }, [dirty, loggedIn]);

  const doLogIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setUserName(user.name);
      setUserId(user.id)
      setMemeList([]);
      setGoToLogin(false);
      setGoToIndex(true);
      setLoggedIn(true);
      setMessage('');
    } catch (err) {
      setMessage({ msg: err, type: 'danger' });
    } finally {
      setLoading(true);
      setDirty(true);
    }
  }

  const doLogOut = async () => {
    await API.logOut();
    setLoggedIn(false);
    // clean up everything
    setMemeList([]);
    setUserName('');
    setUserId(undefined);
    setMessage('');
    setGoToLogin(false);
    setGoToIndex(true);
    setLoading(true);
    setDirty(true);
  }

  return (
    <Router>
      <Container fluid>

        {loggedIn === true ? (<NavBar username={userName} loggedIn={loggedIn} doLogOut={doLogOut} />) : <></>}
        {loggedIn === false ? (<NavBar username={userName} loggedIn={loggedIn} setGoToLogin={setGoToLogin} setGoToIndex={setGoToIndex} />) : <></>}

        {goToLogin && <Redirect to="/login" />}
        {goToIndex && <Redirect to="/" />}

        <Switch>

          <Route exact path="/login" render={() =>
            <>
              {loggedIn === false ? <LoginForm setLoading={setLoading} login={doLogIn} message={message} setMessage={setMessage} setGoToLogin={setGoToLogin} setDirty={setDirty} setGoToIndex={setGoToIndex} /> : <></>}
              {loggedIn === true && <Redirect to="/"/>}
            </>} />

          <Route exact path="/" render={() =>
            <>
              <HashLoader size={UTILS.hashLoaderSize} css={UTILS.cssForHashLoader()} loading={loading} color={UTILS.primaryColor} />
              {loading === false ? <MainContent userId={userId} loggedIn={loggedIn} memes={memeList} setMemesList={setMemeList} setDirty={setDirty} username={userName} setLoading={setLoading} /> : <></>}
            </>
          } />

          <Route>
            <DefaultRoute setDirty={setDirty} setLoading={setLoading} setGoToIndex={setGoToIndex} setGoToLogin={setGoToLogin}></DefaultRoute>
          </Route>

        </Switch>

      </Container>
    </Router>
  );
}

export default App;
