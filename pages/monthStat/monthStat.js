const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');
const Common = require('../../utils/common.js');

//获取应用实例
const app = getApp()
const currentMonth = Util.getFormatDate().substr(0,7);
let chart = null;

Page({
  data: {
    month: currentMonth,
    monthShow: currentMonth.split("-")[0]+"年"+currentMonth.split("-")[1]+"月",
    endMonth: currentMonth,
    monthTotal: "",
    array2: [],
    optsArray: []
  },

  bindDateChange: function(e) {
    let monthStr = e.detail.value;
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
      this.loadData(option.monthStr);
    }else {
      this.loadData(currentMonth);
    }
  },

  onReady: function() {
  },

  loadData: function(monthStr) {
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
        for (let i = 0; i < results.length; i++) {
            var object = results[i];
            sum=sum+parseFloat(object.get("money"));
            if(array.length==0) {
              array[j]={};
              array[j].type_nm=object.get("type_nm");
              array[j].num=parseFloat(object.get("money"));
              j++;
            }else {
              var flag=false;
              for(let m=0;m<array.length;m++) {
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

        for(let n=0;n<array.length;n++) {
          array[n].num = array[n].num.toFixed(1);
          let moneyNum = array[n].num;
          if(moneyNum.indexOf(".0")!=-1) {
            moneyNum=moneyNum.substring(0,moneyNum.length-2);
          }
          array[n].num = moneyNum;
        }

      //一维数组转二维数组
      for(let i=0;i<array.length;i++) {  
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
      
      //console.log("异步《《《《《《",array2);
      //设置环形图属性
      let optsArray = [];
      for(let i=0;i<array2.length;i++) {
        for(let n=0;n<array2[i].length;n++) {
          array2[i][n].percent = Math.round((array2[i][n].num/sum)*100);  
          let func = function(canvas, width, height, F2) {
            let persent = array2[i][n].percent;
            if(persent==0) { //此处的百分比0表示四舍五入后为0，实际上是有值的，为了让其能在环形图上显示，将其百分比设为1
              persent = 1;
            }
            const data = [
              { name: '环形图', value: persent }
            ]
            
            chart = new F2.Chart({
              el: canvas,
              width: 140,
              height: 140,
              padding: [ 0, 20, 10, 8 ]
            });
            chart.source(data, {
              value: {
                max: 100, // 设置 Y 轴的最大值
                min: 0
              }
            });
            // 坐标系配置
            chart.coord('polar', {
              transposed: true,
              innerRadius: 0.8,
              radius: 0.85
            });
            // 坐标轴的样式配置
            chart.axis(false);
            chart.tooltip(false);
            chart.guide().arc({
              start: [0, 0],
              end: [1, 99.98],
              top: false,
              style: {
                lineWidth: 8,
                stroke: '#ccc'
              }
            }); // draw a cricle
            chart.guide().text({
              position: ['50%', '50%'],
              content: array2[i][n].type_nm+'\n'+array2[i][n].percent+'% '+array2[i][n].num+'元',
              style: {
                fontSize: 11,
                // fill: '#1890FF'
                fill: '#000'
              }
            });
            chart.interval().position('name*value').size(8);
          
            chart.render();
            return chart;
          };
          let opts = {onInit:func};
          optsArray[i*3+n] = opts;
        }
      }

      var tempSum=sum.toFixed(1);
      _this.setData({
        monthTotal: tempSum,
        month: monthStr,
        monthShow: monthStr.split("-")[0]+"年"+monthStr.split("-")[1]+"月",
        array2: array2,
        optsArray: optsArray
      },function() {
      });

      },
      error: function(error) {
        alert("查询失败: " + error.code + " " + error.message);
      }
    });
  }

})
