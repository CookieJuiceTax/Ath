function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
loadCSS("https://cookiejuicetax.github.io/Poan/style.css"); 

function loadScript(src, callback) {
  const script = document.createElement("script");
  script.type = "text/javascript"; 
  script.src = src;
  if (callback) { 
    script.onload = callback;
  }
  script.onerror = () => console.error(`Error loading script: ${src}`); 
  document.head.appendChild(script);
}

// This is jQuery's document ready. It's fine for DOM manipulation like removing ui-bar.
// The Firebase SDK loading will also start from here.
$(function () {
  $('#ui-bar').remove();
  $(document.head).find('#style-ui-bar').remove();

  const firebaseAppURL = "https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js";
  const firebaseAuthURL = "https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"; 
  const firebaseFirestoreURL = "https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js";

  // This nested loading ensures SDKs are loaded in order before initializing Firebase
  loadScript(firebaseAppURL, function () {
    console.log("Firebase App SDK loaded.");
    loadScript(firebaseAuthURL, function () {
      console.log("Firebase Auth SDK loaded.");
      loadScript(firebaseFirestoreURL, function () {
        console.log("Firebase Firestore SDK loaded.");
        // All Firebase SDKs are loaded, now initialize
        initializeFirebaseAndAuth(); // This is where Firebase gets set up
      });
    });
  });
});

function initializeFirebaseAndAuth() {
  const firebaseConfig = {
    apiKey: "AIzaSyDs1Vy6K8HJJR4SdiziVRDx9h0pN4hv94g", // Your actual API key
    authDomain: "poan-57f54.firebaseapp.com",
    projectId: "poan-57f54",
    messagingSenderId: "860885646745",
    appId: "1:860885646745:web:d5fcc385e3c85f78336708"
  };

  try {
    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    } else {
      firebase.app(); 
    }
    
    window.auth = firebase.auth();    
    window.db = firebase.firestore();   
    
    console.log("✅ Firebase App, Auth, and Firestore initialized successfully in main.js");

    // <<< NEW PART: Signal to Twine that main.js is ready >>>
    if (typeof window.onMyGameScriptsReady === 'function') {
      console.log("main.js: Calling window.onMyGameScriptsReady()...");
      window.onMyGameScriptsReady(); // Call the callback defined by Twine
    } else {
      // This might happen if Twine's StoryInit hasn't run yet to define the callback,
      // or if main.js is somehow loaded before StoryInit sets up the callback.
      // The Twine part should define this first.
      console.warn("main.js: Twine callback 'onMyGameScriptsReady' not found yet. This might be okay if StoryInit runs after this log.");
    }
    // <<< END NEW PART >>>

  } catch (error) {
    console.error("Firebase initialization failed in main.js:", error);
    // <<< NEW PART: Signal error to Twine >>>
    if (typeof window.onMyGameScriptsError === 'function') {
      window.onMyGameScriptsError("Firebase init failed: " + error.message);
    }
    // <<< END NEW PART >>>
  }
}

// Initial black overlay fade-in (your existing code)
// This $(document).ready might run before or after the one that loads Firebase,
// which is generally fine for independent UI effects.
$(document).ready(function () {
  if (!window.initialFadeDone) { 
    const overlay = document.createElement("div");
    overlay.id = "black-covers-everything-disable-clicking-3s-fadein";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100%";
    overlay.style.height = "100%";
    overlay.style.backgroundColor = "black";
    overlay.style.zIndex = "9999";
    overlay.style.transition = "opacity 3s ease-out";
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.style.opacity = "0";
      setTimeout(() => {
        overlay.remove();
        window.initialFadeDone = true; 
      }, 3000);
    }, 100);
  }
});

// Your MyGameLogin object (This is the code I provided previously, it should be here)
window.MyGameLogin = {
  signInWithGoogle: async function() {
    if (!window.auth) throw new Error("Firebase Auth not ready.");
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      const result = await window.auth.signInWithPopup(provider);
      const user = result.user; 
      const additionalUserInfo = result.additionalUserInfo; 

      let profileData;
      let isNewFirestoreProfile = false;
      
      const userDocRef = window.db.collection("users").doc(user.uid);
      const userDocSnap = await userDocRef.get();

      if (!userDocSnap.exists || additionalUserInfo.isNewUser) { 
        console.log("New user or missing profile. Creating/updating profile for Google user:", user.uid, user.email);
        isNewFirestoreProfile = true;
        profileData = {
          email: user.email, 
          googleDisplayName: user.displayName || "",
          googlePhotoURL: user.photoURL || "",
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        };
        await userDocRef.set(profileData, { merge: true });
      } else {
        console.log("Existing user signed in with Google:", user.uid, user.email);
        profileData = userDocSnap.data();
      }
      return { 
        uid: user.uid, 
        email: user.email, 
        displayName: user.displayName,
        isNewFirestoreProfile: isNewFirestoreProfile,
        profileData: profileData
      };
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      if (error.code === 'auth/popup-closed-by-user') {
        throw new Error("Sign-in popup closed before completion.");
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        throw new Error("An account already exists with this email using a different sign-in method.");
      }
      throw new Error("Google Sign-In failed. Please try again.");
    }
  },

  signOut: async function() {
    // ... (signOut function code as provided before) ...
    if (!window.auth) throw new Error("Firebase Auth not ready.");
    try {
      await window.auth.signOut();
      console.log("User signed out from Firebase.");
    } catch (error) {
      console.error("Sign Out Error:", error);
      throw new Error("Sign out failed.");
    }
  },

  checkAuthState: function(callback) {
    // ... (checkAuthState function code as provided before) ...
    if (!window.auth || !window.db) {
      console.warn("Firebase (Auth or DB) not fully ready for auth state check. Retrying in 250ms...");
      setTimeout(() => MyGameLogin.checkAuthState(callback), 250); // Use MyGameLogin here
      return;
    }
    
    window.auth.onAuthStateChanged(async (user) => {
      if (user) { 
        try {
          const userDocRef = window.db.collection("users").doc(user.uid);
          const userDocSnap = await userDocRef.get();

          if (userDocSnap.exists()) {
            const playerData = { uid: user.uid, ...userDocSnap.data() };
            console.log("Auth State Changed: User is logged in. Profile found:", user.email);
            callback({ loggedIn: true, player: playerData });
          } else {
            console.warn("Auth State Changed: User logged in (UID:", user.uid, ") but no Firestore profile. Creating basic one.");
            const basicProfile = {
                email: user.email,
                googleDisplayName: user.displayName || "",
                googlePhotoURL: user.photoURL || "",
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            };
            await userDocRef.set(basicProfile, {merge: true});
            callback({ loggedIn: true, player: {uid: user.uid, ...basicProfile} });
          }
        } catch (dbError) {
          console.error("Error fetching user profile during auth state check:", dbError);
          callback({ loggedIn: false, player: null, error: "Could not load your game profile." });
        }
      } else { 
        console.log("Auth State Changed: User is not logged in.");
        callback({ loggedIn: false, player: null });
      }
    });
  }
};
