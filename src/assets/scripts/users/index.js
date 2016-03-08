/**
 * Created by jf on 2015/9/11.
 */

$(function () {
    var pull = {
        name: 'pull',
        url: '#pull',
        template: '#page_pull',
        pullUp:function(me){
            T.ajax('json/pull.json', function (o) {
                if (o.state == "success") {
                    var html = T.template('#tpl_pull').render({list: o.data}, function () {});
                    $('.weui_panel_bd').append(html);
                }
            })
        },
        pullDown: function (me) {
            T.ajax('json/pull.json', function (o) {

                if (o.state == "success") {
                    var html = T.template('#tpl_pull').render({list: o.data}, function () {});

                    $('.weui_panel_bd').prepend(html);
                }
            })
        },onShow: function () {
            T.ajax('json/pull.json', function (o) {

                if (o.state == "success") {
                    var html = T.template('#tpl_pull').render({list: o.data}, function () {});

                    $('.weui_panel_bd').append(html);
                }
            })
        }
    };
    T.PageManager
        .push(pull)
        .setDefault('pull')
        .init();
});