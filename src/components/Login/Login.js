import React, { useContext } from 'react';
import * as firebase from "firebase/app";
import "firebase/auth";
import firebaseConfig from './firebase.config';
import { useState } from 'react';
import { UserContext } from '../../App';
import { useHistory, useLocation } from 'react-router-dom';

firebase.initializeApp(firebaseConfig);

function Login() {
   

    const [newUser, setNewUser] =useState(false);
    const [user,setUser] = useState({
    isSignedIn :false,
    name : '',
    email:'',
    photo:'',
    password:'',
    error:'',
    success:false,
  
  });
  const provider = new firebase.auth.GoogleAuthProvider();
  var fbProvider = new firebase.auth.FacebookAuthProvider();
  const handleSignIn = () => {
    firebase.auth().signInWithPopup(provider)
    .then(res=>{
      const {displayName,email,photoURL} = res.user;
      const isSignedInUser = {
        isSignedIn:true,
        name:displayName,
        email:email,
       
        photo:photoURL,

      }
      setUser(isSignedInUser);
      console.log(displayName,email,photoURL);
    })
    .catch(err=>{
      console.log(err);
      console.log(err.message);
    })
  }

  const [loggedInUser,setLoggedInUser] = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  let { from } = location.state || { from: { pathname: "/" } };

  const handleSignOut = () => {
    firebase.auth().signOut()
    .then(res=>{
      const signedOutUser = ({
        isSignedIn:false,
        name:'',
        phone:'',
        email:'',

      })
      setUser(signedOutUser);
      console.log(res);
    })
    .catch(err =>{
      console.log(err);
    })
  }
  const handleSubmit=(e) =>{
    if( newUser && user.email && user.password){
      
       firebase.auth().createUserWithEmailAndPassword(user.email, user.password)

      .then(res=>{
        const newUserInfo = {...user};
      newUserInfo.error = '';
      newUserInfo.success = true;
        setUser(newUserInfo);
        updateUserName(user.name);
      })
      .catch((error)=> {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode,errorMessage);
        // ...
      });
    }

    if( !newUser && user.email && user.password){
      firebase.auth().signInWithEmailAndPassword(user.email, user.password)
      .then(res => {
        const newUserInfo = {...user};
        newUserInfo.error = '';
        newUserInfo.success = true;
          setUser(newUserInfo);
          setLoggedInUser(newUserInfo);
          history.replace(from);
          console.log('sign in User Info',res.user);
      })
      .catch(error=> {
        // Handle Errors here.
        const newUserInfo = {...user};
        newUserInfo.error = error.message;
        newUserInfo.success = false;
        setUser(newUserInfo);
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode,errorMessage);
        // ...
      });
    }
    e.preventDefault();
  }

  const handleBlur = (e) =>{
    let isFeildValid=true;
    if(e.target.name === 'email'){
      isFeildValid = /^\S+@\S+$/.test(e.target.value);
     
    }
    if(e.target.name === 'password'){
      const isPasswordValid = e.target.value.length>6;
      const passwordHasNumber = /\d{1}/.test(e.target.value);
      isFeildValid = (isPasswordValid && passwordHasNumber);
    }
    if(isFeildValid){
        const newUserInfo = {...user};
        newUserInfo[e.target.name] = e.target.value;
        setUser(newUserInfo);
    }
  }

  const updateUserName = (name) => {
    const user = firebase.auth().currentUser;

    user.updateProfile({
      displayName: name,
    }).then(()=> {
      console.log('user name updated succesfully');
      // Update successful.
    }).catch((error)=> {
      // An error happened.
      console.log(error);
    });
  } 
  const handleFbLogIn = () => {
    firebase.auth().signInWithPopup(fbProvider).then((result) => {
      // This gives you a Facebook Access Token. You can use it to access the Facebook API.
      var token = result.credential.accessToken;
      // The signed-in user info.
      var user = result.user;
      // ...
    }).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
      // The email of the user's account used.
      var email = error.email;
      // The firebase.auth.AuthCredential type that was used.
      var credential = error.credential;
      // ...
    });
  }

  return (
   <div style={{marginTop:'150px', textAlign:'center'}}>
     
    {
      user.isSignedIn ? <button onClick={handleSignOut} className="btn btn-primary">Sign out</button>
      :
     <button onClick={handleSignIn} className="btn btn-primary">Sign in</button>
    }
    <br/>
    <button onClick={handleFbLogIn} className="btn btn-success">Log in Using Facebook</button>
     {
       user.isSignedIn &&<div> <h1>Welcome <img style={{borderRadius:'50%', width:'100px', height:'100px'}} src={user.photo} alt=""/> {user.name} To this Finance Project.</h1> 
       <p>Your Email:{user.email}</p>
       
       

       </div>
     }
     <h1>Our Own Authentication </h1>
     <input type="checkbox" onChange={()=> setNewUser(!newUser)} name="newUser" id="newUser"/>
     <label htmlFor="newUser">New User Sign Up</label>
    <form onSubmit ={handleSubmit} action="">
    {newUser && <input type="text" name="name" onBlur={handleBlur} placeholder="Your Name"/>}<br/>
    <input type="text" name="email" onBlur={handleBlur} placeholder="Your Email Address" required/><br/>
     <input type="password" onBlur={handleBlur} placeholder="password" name="password" required/><br/>
     <input type="submit" value={newUser ? 'Sign Up' : 'Sign In'}/>
    </form>
    <p style={{color:'red',background:'black'}}>{user.error}</p>
     {
       user.success && <h1 style={{color:'green'}}>User { newUser ? 'Created' : 'logged in'} Successfully done by you. Thank you very much...</h1>
     }
    </div>
  );
}

export default Login;
