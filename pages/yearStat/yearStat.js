const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');
const Common = require('../../utils/common.js');
const wxCharts = require('../../utils/wxcharts.js');

//获取应用实例
const app = getApp()
const currentYear = Util.getFormatDate().substr(0,4);
const monthCategories = ['1月', '2月', '3月', '4月','5月','6月','7月','8月','9月','10月','11月','12月'];

Page({
  data: {
    year: currentYear,
    yearShow: currentYear+"年",
    endYear: currentYear,
    yearTotal: "",
    array2: []
  },

  bindDateChange: function(e) {
    let yearStr = e.detail.value;
    wx.redirectTo({
      url: '../yearStat/yearStat?yearStr='+yearStr
    })
  },

  onLoad: function (option) {
    if(option.yearStr) {
      this.drawChart(option.yearStr);
    }else {
      this.drawChart(currentYear);
    }
  },

  drawChart: function(yearStr) {
    let _this = this;
    var beginDate=yearStr+"-01-01 00:00:00";
    var endDate=yearStr+"-12-31 23:59:59";  

    var array=[];
    var array2=[];
    var arrayColumnar=[];
    for(var i=0;i<12;i++) {
        arrayColumnar[i]=0.0;
    }
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
    var index = 0;
    var totalResult = [];
    query.count({
        success: function(count) {
            sumData(count);
        },
        error: function(error) {
        }
    });
    //递归
    function sumData(count) {
        query.skip(500*index);
        query.limit(500);
        query.find({ 
            success: function(results) {
                totalResult = totalResult.concat(results);
                count = count-500;
                index++;
                if(count>0) {
                    sumData(count);
                }else {
                    console.log(totalResult.length); 
                    for (var i = 0; i < totalResult.length; i++) {
                        var object = totalResult[i];
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
                        
                        var month = parseInt(object.get("date").substr(0,10).split("-")[1]);
                        arrayColumnar[month-1]=arrayColumnar[month-1]+parseFloat(object.get("money"));
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

                    //一维数组转二维数组（目的是使圆环图每行显示3个）
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
                    
                    var tempSum=sum.toFixed(1);
                    var tempSum=sum.toFixed(1);
                    _this.setData({
                        yearTotal: tempSum,
                        year: yearStr,
                        yearShow: yearStr+"年",
                        array2: array2
                    });
                    
                    for(var i=0;i<array2.length;i++) {
                        for(var n=0;n<array2[i].length;n++) {
                          array2[i][n].percent = Math.round((array2[i][n].num/sum)*100);  
                          new wxCharts({
                              animation: false,
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

                    //柱状图
                    for(var i=0;i<12;i++) { //取整
                        arrayColumnar[i]=Math.round(arrayColumnar[i]);	
                    }
                    var windowWidth = 320;
                    try {
                        var res = wx.getSystemInfoSync();
                        windowWidth = res.windowWidth;
                    } catch (e) {
                        console.error('getSystemInfoSync failed!');
                    }
                    var columnChart = new wxCharts({
                        canvasId: 'columnCanvas',
                        type: 'column',
                        animation: false,
                        categories: monthCategories,
                        series: [{
                            name: '消费金额(元)',
                            data: arrayColumnar,
                            format: function (val, name) {
                                return val;
                            }
                        }],
                        yAxis: {
                            disabled: true,
                            format: function (val) {
                                return val;
                            },
                            min: 0
                        },
                        xAxis: {
                            disableGrid: false,
                            type: 'calibration'
                        },
                        extra: {
                            column: {
                                width: 12
                            }
                        },
                        width: windowWidth,
                        height: 200,
                    });
                }
            },
            error: function(error) {
                alert("查询失败: " + error.code + " " + error.message);
            }
        });
    }
  }

})
