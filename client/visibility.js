//heavy influence: https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API

function Visibility(){
  this.hidden = null
  this.visibilityChange = null
  this.initControls()
}

Visibility.prototype.initControls = function() {
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    this.hidden = "hidden";
    this.visibilityChange = "visibilitychange";
  } else if (typeof document.mozHidden !== "undefined") {
    this.hidden = "mozHidden";
    this.visibilityChange = "mozvisibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    this.hidden = "msHidden";
    this.visibilityChange = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    this.hidden = "webkitHidden";
    this.visibilityChange = "webkitvisibilitychange";
  }
}
