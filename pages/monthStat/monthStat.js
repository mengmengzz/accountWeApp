const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');
const Common = require('../../utils/common.js');
const wxCharts = require('../../utils/wxcharts.js');

//获取应用实例
const app = getApp()
const currentMonth = Util.getFormatDate().substr(0,7);

Page({
  data: {
    month: currentMonth,
    monthShow: currentMonth.split("-")[0]+"年"+currentMonth.split("-")[1]+"月",
    endMonth: currentMonth,
    monthTotal: "",
    array2: []
  },

  bindDateChange: function(e) {
    let monthStr = e.detail.value;
    //this.drawChart(monthStr);
    wx.redirectTo({
      url: '../monthStat/monthStat?monthStr='+monthStr
    })
  },

  yearStat: function() {
    wx.navigateTo({
      url: '../yearStat/yearStat'
    })
  },

  onLoad: function (option) {
    if(option.monthStr) {
      this.drawChart(option.monthStr);
    }else {
      this.drawChart(currentMonth);
    }
  },

  drawChart: function(monthStr) {
    let _this = this;
    let year = monthStr.split("-")[0];
    let month = monthStr.split("-")[1];
    var beginDate=monthStr+"-01 00:00:00";
    var endDate=monthStr+"-"+Util.getLastDay(year,month)+" 23:59:59";  
    //alert(beginDate);alert(endDate); 
    //beginDate="2016-03-29 00:00:00";
    //endDate="2016-03-29 23:59:59";
    
    var array=[];
    var array2=[];
    var sum=0.0;
    var j=0;
    var x=0,y=0;
    
    var BillInfo = Bmob.Object.extend("bill_info");
    var query = new Bmob.Query(BillInfo);
    var currentUser = Bmob.User.current();
    query.equalTo("user_id", currentUser.id);
    query.ascending("date");
    query.greaterThanOrEqualTo("date",{"__type":"Date", "iso":beginDate});  
    query.lessThanOrEqualTo("date", {"__type":"Date", "iso":endDate});
    query.limit(1000);
    // 查询所有数据
    query.find({
      success: function(results) {
        //alert(results.length); 
        for (var i = 0; i < results.length; i++) {
            var object = results[i];
            sum=sum+parseFloat(object.get("money"));
            if(array.length==0) {
              array[j]={};
              array[j].type_nm=object.get("type_nm");
              array[j].num=parseFloat(object.get("money"));
              j++;
            }else {
              var flag=false;
              for(var m=0;m<array.length;m++) {
                if(array[m].type_nm==object.get("type_nm")) {
                  array[m].num=array[m].num+parseFloat(object.get("money"));
                  flag=true;
                  break;
                }
              }
              if(!flag) {
                array[j]={};
                array[j].type_nm=object.get("type_nm");
                array[j].num=parseFloat(object.get("money"));
                j++
              }
            }
            
        }
        
        //对一维数组进行排序
        array.sort(function (x, y) {
            if (x.num < y.num) {
                return 1;
            }
            if (x.num > y.num) {
                return -1;
            }
            return 0;
        });

        for(var n=0;n<array.length;n++) {
          array[n].num = array[n].num.toFixed(1);
          let moneyNum = array[n].num;
          if(moneyNum.indexOf(".0")!=-1) {
            moneyNum=moneyNum.substring(0,moneyNum.length-2);
          }
          array[n].num = moneyNum;
        }

      //一维数组转二维数组
      for(var i=0;i<array.length;i++) {  
        if(y<3) {
          if(y==0) {
            array2[x]=[];
          }
          array2[x][y]=array[i];
          y++;
        }else {
          y=0;
          array2[++x]=[];
          array2[x][y]=array[i];
          y++;
        }
      }
      
      //console.log(array2);
      var tempSum=sum.toFixed(1);
      _this.setData({
        monthTotal: tempSum,
        month: monthStr,
        monthShow: monthStr.split("-")[0]+"年"+monthStr.split("-")[1]+"月",
        array2: array2
      });  

      for(var i=0;i<array2.length;i++) {
        for(var n=0;n<array2[i].length;n++) {
          array2[i][n].percent = Math.round((array2[i][n].num/sum)*100);  
          new wxCharts({
              animation: true,
              canvasId: 'ringCanvas-'+i+'-'+n,
              type: 'ring',
              extra: {
                  ringWidth: 8,
                  pie: {
                      offsetAngle: -90
                  }
              },
              title: {
                  name: array2[i][n].percent+'%\n'+array2[i][n].num+'元',
                  color: 'gray',
                  fontSize: 10
              },
              subtitle: {
                  name: array2[i][n].type_nm,
                  color: '#000000',
                  fontSize: 12
              },
              series: [{
                  name: '分类百分比',
                  data: array2[i][n].percent,
                  stroke: false
              }, {
                  name: '100%减分类百分比',
                  data: 100-array2[i][n].percent,
                  stroke: false,
                  color: "lightgray"
              }],
              disablePieStroke: true,
              width: 140,
              height: 140,
              dataLabel: false,
              legend: false,
              background: '#f5f5f5',
              padding: 0
            });
        }
      }

      },
      error: function(error) {
        alert("查询失败: " + error.code + " " + error.message);
      }
    });
  }

})
