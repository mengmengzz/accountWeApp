const Bmob = require('../../utils/bmob.js');
const Util = require('../../utils/util.js');
const Common = require('../../utils/common.js');

//获取应用实例
const app = getApp()
const today = Util.getFormatDate().substr(0,10);

Page({
  data: {
    typeList: [],
    typeIndex: 0,
    date: today,
    endDate: today,
    id: "",
    money: "",
    detail: ""
  },
  //事件处理函数
  bindTypeChange: function(e) {
    this.setData({
        typeIndex: e.detail.value
    })
  },

  bindDateChange: function(e) {
    this.setData({
        date: e.detail.value
    })
  },

  onLoad: function (option) {
    if(option.id) {
      this.setData({
        id: option.id
      });
    }
    this.fetchTypeList(option.id);        
  },

  fetchDataById: function(id,typeArray) {
    var _this = this;
    var BillInfo = Bmob.Object.extend("bill_info");
    var query = new Bmob.Query(BillInfo);
    query.get(id, {
      success: function(result) {
        let typeId=result.get("type_id");
        let indexNum = 0;
        //console.log(typeArray);
        for(let i=0;i<typeArray.length;i++) {
          let item = typeArray[i];
          if(item.id==typeId) {
            indexNum = i;
            break;
          }
        }
        _this.setData({
          money: result.get("money"),
          detail: result.get("detail"),
          typeIndex: indexNum,
          date: result.get("date").substr(0,10)
        }) 
      },
      error: function(result, error) {
        console.log("查询失败");
      }
    });
  },

  fetchTypeList: function(billId) {
    let _this = this;  
    var BillType = Bmob.Object.extend("bill_type");
    var query = new Bmob.Query(BillType);
    query.ascending("createdAt");
    query.find({
      success: function(results) {
          //console.log(results);
          let typeArray = results.map((item)=>{
            return {
                ...item.attributes,
                id: item.id
            }  
          });
          _this.setData({
            typeList: typeArray
          });
          if(billId) {
            _this.fetchDataById(billId,typeArray);
          }
      },
      error: function(error) {
        console.log("查询失败: " + error.code + " " + error.message);
      }
    });
  },

  formSubmit: function(e) {
    // console.log(e.detail.value);
    var obj = e.detail.value;
    if(obj.money=="") {
      Common.showModal("金额必填且必须为数字");
      return;
    }else {
      var reg = new RegExp("^[0-9]+(.[0-9]{1})?$");
        if(!reg.test(obj.money)){
          Common.showModal("请输入数字,且只能有1位小数!");
          return;
        }
    }
    var BillInfo = Bmob.Object.extend("bill_info");
    let billDate = "";
    if(today==obj.date) { //是当日
      billDate = new Date();
    }else { //是当日之前的日期
      billDate = Util.stringToDate(obj.date+" 23:59:59");
    }
    if(this.data.id.length>0) {
      var query = new Bmob.Query(BillInfo);
      query.get(this.data.id, {
          success: function(myObject) {
              myObject.set('type_id',obj.type.id);
              myObject.set('type_nm',obj.type.name);
              myObject.set('money',obj.money);
              myObject.set('detail',obj.detail);
              myObject.set('date',billDate);
              myObject.save();
          
              Common.showTip('修改成功',function(){
                wx.reLaunch({
                  url: '../index/index'
                })
              });
          },
          error: function(object, error) {
            console.log(error);
          }
      });
    }else {
      var billInfo = new BillInfo();
      billInfo.save({
        type_id: obj.type.id,
        type_nm: obj.type.name,
        money: obj.money,
        detail: obj.detail,
        date: billDate,
        user_id: Bmob.User.current().id
        }, {
        success: function(object) {
          Common.showTip('新增成功',function(){
            wx.reLaunch({
              url: '../index/index'
            })
          });
        },
        error: function(model, error) {
          console.log("create object fail");
        }
      });
    }
  },

  delBill: function(e) {
    let bill_id = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗',
      success: function(res) {
        if (res.confirm) {
          var BillInfo = Bmob.Object.extend("bill_info");
					var query = new Bmob.Query(BillInfo);
					query.get(bill_id, {
					    success: function(myObject) {
						  	myObject.destroy({
                  success: function(object) {
                    Common.showTip('删除成功',function(){
                      wx.reLaunch({
                        url: '../index/index'
                      })
                    });
                  },
                  error: function(myObject, error) {
                    // 删除失败
                  }
							  });
					    },
					    error: function(object, error) {
							  console.log(error);
					    }
					});
        } else if (res.cancel) {

        }
      }
    })
  }
  
})
