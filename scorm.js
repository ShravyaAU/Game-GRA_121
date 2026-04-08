let scormAPI=null
function findAPI(win){ while(win){ if(win.API) return win.API if(win.parent===win) break win=win.parent } return null }
function scormInit(){ scormAPI=findAPI(window) if(scormAPI) scormAPI.LMSInitialize("") }
function scormSetValue(name,value){ if(scormAPI) scormAPI.LMSSetValue(name,value) }
function scormSave(){ if(scormAPI) scormAPI.LMSCommit("") }
function scormTerminate(){ if(scormAPI) scormAPI.LMSFinish("") }
function scormSetScore(score,max){ scormSetValue("cmi.core.score.raw",score) scormSetValue("cmi.core.score.max",max) }
function scormSetCompletion(status){ scormSetValue("cmi.core.lesson_status",status) }
