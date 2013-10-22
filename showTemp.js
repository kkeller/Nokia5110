var lcd = require('./LCD_5110');
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
lcd.string("Temp: ");

setInterval(readTMP, 3000);

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
