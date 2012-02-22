//
// Copyright (C) 2012 - Cabin Programs, Ken Keller
// 
// Some code derived from example code at: http://www.arduino.cc/playground/Code/PCD8544
// and http://blog.stuartlewis.com/2011/02/12/scrolling-text-with-an-arduino-and-nokia-5110-screen/
//

var bb = require('./bonescript');

//
//  Must define the following outputs in your program to use LCD_5110.js
//
//     PIN_SCLK  = exports.PIN_SCLK  = bone.P?_?;
//     PIN_SDIN  = exports.PIN_SDIN  = bone.P?_?;
//     PIN_DC    = exports.PIN_DC    = bone.P?_?;
//     PIN_SCE   = exports.PIN_SCE   = bone.P?_?;
//     PIN_RESET = exports.PIN_RESET = bone.P?_?;
//

//
//  used in lcdInverse(mode)
//
LCD_INVERSE = exports.LCD_INVERSE = 0;
LCD_NORMAL = exports.LCD_NORMAL = 1;

//
// used internally - size of display in pixels
//
LCD_X = exports.LCD_X = 84;
LCD_Y = exports.LCD_Y = 48;

//
// used in: lcdWrite(command, data)
//
LCD_COMMAND = exports.LCD_COMMAND = 0;
LCD_DATA = exports.LCD_DATA = 1;

//
// used in: shiftOut(dataPin, clockPin, bitOrder, val)
//
LSBFIRST = 1;
MSBFIRST = 0;

//
// shiftOut(dataPin, clockPin, bitOrder, val)
//
shiftOut = function(dataPin, clockPin, bitOrder, val)
{
  var i;
  var bit;
  for (i = 0; i < 8; i++)  
  {
    if (bitOrder == LSBFIRST) 
    {
         bit = val & (1 << i);
    } else
    {
         bit = val & (1 << (7 - i));
    }

    digitalWrite(dataPin, bit);
    digitalWrite(clockPin, HIGH);
    digitalWrite(clockPin, LOW);            
  }
};

//
// lcdSetup ()
//     reset lcd ancd set up set up display contrast and bias
//
lcdSetup = exports.lcdSetup = function() 
{
    pinMode(PIN_SCLK, OUTPUT);
    pinMode(PIN_SDIN, OUTPUT);
    pinMode(PIN_DC, OUTPUT);
    pinMode(PIN_SCE, OUTPUT);
    pinMode(PIN_RESET, OUTPUT);

    //Reset the LCD to a known state
    digitalWrite(PIN_RESET, LOW);
    digitalWrite(PIN_RESET, HIGH);

    lcdWrite(LCD_COMMAND, 0x21); 
    lcdWrite(LCD_COMMAND, 0xB1); 
    lcdWrite(LCD_COMMAND, 0x04); 
    lcdWrite(LCD_COMMAND, 0x15); 

    lcdWrite(LCD_COMMAND, 0x20); 
    lcdWrite(LCD_COMMAND, 0x0C); 

};

//
// lcdWrite(dataORcommand, data)
//      Write dataor command to lcd
//
lcdWrite = exports.lcdWrite = function(dataORcommand, data) 
{
    digitalWrite(PIN_DC, dataORcommand); //Tell the LCD that we are writing either to data or a command

    //Send the data
    digitalWrite(PIN_SCE, LOW);
    shiftOut(PIN_SDIN, PIN_SCLK, MSBFIRST, data);
    digitalWrite(PIN_SCE, HIGH);
};

//
// lcdGotoXY( column,  row)
//     set current lcd position to row/column
//
lcdGotoXY = exports.lcdGotoXY = function( x,  y) 
{
   lcdWrite(LCD_COMMAND, 0x80 | x);  // Column
   lcdWrite(LCD_COMMAND, 0x40 | y);  // Row
};

//
// lcdInverse(mode)
//    turn inverse mode on or off
//
lcdInverse = exports.lcdInverse = function(invert)
{
    if (invert == LCD_INVERSE)
    {
        lcdWrite(LCD_COMMAND, 0x0D);  //set inverse mode
    } else
    {
        lcdWrite(LCD_COMMAND, 0x0C);  //set normal mode
    }
};

//
// lcdBitmap(array)
//    send bitmap to LCD at current position
//
lcdBitmap = exports.lcdBitmap = function(array)
{
  var index;
  var amt = (LCD_X * LCD_Y ) / 8;
  if (array.length < amt) amt = array.length;
  for (index = 0 ; index < amt ; index++)
     lcdWrite(LCD_DATA, array[index]);
};


//
// lcdCharacter(char)
//    outputs ASCII char (0x20 - 0x7f) at current position
//
lcdCharacter = exports.lcdCharacter = function(character) 
{
  var index;
  var char;

  char = character.charCodeAt(0);

  if (char != 0x7f) lcdWrite(LCD_DATA, 0x00); //Blank vertical line padding
     else lcdWrite(LCD_DATA, 0xff);           // make total black pixel

  for ( index = 0 ; index < 5 ; index++)
     lcdWrite(LCD_DATA, ascii[((char-0x20)*5)+index]);

  if (char != 0x7f) lcdWrite(LCD_DATA, 0x00); //Blank vertical line padding
     else lcdWrite(LCD_DATA, 0xff);           // make total black pixel
};

//
// lcdString(string)
//    outputs ASCII string (0x20 - 0x7f) at current position
//
lcdString = exports.lcdString = function(characters) 
{
  var index;
  for ( index = 0 ; index < characters.length ; index++)
  {
      lcdCharacter(characters[index]);
  }
};

//
// lcdClear()
//     clears lcd by sending spaces to the entire display
//     leaves current position at (0,0)
//
lcdClear = exports.lcdClear = function() 
{
  var index;
  var amt;
  lcdGotoXY(0, 0);
  amt = (LCD_X * LCD_Y ) / 8
  for (index = 0 ; index < amt ; index++)
     lcdWrite(LCD_DATA, 0x00);
  lcdGotoXY(0, 0);     //Always start at home
};

//
//  Scroll routines:   (scrolls happen on one row between (4,row) and (82,row)
//      lcdScrollInit(row)  -  clears the scroll area and init local vars
//      lcdScroll(row, string)  -  scrolls string one char, repeat call to scroll again
//      lcdScrollLength(string) - returns number to scroll string one time off screen
//

var scrollPosition = [-10, -10, -10, -10, -10, -10] ;   // internal storage for scroll routines

lcdScrollLength = exports.lcdScrollLength = function(array)
{
    return (array.length +10);
};

lcdScrollInit = exports.lcdScrollInit = function(row)
{
  var i;
  lcdGotoXY(4,row);
  scrollPosition[row] = -10;
  for (i=0; i<11; i++)
      lcdCharacter(' ');
};

lcdScroll = exports.lcdScroll = function( row ,message )
{
  var i;
  lcdGotoXY(4,row);
  for (i = scrollPosition[row]; i < scrollPosition[row] + 11; i++)
  {
    if ((i >= message.length) || (i < 0))
    {
      lcdCharacter(' ');
    }
    else
    {
      lcdCharacter(message.charAt(i));
    }
  }
  scrollPosition[row]++;
  if ((scrollPosition[row] >= message.length) && (scrollPosition[row] > 0))
  {
    scrollPosition[row] = -10;
  }
};

//
//  Progress Bar Routines
//      lcdProgressInit(row)  -  clears the scroll area and init local vars
//      lcdProgressBar(row, value)  -  draws a progress bar of value length
//                                     value from 0 to 100
//
var curProgress = [0,0,0,0,0,0];   // internal storage for progress bar routines
lcdProgressInit = exports.lcdProgressInit = function (row)
{
    var index;
    lcdGotoXY(0,row);
    for(index = 0; index<12; index++)
        lcdCharacter(' ');
    curProgress[row] = 0;
};

lcdProgressBar = exports.lcdProgressBar = function (row, value)
{
    var index;

    value = Math.floor((80*value)/100);

    if (value>80) value = 80;
      else if (value<0) value =0;
    
    lcdGotoXY(2,row);
    if (value > curProgress[row])
    {
       lcdGotoXY(2+curProgress[row],row);
       for(index = curProgress[row]; index < value; index++)
          lcdWrite(LCD_DATA, 0x7e);
    } else if (value < curProgress[row])
    {
       lcdGotoXY(2+value,row);
       for(index = value; index<curProgress[row]; index++)
          lcdWrite(LCD_DATA, 0x00);
    }

    curProgress[row] = value;
};

//
// ASCII bitmaps...
//
var ascii =  [
   0x00, 0x00, 0x00, 0x00, 0x00 // 20  
  ,0x00, 0x00, 0x5f, 0x00, 0x00 // 21 !
  ,0x00, 0x07, 0x00, 0x07, 0x00 // 22 "
  ,0x14, 0x7f, 0x14, 0x7f, 0x14 // 23 #
  ,0x24, 0x2a, 0x7f, 0x2a, 0x12 // 24 $
  ,0x23, 0x13, 0x08, 0x64, 0x62 // 25 %
  ,0x36, 0x49, 0x55, 0x22, 0x50 // 26 &
  ,0x00, 0x05, 0x03, 0x00, 0x00 // 27 '
  ,0x00, 0x1c, 0x22, 0x41, 0x00 // 28 (
  ,0x00, 0x41, 0x22, 0x1c, 0x00 // 29 )
  ,0x14, 0x08, 0x3e, 0x08, 0x14 // 2a *
  ,0x08, 0x08, 0x3e, 0x08, 0x08 // 2b +
  ,0x00, 0x50, 0x30, 0x00, 0x00 // 2c ,
  ,0x08, 0x08, 0x08, 0x08, 0x08 // 2d -
  ,0x00, 0x60, 0x60, 0x00, 0x00 // 2e .
  ,0x20, 0x10, 0x08, 0x04, 0x02 // 2f /
  ,0x3e, 0x51, 0x49, 0x45, 0x3e // 30 0
  ,0x00, 0x42, 0x7f, 0x40, 0x00 // 31 1
  ,0x42, 0x61, 0x51, 0x49, 0x46 // 32 2
  ,0x21, 0x41, 0x45, 0x4b, 0x31 // 33 3
  ,0x18, 0x14, 0x12, 0x7f, 0x10 // 34 4
  ,0x27, 0x45, 0x45, 0x45, 0x39 // 35 5
  ,0x3c, 0x4a, 0x49, 0x49, 0x30 // 36 6
  ,0x01, 0x71, 0x09, 0x05, 0x03 // 37 7
  ,0x36, 0x49, 0x49, 0x49, 0x36 // 38 8
  ,0x06, 0x49, 0x49, 0x29, 0x1e // 39 9
  ,0x00, 0x36, 0x36, 0x00, 0x00 // 3a :
  ,0x00, 0x56, 0x36, 0x00, 0x00 // 3b ;
  ,0x08, 0x14, 0x22, 0x41, 0x00 // 3c <
  ,0x14, 0x14, 0x14, 0x14, 0x14 // 3d =
  ,0x00, 0x41, 0x22, 0x14, 0x08 // 3e >
  ,0x02, 0x01, 0x51, 0x09, 0x06 // 3f ?
  ,0x32, 0x49, 0x79, 0x41, 0x3e // 40 @
  ,0x7e, 0x11, 0x11, 0x11, 0x7e // 41 A
  ,0x7f, 0x49, 0x49, 0x49, 0x36 // 42 B
  ,0x3e, 0x41, 0x41, 0x41, 0x22 // 43 C
  ,0x7f, 0x41, 0x41, 0x22, 0x1c // 44 D
  ,0x7f, 0x49, 0x49, 0x49, 0x41 // 45 E
  ,0x7f, 0x09, 0x09, 0x09, 0x01 // 46 F
  ,0x3e, 0x41, 0x49, 0x49, 0x7a // 47 G
  ,0x7f, 0x08, 0x08, 0x08, 0x7f // 48 H
  ,0x00, 0x41, 0x7f, 0x41, 0x00 // 49 I
  ,0x20, 0x40, 0x41, 0x3f, 0x01 // 4a J
  ,0x7f, 0x08, 0x14, 0x22, 0x41 // 4b K
  ,0x7f, 0x40, 0x40, 0x40, 0x40 // 4c L
  ,0x7f, 0x02, 0x0c, 0x02, 0x7f // 4d M
  ,0x7f, 0x04, 0x08, 0x10, 0x7f // 4e N
  ,0x3e, 0x41, 0x41, 0x41, 0x3e // 4f O
  ,0x7f, 0x09, 0x09, 0x09, 0x06 // 50 P
  ,0x3e, 0x41, 0x51, 0x21, 0x5e // 51 Q
  ,0x7f, 0x09, 0x19, 0x29, 0x46 // 52 R
  ,0x46, 0x49, 0x49, 0x49, 0x31 // 53 S
  ,0x01, 0x01, 0x7f, 0x01, 0x01 // 54 T
  ,0x3f, 0x40, 0x40, 0x40, 0x3f // 55 U
  ,0x1f, 0x20, 0x40, 0x20, 0x1f // 56 V
  ,0x3f, 0x40, 0x38, 0x40, 0x3f // 57 W
  ,0x63, 0x14, 0x08, 0x14, 0x63 // 58 X
  ,0x07, 0x08, 0x70, 0x08, 0x07 // 59 Y
  ,0x61, 0x51, 0x49, 0x45, 0x43 // 5a Z
  ,0x00, 0x7f, 0x41, 0x41, 0x00 // 5b [
  ,0x02, 0x04, 0x08, 0x10, 0x20 // 5c \
  ,0x00, 0x41, 0x41, 0x7f, 0x00 // 5d ]
  ,0x04, 0x02, 0x01, 0x02, 0x04 // 5e ^
  ,0x40, 0x40, 0x40, 0x40, 0x40 // 5f _
  ,0x00, 0x01, 0x02, 0x04, 0x00 // 60 `
  ,0x20, 0x54, 0x54, 0x54, 0x78 // 61 a
  ,0x7f, 0x48, 0x44, 0x44, 0x38 // 62 b
  ,0x38, 0x44, 0x44, 0x44, 0x20 // 63 c
  ,0x38, 0x44, 0x44, 0x48, 0x7f // 64 d
  ,0x38, 0x54, 0x54, 0x54, 0x18 // 65 e
  ,0x08, 0x7e, 0x09, 0x01, 0x02 // 66 f
  ,0x0c, 0x52, 0x52, 0x52, 0x3e // 67 g
  ,0x7f, 0x08, 0x04, 0x04, 0x78 // 68 h
  ,0x00, 0x44, 0x7d, 0x40, 0x00 // 69 i
  ,0x20, 0x40, 0x44, 0x3d, 0x00 // 6a j 
  ,0x7f, 0x10, 0x28, 0x44, 0x00 // 6b k
  ,0x00, 0x41, 0x7f, 0x40, 0x00 // 6c l
  ,0x7c, 0x04, 0x18, 0x04, 0x78 // 6d m
  ,0x7c, 0x08, 0x04, 0x04, 0x78 // 6e n
  ,0x38, 0x44, 0x44, 0x44, 0x38 // 6f o
  ,0x7c, 0x14, 0x14, 0x14, 0x08 // 70 p
  ,0x08, 0x14, 0x14, 0x18, 0x7c // 71 q
  ,0x7c, 0x08, 0x04, 0x04, 0x08 // 72 r
  ,0x48, 0x54, 0x54, 0x54, 0x20 // 73 s
  ,0x04, 0x3f, 0x44, 0x40, 0x20 // 74 t
  ,0x3c, 0x40, 0x40, 0x20, 0x7c // 75 u
  ,0x1c, 0x20, 0x40, 0x20, 0x1c // 76 v
  ,0x3c, 0x40, 0x30, 0x40, 0x3c // 77 w
  ,0x44, 0x28, 0x10, 0x28, 0x44 // 78 x
  ,0x0c, 0x50, 0x50, 0x50, 0x3c // 79 y
  ,0x44, 0x64, 0x54, 0x4c, 0x44 // 7a z
  ,0x00, 0x08, 0x36, 0x41, 0x00 // 7b {
  ,0x00, 0x00, 0x7f, 0x00, 0x00 // 7c |
  ,0x00, 0x41, 0x36, 0x08, 0x00 // 7d }
  ,0x10, 0x08, 0x08, 0x10, 0x08 // 7e ~
  ,0xff, 0xff, 0xff, 0xff, 0xff] // 7f (filled block)


