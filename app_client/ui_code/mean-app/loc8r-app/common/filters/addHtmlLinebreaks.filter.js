(function() {

  /**
   * @ngdoc filter
   * @name addHtmlLineBreaks
   * @description filter for replacing line break with <br/>
   */
  function addHtmlLineBreaks() {
    return function(text) {
      var output = text.replace(/\n/g, '<br/>');
      return output;
    };
  }

  angular
    .module('loc8rApp')
    .filter('addHtmlLineBreaks', addHtmlLineBreaks);

})();
