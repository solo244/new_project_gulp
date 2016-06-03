(function ($) {

    /*
     * Vars
     */
    var $body = $("html, body");

    /*
     * OMG, it's a function
     */
    function started(e){
      var $this = $(this);
      console.log("File main.js is loaded");
    }

    /*
     * Let's get ready to rumble
     */
    $(document).ready(function(){
      // instantiate
      $body.on("click", started);
    });

})(jQuery);
