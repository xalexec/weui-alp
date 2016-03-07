/**
 * Created by jf on 2015/9/11.
 */

$(function () {
    var home = {
        name: 'home',
        url: '#',
        template: '#page_home',
        events: {
            '.js_grid': {
                click: function (e) {
                    var id = $(this).data('id');
                    location.hash = id;
                }
            }
        },onShow: function () {
            //console.log('home show')
        },onHide: function () {
            //console.log('home hide')
        }
    };
    var button = {
        name: 'button',
        url: '#button',
        template: '#page_button',
        onShow: function () {
            //console.log('button show')
        },onHide: function () {
            //console.log('button hide')
        }
    };

    var cell = {
        name: 'cell',
        url: '#cell',
        template: '#page_cell',
        events: {
            '#showTooltips': {
                click: function () {
                    var $tooltips = $('.js_tooltips');
                    if ($tooltips.css('display') != 'none') {
                        return;
                    }

                    // 如果有`animation`, `position: fixed`不生效
                    $('.page.cell').removeClass('slideIn');
                    $tooltips.show();
                    setTimeout(function () {
                        $tooltips.hide();
                    }, 2000);
                }
            }
        }
    };
    var toast = {
        name: 'toast',
        url: '#toast',
        template: '#page_toast',
        events: {
            '#showToast': {
                click: function (e) {
                    var $toast = $('#toast');
                    if ($toast.css('display') != 'none') {
                        return;
                    }

                    $toast.show();
                    setTimeout(function () {
                        $toast.hide();
                    }, 2000);
                }
            },
            '#showLoadingToast': {
                click: function (e) {
                    var $loadingToast = $('#loadingToast');
                    if ($loadingToast.css('display') != 'none') {
                        return;
                    }

                    $loadingToast.show();
                    setTimeout(function () {
                        $loadingToast.hide();
                    }, 2000);
                }
            }
        }
    };
    var dialog = {
        name: 'dialog',
        url: '#dialog',
        template: '#page_dialog',
        events: {
            '#showDialog1': {
                click: function (e) {
                    var $dialog = $('#dialog1');
                    $dialog.show();
                    $dialog.find('.weui_btn_dialog').one('click', function () {
                        $dialog.hide();
                    });
                }
            },
            '#showDialog2': {
                click: function (e) {
                    var $dialog = $('#dialog2');
                    $dialog.show();
                    $dialog.find('.weui_btn_dialog').one('click', function () {
                        $dialog.hide();
                    });
                }
            }
        }
    };
    var progress = {
        name: 'progress',
        url: '#progress',
        template: '#page_progress',
        events: {
            '#btnStartProgress': {
                click: function () {

                    if ($(this).hasClass('weui_btn_disabled')) {
                        return;
                    }

                    $(this).addClass('weui_btn_disabled');

                    var progress = 0;
                    var $progress = $('.js_progress');

                    function next() {
                        $progress.css({width: progress + '%'});
                        progress = ++progress % 100;
                        setTimeout(next, 30);
                    }

                    next();
                }
            }
        }
    };
    var msg = {
        name: 'msg',
        url: '#msg',
        template: '#page_msg',
        events: {}
    };
    var article = {
        name: 'article',
        url: '#article',
        template: '#page_article',
        pullUp: function (me) {

        },
        pullDown: function (me) {

        },
        events: {}
    };
    var actionSheet = {
        name: 'actionsheet',
        url: '#actionsheet',
        template: '#page_actionsheet',
        events: {
            '#showActionSheet': {
                click: function () {
                    var mask = $('#mask');
                    var weuiActionsheet = $('#weui_actionsheet');
                    weuiActionsheet.addClass('weui_actionsheet_toggle');
                    mask.show().addClass('weui_fade_toggle').click(function () {
                        hideActionSheet(weuiActionsheet, mask);
                    });
                    $('#actionsheet_cancel').click(function () {
                        hideActionSheet(weuiActionsheet, mask);
                    });
                    weuiActionsheet.unbind('transitionend').unbind('webkitTransitionEnd');

                    function hideActionSheet(weuiActionsheet, mask) {
                        weuiActionsheet.removeClass('weui_actionsheet_toggle');
                        mask.removeClass('weui_fade_toggle');
                        weuiActionsheet.on('transitionend', function () {
                            mask.hide();
                        }).on('webkitTransitionEnd', function () {
                            mask.hide();
                        })
                    }
                }
            }
        }
    };
    var icons = {
        name: 'icons',
        url: '#icons',
        template: '#page_icons',
        events: {}
    };
    var tab = {
        name: 'tab',
        url: '#tab',
        template: '#page_tab',
        events: {
            '.js_tab': {
                click: function (){
                    var id = $(this).data('id');
                    location.hash = id;
                }
            }
        }
    };
    var navbar = {
        name: 'navbar',
        url: '#navbar',
        template: '#page_navbar',
        events: {}
    };
    var tabbar = {
        name: 'tabbar',
        url: '#tabbar',
        template: '#page_tabbar',
        events: {}
    };
    var panel = {
        name: 'panel',
        url: '#panel',
        template: '#page_panel'
    };
    var searchbar = {
        name:"searchbar",
        url:"#searchbar",
        template: '#page_searchbar',
        events:{
            '#search_input':{
                focus:function(){
                    //searchBar
                    var $weuiSearchBar = $('#search_bar');
                    $weuiSearchBar.addClass('weui_search_focusing');
                },
                blur:function(){
                    var $weuiSearchBar = $('#search_bar');
                    $weuiSearchBar.removeClass('weui_search_focusing');
                    if($(this).val()){
                        $('#search_text').hide();
                    }else{
                        $('#search_text').show();
                    }
                },
                input:function(){
                    var $searchShow = $("#search_show");
                    if($(this).val()){
                        $searchShow.show();
                    }else{
                        $searchShow.hide();
                    }
                }
            },
            "#search_cancel":{
                touchend:function(){
                    $("#search_show").hide();
                    $('#search_input').val('');
                }
            },
            "#search_clear":{
                touchend:function(){
                    $("#search_show").hide();
                    $('#search_input').val('');
                }
            }
        }
    };
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
    T.PageManager.push(home)
        .push(button)
        .push(cell)
        .push(toast)
        .push(dialog)
        .push(progress)
        .push(msg)
        .push(article)
        .push(actionSheet)
        .push(icons)
        .push(tab)
        .push(navbar)
        .push(tabbar)
        .push(panel)
        .push(searchbar)
        .push(pull)
        .setDefault('home')
        .init();
});