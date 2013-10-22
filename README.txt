HISTORY:
========
21 Feb 2012: Initial edit and release
22 Oct 2013: Updated for BoneScript 0.2.4

SUMMARY:
========
This is a set of bonescript files that where written to control a
Nokia 5110 LCD display from Adafruit or Sparkfun.

      http://www.adafruit.com/products/338
      https://www.sparkfun.com/products/10168


USE:
====

1) Download the LCD_5110.js file and put it at the same level as the calling program.
2) To use these routines, put the following in your program:

	var lcd = require('./LCD_5110.js');

3) Define the digital outputs used to control the LCD:

	lcd.PIN_SCLK  = "P?_?";
	lcd.PIN_SDIN  = "P?_?";
	lcd.PIN_DC    = "P?_?";
	lcd.PIN_SCE   = "P?_?";
	lcd.PIN_RESET = "P?_?";

4) Call setup():

	lcd.setup();

FUNCTIONS:
==========

//
// setup ()
//     reset lcd and set up set up display contrast and bias
//
//
// write(dataORcommand, data)
//      Write data or command to lcd
//
//
// gotoXY( column,  row)
//     set current lcd position to row/column
//
//
// inverse(mode)
//    turn inverse mode on or off
//
//
// bitmap(array)
//    send bitmap to LCD at current position
//
//
// character(char)
//    outputs ASCII char (0x20 - 0x7f) at current position
//
//
// string(string)
//    outputs ASCII string (0x20 - 0x7f) at current position
//
//
// clear()
//     clears lcd by sending spaces to the entire display
//     leaves current position at (0,0)
//
//
//  Scroll routines:   (scrolls happen on one row between (4,row) and (82,row)
//      scrollInit(row)  -  clears the scroll area and init local vars
//      scroll(row, string)  -  scrolls string one char, repeat call to scroll again
//      scrollLength(string) - returns number to scroll string one time off screen
//
//
//  Progress Bar Routines:  (Progress Bar happens between (2,row) and (82,row)
//      progressInit(row)  -  clears the scroll area and init local vars
//      progressBar(row, value)  -  draws a progress bar of value length
//                                     value from 0 to 100
//

