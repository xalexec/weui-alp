/**
 * Created by jf on 2015/9/11.
 */

$(function () {

    var login = {
        name: 'login',
        url: '#',
        template: '#page_login',
        events: {
            '#next': {
                click: sendSms
            },
            '#enter': {
                click: function () {
                    console.log(111222)
                }
            }
        }
    };
    var next = {
        name: 'next',
        url: '#next',
        template: '#page_next',
        onShow: replaySendSms,
        events: {}
    };


    T.PageManager
        .push(login)
        .push(next)
        .setDefault('login')
        .init();

});

var loginPage=true;
var login=function(mobile,code,o){
    var data={mobile:mobile,code:code};
    if(o){
        data["o"]=o;
    }
    $util.ajax({
        url :  $config.service+'/ajaxLogin/loginMember',
        type : 'get',
        data : data,
        dataType : 'json',
        success : function(data) {
            if (data.result == 'success') {
                var remember = $('div[name="remember"]').hasClass("active");
                $native.session('userinfo', data);
                $native.cache('userinfo', data);

                A.showToast('登录成功');
                var backurl = $native.cache('edn.backurl')||$native.session('edn.backurl');
                if(backurl){
                    $native.cache('edn.backurl',"");
                    $native.session('edn.backurl',"");
                    location= backurl;
                }else{
                    A.Controller.html("#index");
                }
                return false;
            } else {
                A.showToast(data.resultMeg);
                A.hideMask();
                $('#btn_login').tap(function(){
                    if(!checkCode()){
                        return false;
                    }
                    var mobile = $("#mobile").val();
                    var code = $("#code").val();
                    login(mobile,code,o);
                });
            }
        },
        error : function() {
            A.showToast('登录异常');
        }
    });
}

var o=getQueryString("o");
if(!o){
    if(wechat.check()){
        A.showMask("当前正在自动登录中...");
        wechat.login($config.domain+"/login.html");
    }else{
        $('#btn_login').tap(function(){
            if(!checkCode()){
                return false;
            }
            var mobile = $("#mobile").val();
            var code = $("#code").val();
            login(mobile,code,o);
        });
    }
}else{
    A.showMask("当前正在自动登录中...");
    login("","",o);
}

var sendSms = function (cb) {
    var mobile = $.trim($("#mobile").val());
    if (/^1[34578]\d{9}$/.test(mobile)) {
        $.ajax({
            type: "POST",
            dataType: "JSON",
            url: $config.service + "/sms/send",
            data: {mobile: mobile},
            success: function (data) {
                if (!data > 0) {
                    T.Toast("短信发送失败");
                } else {
                    T.Toast("短信发送成功");
                    location.hash = 'next';
                }
                if ($.isFunction(cb))
                    cb(data > 0);
            }
        });

    } else {
        T.Toast("手机格式不正确");
    }
}
var replaySendSms = function () {
    var time = 60;
    var replayInterval = setInterval(function () {
        if (time < 2) {
            clearInterval(replayInterval);

            $('#replay').removeClass('weui_btn_disabled').html('重新发送验证码').on('click', function () {
                var self = this;
                sendSms(function (state) {
                    if (state) {
                        $(self).html('60秒后重新发送验证码').addClass('weui_btn_disabled').off('click');
                        replaySendSms();
                    }
                });
            })
        } else {
            $('#replay').html(--time + '秒后重新发送验证码');
        }
    }, 1000)
}