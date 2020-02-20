function helloWorld(){
  Logger.log("Hello World!")
}

function GenerateNewSet(){
  var scriptProperties = PropertiesService.getScriptProperties();
  var triggers = ScriptApp.getProjectTriggers();
  if(triggers.length > 0){
    for(var i = 0; i < triggers.length; i ++){
      
    }
  } 
}

function methodTester() {
  Logger.log('Current project has ' + ScriptApp.getProjectTriggers().length + ' triggers.');
}