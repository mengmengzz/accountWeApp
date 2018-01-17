function showTip(sms, fun,icon,  t) {
    if (!t) {
        t = 1500;
    }
    wx.showToast({
        title: sms,
        icon: icon,
        duration: t,
        complete: fun
    })
}

function showModal(c,t,fun) {
    if(!t)
        t='提示'
    wx.showModal({
        title: t,
        content: c,
        showCancel:false,
        success: fun
    })
}


module.exports.showTip = showTip;
module.exports.showModal = showModal;