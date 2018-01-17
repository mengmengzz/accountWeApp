function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function getFormatDate() { 
  var day = new Date(); 
  var Year = 0; 
  var Month = 0; 
  var Day = 0; 
  var Hour = 0;
  var Minute = 0;
  var Second = 0;
  var CurrentDate = ""; 
  //初始化时间 
  //Year= day.getYear();//有火狐下2008年显示108的bug 
  Year= day.getFullYear();//ie火狐下都可以 
  Month= day.getMonth()+1; 
  Day = day.getDate(); 
  Hour = day.getHours(); 
  Minute = day.getMinutes(); 
  Second = day.getSeconds(); 
  CurrentDate += Year + "-"; 
  if (Month >= 10 ) { 
    CurrentDate += Month + "-"; 
  }else { 
    CurrentDate += "0" + Month + "-"; 
  } 
  if (Day >= 10 ) { 
    CurrentDate += Day ; 
  }else { 
    CurrentDate += "0" + Day ; 
  } 
  CurrentDate += " ";
  if (Hour >= 10 ) { 
    CurrentDate += Hour+":" ; 
  }else { 
    CurrentDate += "0" + Hour+":" ; 
  } 
  if (Minute >= 10 ) { 
    CurrentDate += Minute+":" ; 
  }else { 
    CurrentDate += "0" + Minute+":" ; 
  } 
  if (Second >= 10 ) { 
    CurrentDate += Second; 
  }else { 
    CurrentDate += "0" + Second; 
  } 
  
  return CurrentDate; 
}

function stringToDate(str) {
  str = str.replace("/-/g", "/");
  return new Date(str);
}

module.exports = {
  formatTime: formatTime,
  getFormatDate: getFormatDate,
  stringToDate: stringToDate
}
