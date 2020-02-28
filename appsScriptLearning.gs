function onEdit(evt){
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('myDataSource');
  var sheetName = sheet.getSheetName()
  var sheetData = sheet.getDataRange().getValue();
  var row = evt.range.getRow();
  var column = evt.range.getColumn();
  var cells = evt.range.getA1Notation();
  var dois = sheet.getRange(cells).getValues()
  //---------------------------------------------------------------------------------------------------------------------logs
  Logger.log(sheetData);
  Logger.log(sheetName)  
  Logger.log(evt.range.values)
  Logger.log(evt.range.columnStart)
  Logger.log(evt.range.columnEnd)
  Logger.log(evt.range.rowStart)
  Logger.log(evt.range.rowEnd)
  
  
  Logger.log('Something was edited, previous value was: ' + evt.oldValue);
  
  
  function assignForProcessing(){
    for(var x in dois){
      Logger.log(dois)
      var rightOfDoi = sheet.getRange(row, column + 1);
      if(dois[x] == '') { //this used to be if(dois[x] == '')
        rightOfDoi.setValue('')
        row++
        break
      } else {
        rightOfDoi.setValue('for processing')
        row++
      }
    }
  }
  
  if(
    sheetName == 'myDataSource' &&
    evt.range.columnStart == 1 &&
    evt.range.columnEnd <= 1 &&
    evt.range.rowStart <= 5000 &&
    evt.range.rowEnd <= 5000
  ){
    if(sheetData == ''){
      assignForProcessing();
      GenerateNewSet();
    } else {
      assignForProcessing();
      getProcessBatch();
      //scrapeMyDataSource();
    }
  }
  
  Logger.log(column + " and " + row);
  Logger.log(cells);
  Logger.log(row)
  Logger.log(dois)
  
}

function doiAuthorsVertical(the_doi) {
  //var the_doi = "10.1016/j.nbt.2013.04.004";
  //var the_doi = "10.1016/B978-0-12-814332-2.00011-3";
  //var the_doi = "10.13031/2013.31456";
  var url_string = "https://api.crossref.org/v1/works/" + the_doi;
  var response = UrlFetchApp.fetch(url_string);
  var content = response.getContentText();
  var json = JSON.parse(content);
  
  var authors = json['message']['author'];
  var all_authors = [];
  for(var x in authors){
    if(!('given' in authors[x])){
      all_authors.push(authors[x]['family']);
    } else if(authors[x]['sequence'] == 'first'){
      if(/\s/.test(authors[x]["given"])){
        all_authors.push(authors[x]['family'] + ', ' + authors[x]['given'])// + ' ' + authors[x]["given"][authors[x]["given"].indexOf(' ') + 1]);
      } else {
        all_authors.push(authors[x]['family'] + ', ' + authors[x]['given']);
      }      
    } else if(authors[x]['sequence'] == 'additional'){
      if(/\s/.test(authors[x]["given"])){
        all_authors.push(authors[x]['family'] + ', ' + authors[x]['given'])// + ' ' + authors[x]["given"][authors[x]["given"].indexOf(' ') + 1]);
      } else {
        all_authors.push(authors[x]['family'] + ', ' + authors[x]['given']);
      }
    }
  } 
  
  return all_authors
  
}

function onOpen() {
  var ui = SpreadsheetApp.getUi();
  var menu = ui.createMenu("Options");
  var items = menu.addItem("Load Authors", "scrapeMyDataSource");
  items.addToUi();
}

function loaderTest(){
  var x = 1;
  AuthorLoader(x)
}

function AuthorLoader(myRow) {
  //var sheet1value = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('myDataSource').getDataRange().getValues();
  var mySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('myDataSource');
  var sheet2 = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2')
  //sheet2.clear()
  var y = 1;
  var mySheetDoi = mySheet.getRange(myRow, 1).getValue();
  Logger.log(mySheetDoi)
 
  //for(var x = 0; x < sheet1value.length; x++){
  sheet2.appendRow([mySheetDoi]);
  var authorArray = doiAuthorsVertical(mySheetDoi);
  var sheet2LastRow = sheet2.getLastRow(); 
  
  for (var z = 0; z < authorArray.length; z++) {
    var duodata =  [[mySheetDoi,authorArray[z]]];
    sheet2.getRange(sheet2LastRow + z, 1,duodata.length, duodata[0].length).setValues(duodata);      
    }
  mySheet.getRange(myRow, 2).setValue('done');
    //var y = sheet2.getLastRow() + 1;
  //}  
}


//---------------------------------------------------------------------------------------------------------------------Melchor's code

function GenerateNewSet(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var triggers = ScriptApp.getProjectTriggers();
  if(triggers.length > 0){
    for(var i = 0; i < triggers.length; i ++){
      var handlerFunction = triggers[i].getHandlerFunction();
      if(handlerFunction == "helloWorld"){
        ScriptApp.deleteTrigger(triggers[i])
      }
    }
  } 
  
  scriptProperties.setProperty("runCount", 0);
  scriptProperties.setProperty("triggerId", 0);
  scriptProperties.setProperty("rowList", 0);
  scriptProperties.setProperty("rowCount", 0);
  scriptProperties.setProperty("interval", 60);
  scriptProperties.setProperty("maxTimeout", 300000);
  scriptProperties.setProperty("lastDocumentId", '');
  
  getProcessBatch();
  
  var rowList = scriptProperties.getProperty("rowList");
  
  if(rowList != ''){
    var listArray = rowList.split(",");
    var listArrayLength = listArray.length;
  } else {
    var listArrayLength = 0;
  }
  
  if(listArrayLength > 0){
    var event = listArrayLength + ' lines to process (' + rowList + ')';
  } else {
    event = 'Nothing to process'
  }  
  
}

function getProcessBatch(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var mySheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('myDataSource');
  var mySheetArray = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('myDataSource').getDataRange().getValues();
  var lastRow = mySheet.getLastRow();
  var myList = [];
  var y = 0;
  
  var start = (new Date()).getTime(); //The start time  
  for(var x = 0; x < lastRow; x++){
    var scrapeStatus = mySheet.getRange(x+1, 2).getValue(); 
    if(scrapeStatus =='for processing'){
      myList[y] = x + 1;
      y++;
      
    } 
    //Logger.log(scrapeStatus);
  }
  var now = (new Date()).getTime(); //The time now
  var timeProcess = now - start;
  scriptProperties.setProperty('rowList', myList.toString());
  scriptProperties.setProperty('rowCount', myList.length);
  
  Logger.log(myList);
  Logger.log(lastRow);
  Logger.log("time processed: " + timeProcess);
}


function rerunSkippedRow(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var runCount = Number(scriptProperties.getProperty('runCount'));
  var newRunCount = runCount + 1;
  scriptProperties.setProperty('runCount', newRunCount);
  
  scrapeMyDataSource();
}


function scrapeMyDataSource(){
  try{
    var funcName = arguments.callee
    var funcName = arguments.callee.toString(); // gets the entire function raw data including its by using arguments.callee function, and converts it to a string
    funcName = funcName.substr('function '.length);
    funcName = funcName.substr(0, funcName.indexOf('(')); //Indexes the string 'scrapeMyDataSource' from this entire function: indexOf() method.
    
    var result = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet1');
    var scriptProperties = PropertiesService.getScriptProperties();
    var runYet = scriptProperties.getProperty('runYet');
    var rowList = scriptProperties.getProperty('rowList');
    var rowCount = scriptProperties.getProperty('rowCount');
    var runCount = Number(scriptProperties.getProperty('runCount'));
    var triggerId = scriptProperties.getProperty('triggerId');
    var maxTimeOut = scriptProperties.getProperty('maxTimeout');
    //var listArray = rowList.split(',');
    Logger.log(listArray)
    
    var sheetTimerLog = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('testLog');
    var start = new Date();    

    for(var x = runCount; x < rowCount; x++){
      var listArray = rowList.split(',');
      var startA = new Date();
      var rowProcess = listArray[x];
      Logger.log(rowProcess)
      
      
      AuthorLoader(rowProcess); //My custom function ------------------------------------------------------------------
      
        
      //result.appendRow(value)
      var now = new Date();
      var timeProcess = now.getTime() - startA.getTime();
      
      if(now.getTime() - start.getTime() < maxTimeOut){
        var elapsedTime = now.getTime() - start.getTime();
        var y = x + 2; //I don't understand this for now
        var value = [y, elapsedTime, (now.getTime() - start.getTime() < maxTimeOut), timeProcess, runCount, maxTimeOut, now];
        scriptProperties.setProperty('runCount', x+1);
        sheetTimerLog.appendRow(value)
        Logger.log("function was executed")
      } else {
        var triggers = ScriptApp.getProjectTriggers();
        for(var i = 0; i < triggers.length; i++){
          var handlerFunction = triggers[i].getHandlerFunction();
          if(handlerFunction == 'scrapeMyDataSource'){
            ScriptApp.deleteTrigger(triggers[i]);
          }
        }
        var interval = Number(scriptProperties.getProperty('interval'));
        var date = new Date();
        var newDate = new Date(date);
        newDate.setSeconds(date.getSeconds() + interval);
        ScriptApp.newTrigger('scrapeMyDataSource').timeBased().at(newDate).create();
        
        break
        
      }
      var z = x + 1;
      if(z == rowCount){
        
      }
      
      
    }
  }
  catch(e){
    MailApp.sendEmail('n.fonseca@irri.org', 'Extraction error', '', 
                      {
                        htmlBody: "Function Name: " + funcName + '<br>Filename: ' + e.fileName + '<br> Message: ' + e.message + '<br> Line no.: ' + e.lineNumber
                      })
  }
  
}




