HISTORY:
========
21 Feb 2012: Initial edit and release

SUMMARY:
========
This is a set of bonescript files that where written to control a
Nokia 5110 LCD display from Adafruit.

      http://www.adafruit.com/products/338


USE:
====

1) Download the LCD_51100.js file and put it at the same level as the calling program.
2) To use these routines, put the following in your program:

	var lcd = require('./LCD_5110.js');

3) Define the digital outputs used to control the LCD:

	PIN_SCLK  = exports.PIN_SCLK  = bone.P?_?;
	PIN_SDIN  = exports.PIN_SDIN  = bone.P?_?;
	PIN_DC    = exports.PIN_DC    = bone.P?_?;
	PIN_SCE   = exports.PIN_SCE   = bone.P?_?;
	PIN_RESET = exports.PIN_RESET = bone.P?_?;

4) Call lcdSetup() in your setup function:

	lcdSetup();

FUNCTIONS:
==========

//
// lcdSetup ()
//     reset lcd ancd set up set up display contrast and bias
//
//
// lcdWrite(dataORcommand, data)
//      Write dataor command to lcd
//
//
// lcdGotoXY( column,  row)
//     set current lcd position to row/column
//
//
// lcdInverse(mode)
//    turn inverse mode on or off
//
//
// lcdBitmap(array)
//    send bitmap to LCD at current position
//
//
// lcdCharacter(char)
//    outputs ASCII char (0x20 - 0x7f) at current position
//
//
// lcdString(string)
//    outputs ASCII string (0x20 - 0x7f) at current position
//
//
// lcdClear()
//     clears lcd by sending spaces to the entire display
//     leaves current position at (0,0)
//
//
//  Scroll routines:   (scrolls happen on one row between (4,row) and (82,row)
//      lcdScrollInit(row)  -  clears the scroll area and init local vars
//      lcdScroll(row, string)  -  scrolls string one char, repeat call to scroll again
//      lcdScrollLength(string) - returns number to scroll string one time off screen
//
//
//  Progress Bar Routines:  (Progress Bar happens between (2,row0 and (82,row)
//      lcdProgressInit(row)  -  clears the scroll area and init local vars
//      lcdProgressBar(row, value)  -  draws a progress bar of value length
//                                     value from 0 to 100
//

