// Called when the user clicks on the browser action.
var bkg = chrome.extension.getBackgroundPage();

// Utility class to format a string
String.format = function() {
  var s = arguments[0];
  for (var i = 0; i < arguments.length - 1; i++) {       
      var reg = new RegExp("\\{" + i + "\\}", "gm");             
      s = s.replace(reg, arguments[i + 1]);
  }
  return s;
}

// extract arXiv paper id from a URL
function extractPaperId(url){
  url = url.substring(url.lastIndexOf('/')+1);
  if (url.includes('pdf')){
    url = url.replace(/\.[^/.]+$/, "")
  }
  return url
}

chrome.runtime.onInstalled.addListener(function(){
  var context = "selection";
  var title = "Get Description of current paper";
  var id = chrome.contextMenus.create({
    "title": title,
    "contexts": [context],
    "id": "context" + context
  });
})

chrome.contextMenus.onClicked.addListener(onClickHandler); 

function copyToClipboard(resp) {
  var responseJSON = JSON.parse(resp);
  var title = responseJSON['title']
  var author = "";
  for (var i=0; i<responseJSON['authors'].length; i++) {
    author = author + responseJSON['authors'][i]["name"];
    if (i != responseJSON['authors'].length - 1) {
      author = author + ", "
    }
  };
  var venue = responseJSON['venue'];
  var year = responseJSON['year'];
  var url = "https://arxiv.org/abs/" + responseJSON['arxivId'];

  var formatted_response = String.format("{0}\n{4}\n{1}\n{2}-{3}", title, author, venue, year, url);
  // No tabs or host permissions needed!
  var copyFrom = document.createElement("textarea");

  //Set the text content to be the text you wished to copy.
  copyFrom.textContent = formatted_response; 

  document.body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  copyFrom.blur();
  document.body.removeChild(copyFrom);
}

function onClickHandler(info, tab) {
  var sText = "https://api.semanticscholar.org/v1/paper/arXiv:" + extractPaperId(info.selectionText);

  const Http = new XMLHttpRequest();
  Http.open("GET", sText);
  Http.send();

  Http.onreadystatechange=function(){
    if(this.readyState==4 && this.status==200){
      bkg.console.log(Http.responseText)
        copyToClipboard(Http.responseText);
      }
  }
};

chrome.commands.onCommand.addListener(function(command) {
  console.log('onCommand event received for message: ', command);
  chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
  }, function(tabs) {
      // and use that tab to fill in out title and url
      var tab = tabs[0];
      var sText = "https://api.semanticscholar.org/v1/paper/arXiv:" + extractPaperId(tab.url);

        const Http = new XMLHttpRequest();
        Http.open("GET", sText);
        Http.send();

        Http.onreadystatechange=function(){
          if(this.readyState==4 && this.status==200){
            bkg.console.log(Http.responseText)
              copyToClipboard(Http.responseText);
            }
        }
  });
});

chrome.browserAction.onClicked.addListener(function(tab) {
  chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
  }, function(tabs) {
      // and use that tab to fill in out title and url
      var tab = tabs[0];
      var sText = "https://api.semanticscholar.org/v1/paper/arXiv:" + extractPaperId(tab.url);

        const Http = new XMLHttpRequest();
        Http.open("GET", sText);
        Http.send();

        Http.onreadystatechange=function(){
          if(this.readyState==4 && this.status==200){
            bkg.console.log(Http.responseText)
              copyToClipboard(Http.responseText);
            }
        }
  });
});
