;
var $config ={
    service:'http://vip.weicpc.com'
}
$(function() {
    FastClick.attach(document.body);
    $(".weui_tabbar_item").on('click', function () {
        $(".weui_tabbar_item").removeClass('active');
        $(this).addClass('active');
    });




})

var wechat={
    login:function(backurl){
        var url = $config.service + "/wechat/authorize?backUrl="+encodeURIComponent(backurl);
        location=url;
    },
    check:function(){
        var ua = navigator.userAgent.toLowerCase();
        return (/micromessenger/.test(ua)) ? true : false ;
    }
}
function getQueryString(name) {
    var reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    var r = window.location.search.substr(1).match(reg);
    if (r != null) {
        return decodeURIComponent(r[2]);
    }
    return null;
}
