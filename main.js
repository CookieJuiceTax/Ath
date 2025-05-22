function loadCSS(href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

loadCSS("https://cookiejuicetax.github.io/Poan/style.css");

$('#ui-bar').remove();
$(document.head).find('#style-ui-bar').remove();
