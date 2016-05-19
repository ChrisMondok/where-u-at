//referencing https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
function getVisibility() {
  var visibility = {}
  if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
    visibility['hidden'] = "hidden"
    visibility['visibilityChange'] = "visibilitychange"
  } else if (typeof document.mozHidden !== "undefined") {
    visibility['hidden'] = "mozHidden"
    visibility['visibilityChange'] = "mozvisibilitychange";
  } else if (typeof document.msHidden !== "undefined") {
    visibility['hidden'] = "msHidden"
    visibility['visibilityChange'] = "msvisibilitychange";
  } else if (typeof document.webkitHidden !== "undefined") {
    visibility['hidden'] = "webkitHidden"
    visibility['visibilityChange'] = "webkitvisibilitychange";
  }
  return visibility
}

var visibilityParams = getVisibility()

function handleVisibilityChange(){
  if(document[hidden]) {
    stopWatchingPosition()
  }
  else {
    startWatchingPosition()
  }
}
