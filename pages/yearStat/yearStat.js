const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');
const Common = require('../../utils/common.js');

//获取应用实例
const app = getApp()
const currentYear = Util.getFormatDate().substr(0,4);
const monthCategories = ['1月', '2月', '3月', '4月','5月','6月','7月','8月','9月','10月','11月','12月'];
let chart = null;
let columnChart = null;

//柱状图
function initChart(canvas, width, height, F2) {
    let data = [];
    columnChart = new F2.Chart({
      el: canvas,
      width,
      height
    });
  
    columnChart.source(data);
    columnChart.axis('num', false);
    columnChart.tooltip(false);
    columnChart.interval().position('month*num');
    columnChart.render();
    return columnChart;
  }

Page({
  data: {
    year: currentYear,
    yearShow: currentYear+"年",
    endYear: currentYear,
    yearTotal: "",
    array2: [],
    optsArray: [],
    columnOpts: {
        onInit: initChart
    }
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
    for(let i=0;i<12;i++) {
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
                    for (let i = 0; i < totalResult.length; i++) {
                        var object = totalResult[i];
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

                    for(let n=0;n<array.length;n++) {
                        array[n].num = array[n].num.toFixed(1);
                        let moneyNum = array[n].num;
                        if(moneyNum.indexOf(".0")!=-1) {
                          moneyNum=moneyNum.substring(0,moneyNum.length-2);
                        }
                        array[n].num = moneyNum;
                    }

                    //一维数组转二维数组（目的是使圆环图每行显示3个）
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
                    
                    //环形图
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

                    //更新柱状图的数据
                    let columnData = [];
                    for(let i=0;i<12;i++) { //取整
                        arrayColumnar[i]=Math.round(arrayColumnar[i]);
                        let jsonData = {};
                        jsonData.num = arrayColumnar[i];
                        jsonData.month = (i+1)+'月';
                        columnData[i] = jsonData;
                    }
                    // 绘制柱状图上的数字
                    columnData.map(function(obj) {
                        if(obj.num>0) {
                            columnChart.guide().text({
                                position: [obj.month, obj.num],
                                content: obj.num,
                                style: {
                                    textBaseline: 'bottom',
                                    textAlign: 'center',
                                    fontSize: 10
                                },
                                offsetY: -2
                            });
                        }
                    });
                    columnChart.changeData(columnData); 
                    

                    var tempSum=sum.toFixed(1);
                    _this.setData({
                        yearTotal: tempSum,
                        year: yearStr,
                        yearShow: yearStr+"年",
                        array2: array2,
                        optsArray: optsArray,
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
