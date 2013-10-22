var http = require('http');

doRequest();
setInterval(doRequest, 60000);

var previousSpaceStatus = "";
function doRequest() {
  var req = http.get({hostname:'www.i3detroit.org'}, i3Request);
  req.on('error', function(e) {
    console.log('Problem with request: ' + e.message);
  });

  var page = "";
  function i3Request(res) {
    if(res.statusCode != 200) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      return;
    }
    res.setEncoding('utf8');
    res.on('data', onData);
    res.on('end', onEnd);
  
    function onData(chunk) {
      page += chunk;
      //console.log('BODY: ' + chunk);
    }
  
    function onEnd() {
      var space = page.match(/The space is currently.*\n<span.*>(.*)<\/span>/mi);
      if(space.length != 2) {
        console.log("BODY doesn't contain space status: " + page);
        return;
      }
      if(space[1] != previousSpaceStatus) {
        previousSpaceStatus = space[1];
        var showSpace = (space[1].match(/(open|closed)/i))[0];
        while(showSpace.length < 5) {
            showSpace = showSpace + " ";
        }
        console.log('SPACE: ' + showSpace);
      }
    }
  }
}
