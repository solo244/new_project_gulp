(function () {
  const $body = $("body");

  function started() {
    console.log("File main.js is loaded");
  }

  (function init() {
    $body.on("click", started);
  })();
})();
