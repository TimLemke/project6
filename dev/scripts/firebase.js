import firebase from 'firebase';

  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyA57_QnJUsgaQ87pCR-eHUnBiwUL890VL0",
    authDomain: "microcue-e0afb.firebaseapp.com",
    databaseURL: "https://microcue-e0afb.firebaseio.com",
    projectId: "microcue-e0afb",
    storageBucket: "",
    messagingSenderId: "530114159133"
  };
  firebase.initializeApp(config);

  export default firebase;