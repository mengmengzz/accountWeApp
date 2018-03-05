//index.js
const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');

//获取应用实例
const app = getApp()

const pageSize = 15;
let count=0;

Page({
  data: {
    listAccount: []
  },

  //新增记录
  add: function() {
    wx.navigateTo({
      url: '../billProp/billProp'
    })
  },

  //月度统计
  monthStatistics: function() {
    wx.navigateTo({
      url: '../monthStat/monthStat'
    })
  },

  onLoad: function () {
    count=0;
    this.fetchData();        
  },

  onShow: function() {
  },

  fetchData: function() {
    var that = this;
    var BillInfo = Bmob.Object.extend("bill_info");
    var query = new Bmob.Query(BillInfo);
    var currentUser = Bmob.User.current();
    query.equalTo("user_id", currentUser.id);
    query.descending("date");
    query.limit(pageSize);
    query.skip(pageSize*(count++));
    // 查询所有数据
    query.find({
      success: function(results) {
        //console.log(results);
        that.setData({
          listAccount: that.data.listAccount.concat(results.map((item)=>{
              let json =  {
                ...item.attributes,
                id: item.id,
                createdAt: item.createdAt,
                updatedAt: item.updatedAt
              }
              json.date = json.date.substr(0,10);
              return json;
          }))
        });
        //console.log("data",that.data);
      },
      error: function(error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  onReachBottom: function() {
    this.fetchData();
  }
})
