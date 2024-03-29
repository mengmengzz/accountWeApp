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

//取每月的最后一天
function getLastDay(year,month) {        
  var new_year = year;    //取当前的年份        
  var new_month = month++;//取下一个月的第一天，方便计算（最后一天不固定）        
  if(month>12)            //如果当前大于12月，则年份转到下一年        
  {        
   new_month -=12;        //月份减        
   new_year++;            //年份增        
  }        
  var new_date = new Date(new_year,new_month,1);                //取当年当月中的第一天        
  return (new Date(new_date.getTime()-1000*60*60*24)).getDate();//获取当月最后一天日期        
} 

module.exports = {
  formatTime: formatTime,
  getFormatDate: getFormatDate,
  stringToDate: stringToDate,
  getLastDay: getLastDay
}
