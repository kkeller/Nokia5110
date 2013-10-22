var lcd = require('Nokia5110');
var http = require('http');
var b = require('bonescript');

var TMP36 = "P9_39";

lcd.PIN_SDIN = "P9_21";
lcd.PIN_SCLK = "P9_22";
lcd.PIN_SCE = "P9_23";
lcd.PIN_DC = "P9_24";
lcd.PIN_RESET = "P9_25";
lcd.setup();
lcd.clear();
lcd.gotoXY(0, 0);
lcd.string("Temp:");
lcd.gotoXY(0, 2);
lcd.string("I3 status:");

setInterval(readTMP, 3000);
doI3Request();
setInterval(doI3Request, 60000);

function readTMP() {
    b.analogRead(TMP36, onReadTMP);
}

function onReadTMP(x) {
    var millivolts = x.value * 1800;
    var tempC = (millivolts - 500) / 10;
    var tempF = (tempC * 9/5) + 32;
    lcd.gotoXY(40, 0);
    lcd.string(tempF.toFixed(1));
}


var previousSpaceStatus = "";
function doI3Request() {
  var req = http.get({hostname:'www.i3detroit.org'}, i3Request);
  req.on('error', function(e) {
    console.log('Problem with request: ' + e.message);
    lcd.gotoXY(0, 3);
    lcd.string("N/A  ");
  });

  var page = "";
  function i3Request(res) {
    if(res.statusCode != 200) {
      console.log('STATUS: ' + res.statusCode);
      console.log('HEADERS: ' + JSON.stringify(res.headers));
      lcd.gotoXY(0, 3);
      lcd.string("N/A  ");
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
        console.log('SPACE: ' + space[1]);
        previousSpaceStatus = space[1];
        var showSpace = (space[1].match(/(open|closed)/i))[0];
        while(showSpace.length < 5) {
            showSpace = showSpace + " ";
        }
        lcd.gotoXY(0, 3);
        lcd.string(showSpace);
      }
    }
  }
}
