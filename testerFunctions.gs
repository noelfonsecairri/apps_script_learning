function createTrigger(){
  var ss = SpreadsheetApp.getActiveSpreadsheet()
//  var sheetId = ss.getSheetByName('Sheet1').getSheetId();
  ScriptApp.newTrigger("helloWorld").forSpreadsheet(ss).onOpen().create();
}

function helloWorld(){
  Logger.log("Hello World! Today is a good day!")
}

function tryGetHandlerFunction(){
  var triggers = ScriptApp.getProjectTriggers();
  var handlerFunction = triggers[0].getHandlerFunction();
  Logger.log(handlerFunction)
  if (handlerFunction == "helloWorld"){
    helloWorld();
  }
}

function trygetProjectTriggers() {
  Logger.log('Current project has ' + ScriptApp.getProjectTriggers().length + ' triggers.');
}

function tryGetTime(){
  var now = new Date();
  Logger.log(now.getTime())
}

function newDateTest(){
  var date = new Date();
  var newDate = new Date(date);
  Logger.log(date)
  Logger.log(newDate)
  
}

function subString(){
  var str = "hello world!"
  var response = str.substr(str.length-1)
  Logger.log(response)
}

function tryGetRange(){
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  sheet = ss.getSheetByName('Sheet6')
  var startCell = sheet.getRange(3, 2);
  startCellValue = startCell.getValue();
}

function myArrayLoop(){
  myArray = [1,2,3,4,5,6,7]
  Logger.log(typeof(myArray))
  for(var x in myArray){
    Logger.log(typeof(myArray))
  }
}




