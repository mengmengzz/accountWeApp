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
    endMonth: currentMonth
  },

  bindDateChange: function(e) {
    let month = e.detail.value;
    this.setData({
        month: month,
        monthShow: month.split("-")[0]+"年"+month.split("-")[1]+"月"
    })
  },

  onLoad: function (option) {

  },

})
