function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}
loadCSS("https://cookiejuicetax.github.io/Poan/style.css");

function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.onload = callback;
  document.head.appendChild(script);
}

$(function () {
  $('#ui-bar').remove();
  $(document.head).find('#style-ui-bar').remove();

  loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js", function () {
    loadScript("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js", function () {
      const firebaseConfig = {
        apiKey: "AIzaSyBOGHmgo2Hc2j5f9rWMb1dYSNFuQWhcCuQ",
        authDomain: "poan-57f54.firebaseapp.com",
        projectId: "poan-57f54",
        messagingSenderId: "860885646745",
        appId: "1:860885646745:web:d5fcc385e3c85f78336708"
      };

      firebase.initializeApp(firebaseConfig);
      window.db = firebase.firestore();
      console.log("✅ Firebase initialized");
    });
  });
});
