;

var T = (function ($) {
    var Transnal = function () {
        this.$ = $;
        this.options = {
            version: '0.1',
            readyEvent: 'ready',
            complete: false
        };

        this.pop = {
            hasAside: false,
            hasPop: false
        };
    };

    var _launchMap = {};

    /**
     * 注册Transnal框架的各个部分，可扩充
     * @param {String} 控制器的唯一标识
     * @param {Object} 任意可操作的对象，建议面向对象方式返回的对象
     */
    Transnal.prototype.register = function (key, obj) {
        this[key] = obj;
        if (obj.launch) {
            _launchMap[key] = obj.launch;
        }
    };
    var _doLaunch = function () {
        for (var k in _launchMap) {
            try {
                _launchMap[k]();
            } catch (e) {
               // console.log(e);
            }
        }
        T.options.complete = true;
        $(document).trigger(T.options.readyEvent);
    };
    Transnal.prototype.launch = function (opts) {
        if (T.options.complete == true) return;
        $.extend(this.options, opts);
        var _this = this;
        if (!this.options.readyEvent) {
            _doLaunch();
        } else if ($(document)[this.options.readyEvent]) {
            $(document)[this.options.readyEvent](_doLaunch);
        } else {
            $(document).on(this.options.readyEvent, _doLaunch);
        }
    };
    return new Transnal();
})(window.Zepto || jQuery);

!function ($) {
    var pageManager = {
        $container: $('.js_container'),
        _pageStack: [],
        _configs: [],
        _defaultPage: null,
        _pageIndex: 1,
        setDefault: function (defaultPage) {
            this._defaultPage = this._find('name', defaultPage);
            return this;
        },
        init: function () {
            var self = this;

            $(window).on('hashchange', function () {
                var state = history.state || {};
                var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
                var page = self._find('url', url) || self._defaultPage;
                if (state._pageIndex <= self._pageIndex || self._findInStack(url)) {
                    self._back(page);
                } else {
                    self._go(page);
                }
            });

            if (history.state && history.state._pageIndex) {
                this._pageIndex = history.state._pageIndex;
            }

            this._pageIndex--;

            var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
            var page = self._find('url', url) || self._defaultPage;
            this._go(page);
            return this;
        },
        push: function (config) {
            this._configs.push(config);
            return this;
        },
        go: function (to) {
            var config = this._find('name', to);
            if (!config) {
                return;
            }
            location.hash = config.url;
        },
        _go: function (config) {
            this._pageIndex ++;

            history.replaceState && history.replaceState({_pageIndex: this._pageIndex}, '', location.href);

            var html = $(config.template).html();
            var $html = $(html).addClass('slideIn').addClass(config.name);
            this.$container.append($html);
            this._pageStack.push({
                config: config,
                dom: $html
            });

            if (!config.isBind) {
                this._bind(config);
            }

            this._trigger(config);
            var opt = {};

            if(config.pullUp){
                $.extend(opt,{loadDownFn:function(me){
                    $(document).one("ajaxSuccess",function(o){
                        if(!(o.data&& o.data.length>0)){
                            me.noData();
                        }
                        me.resetload();
                    });
                    config.pullUp(me);

                }});
            }
            if(config.pullDown){
                $.extend(opt,{loadUpFn:function(me){
                    $(document).one("ajaxSuccess",function(o){
                        if(!(o.data&& o.data.length>0)){
                            me.noData();
                        }
                        me.resetload();
                    });
                    config.pullDown(me);
                }});
            }
            var dropload = $('.dropload');
            if(dropload.length>0)
                dropload.dropload(opt);
            if($(".ui-nav").css("display") != "none"){
                $(".page").last().append('<div style="height:60px;"></div>');
            }

            return this;
        },
        back: function () {
            history.back();
        },
        _back: function (config) {
            this._pageIndex --;

            var stack = this._pageStack.pop();
            if (!stack) {
                return;
            }

            var url = location.hash.indexOf('#') === 0 ? location.hash : '#';
            var found = this._findInStack(url);
            if (!found) {
                var html = $(config.template).html();
                var $html = $(html).css('opacity', 1).addClass(config.name);
                $html.insertBefore(stack.dom);

                if (!config.isBind) {
                    this._bind(config);
                }

                this._pageStack.push({
                    config: config,
                    dom: $html
                });
            }
            if(this._pageStack && this._pageStack.length > 0 && this._pageStack[this._pageStack.length-1])
                this._trigger(this._pageStack[this._pageStack.length-1].config);

            stack.dom.addClass('slideOut').on('animationend', function () {
                stack.dom.remove();
            }).on('webkitAnimationEnd', function () {
                stack.dom.remove();
            });

            return this;
        },
        _findInStack: function (url) {
            var found = null;
            for(var i = 0, len = this._pageStack.length; i < len; i++){
                var stack = this._pageStack[i];
                if (stack.config.url === url) {
                    found = stack;
                    break;
                }
            }
            return found;
        },
        _find: function (key, value) {
            var page = null;
            for (var i = 0, len = this._configs.length; i < len; i++) {
                if (this._configs[i][key] === value) {
                    page = this._configs[i];
                    break;
                }
            }
            return page;
        },
        _bind: function (page) {
            var events = page.events || {};
            for (var t in events) {
                for (var type in events[t]) {
                    this.$container.on(type, t, events[t][type]);
                }
            }
            page.isBind = true;
        },
        _trigger:function(to){
            for (var i = 0, len = this._configs.length; i < len; i++) {
                if (this._configs[i].isShow) {
                    this._configs[i].isShow = false;
                    this._configs[i].onHide && this._configs[i].onHide();
                    break;
                }
            }
            for (var i = 0, len = this._configs.length; i < len; i++) {
                if (this._configs[i]['name'] === to.name) {
                    this._configs[i].isShow = true;
                    this._configs[i].onShow && this._configs[i].onShow();
                    break;
                }
            }
        }
    };
    T.register('PageManager', pageManager);
}(T.$);

!function ($) {

    var _ext = {};

    _ext.Toast =function(text){
        var $toast = $('#toast');
        if ($toast.css('display') != 'none') {
            return;
        }

        $toast.find('.weui_toast_content').text(text||'已完成');

        $toast.show();
        setTimeout(function () {
            $toast.hide();
        }, 2000);
    }
    var $loadingToast = $('#loadingToast');

    _ext.showMask =function(text){

        if ($loadingToast.css('display') != 'none') {
            return;
        }

        $loadingToast.find('p.weui_toast_content').html(text||'数据加载中');

        $loadingToast.show();
        setTimeout(function () {
            $loadingToast.hide();
        }, 2000);
    }

    _ext.hideMask =function(){
        $loadingToast.hide();
    }

    _ext.alert =function(titie ,text){
        var alert = $('#dialog_alert');
        alert.find('strong.weui_dialog_title').html(title||'');
        alert.find('div.weui_dialog_bd').html(text||'');
        alert.find('.weui_btn_dialog').one('click', function () {
            alert.hide();
        });
    }

    _ext.confirm =function(titie ,text ,cb){
        var confirm = $('#dialog_confirm');
        confirm.find('strong.weui_dialog_title').html(title||'');
        confirm.find('div.weui_dialog_bd').html(text||'');
        confirm.find('.weui_btn_dialog').one('click', function () {
            confirm.hide();
            cb && cb($(this).hasClass('primary'));
        });
    }

    for(var k in _ext){
        T.register(k, _ext[k]);
    }
}(T.$);

!function ($) {
    var _index_key_ = {};

    var scroll = function (selector, opts) {
        var $el = $(selector);
        var eId = $el.attr('id');
        if ($el.length == 0 || !eId) {
            return null;
        } else if (_index_key_[eId]) {
            return _index_key_[eId];
        }

        var opt = {mouseWheel: true, scrollbars: true, checkDOMChanges: true}

        var $scroll = new IScroll(selector, opt);

        _index_key_[eId] = $scroll;

        return _index_key_[eId];
    };
    T.register('Scroll', scroll);
}(T.$);

(function ($) {
    var Template = function (selecotr) {
        this.$el = $(selecotr);
    };

    Template.prototype.getTemplate = function (cb) {
        var $el = this.$el;
        var source = $el.attr('src');
        var tmpl = $el.html().trim();
        if (tmpl) {
            cb && cb(tmpl);
        } else if (source) {
            T.util.getHTML(T.util.script(source), function (html) {
                $el.text(html);
                cb && cb(html);
            });
        } else {
            cb && cb('');
        }
    };

    Template.prototype.render = function (url, cb) {
        var data;
        if (typeof url == 'object') {
            data = url;
            url = '';
        }
        if (!data && !url) {
            cb && cb();
            return;
        }
        var tmplHTML = this.$el.html().trim();
        if (data && tmplHTML) {
            var html = '';
            try {
                html = template.compile(tmplHTML)(data);
            } catch (e) {
            }
            cb && cb(html, tmplHTML, data);
            return html;
        }

        this.getTemplate(function (tmpl) {
            if (url) {
                T.ajax(url, function (data) {
                    var render = template.compile(tmpl);
                    html = render(data);
                    cb && cb(html, tmpl, data);
                });
            } else {
                var render = template.compile(tmpl);
                html = render(data);
                cb && cb(html, tmpl, data);
            }
        });

    };

    var _render = function (type, url, cb) {
        var $el = this.$el;
        this.render(url, function (html, tmpl, data) {
            var $referObj = $el;
            var id = $el.attr('id');
            var tag = '#' + $el.attr('id');
            var $oldObj = $el.parent().find('[__inject_dependence__="' + tag + '"]');
            if (type == 'replace') {
                $oldObj.remove();
                //$referObj = $el;
            } else if (type == 'after') {
                $referObj = $oldObj.length == 0 ? $el : $oldObj.last();
            } else if (type == 'before') {
                //$referObj = $el;
            }
            var $html = $(html).attr('__inject_dependence__', tag);
            $referObj.after($html);
            cb && cb($html, tmpl, data);
            $el.trigger('renderEnd', [$html]);
        });
    };

    Template.prototype.renderReplace = function (url, cb) {
        _render.call(this, 'replace', url, cb);
    };

    Template.prototype.renderAfter = function (url, cb) {
        _render.call(this, 'after', url, cb);
    };
    Template.prototype.renderBefore = function (url, cb) {
        _render.call(this, 'before', url, cb);
    };

    T.register('template', function (selecotr) {
        return new Template(selecotr);
    });
})(T.$);

!function ($) {
    var ajax = function (url ,option, cb ) {
        if ($.isFunction(option)) {
            cb = option;
        }
        var ops = {
            url: url, dataType: "json", success: function (o) {
                cb && cb(o);
            }
        }
        $.extend(ops, option);
        $.ajax(ops)
    };
    T.register('ajax', ajax);
}(T.$);

!function ($) {
    var p = function (page,els,cb) {
        if(!page || !els || !cb){return;}
        var pageCount = Math.ceil(page.total / page.size);


        var pageContainer = '<div class="dataTables_paginate paging_bootstrap"><ul class="pagination">';

        page.num = parseInt(page.num);

        var prev = '';
        if(page.num == 1){
            prev = '<li class="disabled"><a href="#" title="Prev"><i class="icon-angle-left"></i></a></li>';
        }else{
            prev = '<li class="prev"><a href="#" title="Prev"><i class="icon-angle-left"></i></a></li>';
        }

        var next = '';
        if(page.num == pageCount){
            next = '<li class="disabled"><a href="#" title="Next"><i class="icon-angle-right"></i></a></li>';
        }else{
            next = '<li class="next"><a href="#" title="Next"><i class="icon-angle-right"></i></a></li>';
        }

        var total = '<li class="pageCount">共' + pageCount + '页</li> <li class="topages">到第<input id="page_num" type="text"/>页</li><li class="gopage"><button id="page_enter">GO</button></li>';
        var lis = '';
        var show = 4;
        if(page.num >3){
            lis += '<li><a href="#">1</a></li>';
        }
        if(page.num >4){
            lis += '<li class="disabled"><a href="#">...</a></li>';
        }

        var start = page.num - 2;
        if(start < 1){
            start = 1;
        }
        var end = start + show;
        if(end > pageCount){
            end = pageCount;
            if(pageCount > show)
                start = end - show;
        }

        for (var i = start; i <= end; i++) {
            if (i == page.num) {
                lis += '<li class="active"><a href="#">' + i + '</a></li>';
            } else {
                lis += '<li><a href="#">' + i + '</a></li>';
            }
        }

        if( page.num + 2 < pageCount){
            lis += '<li class="disabled"><a href="#">...</a></li>';
        }

        pageContainer += pageContainer + prev + lis + next + total + '</ul></div>';



        $(els).html(pageContainer);

        $(els).off("click","a")

        $(els).on("click","a",function(){
            var li = $(this).parent();
            if(li.hasClass("disabled"))
                return;
            var pnum = $(this).html();
            if(li.hasClass("prev")){
                pnum = page.num - 1;
            }else if(li.hasClass("next")){
                pnum = page.num + 1;
            }
            cb && cb(pnum);
        })
        $(els).off("click","#page_enter")

        $(els).on("click","#page_enter",function(){
            var num = $("#page_num").val();
            if(num<1)num=1;
            if(num>pageCount)num=pageCount;
            cb && cb(num);
        })
        $(els).off("keydown","#page_num")

        $(els).on("keydown","#page_num",function(e){
            if(e.keyCode == 13){
                var num = $("#page_num").val();
                if(num<1)num=1;
                if(num>pageCount)num=pageCount;
                cb && cb(num);
            }
        })
    };
    T.register('page', p);
}(T.$);


!function ($) {
    var util = {};
    util.script = function (str) {
        str = (str || '').trim();
        var tag = false;

        str = str.replace(/\$\{([^\}]*)\}/g, function (s, s1) {
            try {
                tag = true;
                return eval(s1.trim());
            } catch (e) {
                return '';
            }

        });

        return tag ? util.script(str) : str;
    };
    util.provider = function (str, data) {
        str = (str || '').trim();
        return str.replace(/\$\{([^\}]*)\}/g, function (s, s1) {
            return data[s1.trim()] || '';
        });
    };
    util.getHTML = function (url, callback) {
        T.ajax(url, {dataType: 'text'},
            function (html) {
                callback && callback(T.util.script(html || ''));
            }
        );
    };
    T.register('util', util);
}(T.$);

!function ($) {
    var session = function(){
        var k,v;
        k = arguments[0];
        if(arguments.length==2){
            v = arguments[1]||'';
            try{
                sessionStorage.setItem(k, T.JSON.stringify(v));
                //return true;
            }catch(e){
                sessionStorage.setItem(k, v.toString());
                //return false;
            }
        }else{
            try{
                return T.JSON.parse(sessionStorage.getItem(k));
            }catch(e){
                return sessionStorage.getItem(k);
            }
        }
    };
    T.register('session', session);
}(T.$);

!function ($) {
    //初始化cache
    var cache = function(){
        var k,v;
        k = arguments[0];
        if(arguments.length==2){
            v = arguments[1]||'';
            try{
                localStorage.setItem(k, T.JSON.stringify(v));
                //return true;
            }catch(e){
                localStorage.setItem(k, v.toString());
                //return false;
            }
        }else{
            try{
                return T.JSON.parse(localStorage.getItem(k));
            }catch(e){
                return localStorage.getItem(k);
            }
        }
    };
    T.register('cache', cache);
}(T.$);



/*
 * 扩展JSON:T.JSON.stringify和T.JSON.parse，用法你懂
 * */
!function () {
    var JSON = {};
    JSON.parse = function (str) {
        try {
            return eval("(" + str + ")")
        } catch (e) {
            return null
        }
    };
    JSON.stringify = function (o) {
        var r = [];
        if (typeof o == "string") {
            return '"' + o.replace(/([\'\"\\])/g, "\\$1").replace(/(\n)/g, "\\n").replace(/(\r)/g, "\\r").replace(/(\t)/g, "\\t") + '"'
        }
        if (typeof o == "undefined") {
            return ""
        }
        if (typeof o != "object") {
            return o.toString()
        }
        if (o === null) {
            return null
        }
        if (o instanceof Array) {
            for (var i = 0; i < o.length; i++) {
                r.push(this.stringify(o[i]))
            }
            r = "[" + r.join() + "]"
        } else {
            for (var i in o) {
                r.push('"' + i + '":' + this.stringify(o[i]))
            }
            r = "{" + r.join() + "}"
        }
        return r
    };
    JSON.toParams = function (json) {
        var str = [];
        for (var k in json) {
            var v = json[k];
            v = json[k] instanceof Array ? json[k] : [json[k]];
            for (var i = 0; i < v.length; i++) {
                str.push(v[i])
            }
        }
        return str.join("&")
    };
    T.register('JSON', JSON);
}();

