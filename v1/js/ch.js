;(function (window, undefind) {
    // 保存user和ch的关键字, 防止被重写后没法恢复.
    var _user = window.user,
        _ch = window.ch,
        ENVIRONMENT = 'PUB';    // 当前开发环境是开发环境(DEV)，还是发布环境(PUB)

    // user构造函数入口(user.fn.init)
    var user = window.user = window.ch = function () {
        return new user.fn.init();
    };

    // user初始化对象
    user.fn = user.prototype = {
        constructor: user,
        init: function () {
            // 此处初始化方法
            this.user = 'v1.1.0';
            return this;
        }
    };

    // 使user.fn.init也能实例化一个对象
    user.fn.init.prototype = user.fn;

    // 在user中和user对象中扩展方法
    user.extend = user.fn.extend = function (obj) {
        var k;
        for (k in obj) {
            this[k] = obj[k];
        }
    };

    // 私有成员,基础参数
    user.extend({
        devParams: {
            url: '192.168.15.128'
        },
        pubParams: {
            url: 'http://www.user.com'
        },
        params: {
            regexp: {
                account: /^[a-zA-Z][a-zA-Z0-9_]{4,9}$/,   // 匹配帐号是否合法(字母开头，允许5-10字节，允许字母数字下划线)
                name: /^[\u4E00-\u9FA5]{2,4}$/,           // 表单验证姓名(规则：2-4位汉字)
                phone: /^1[34578]\d{9}$/,                // 手机验证
                tel: /(\d{3}-|\d{4}-)?(\d{8}|\d{7})?/,    // 国内固话
                idcard: /^(\d{6})(19)(\d{2})(0|1)(\d)([0-3])(\d)(\d{3})([0-9]|X|x)$/,    // 匹配大陆身份证，19**
                email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,                          // 邮箱
                ip: /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/  // ip
            }
        },
        init: function () {
            if (ENVIRONMENT === "PUB") {
                for (var k in this.pubParams) {
                    this.params[k] = this.pubParams[k];
                }
                return this;
            };
            for (var k in this.devParams) {
                this.params[k] = this.devParams[k];
            };
            return this;
        }
    });

    // 基础方法
    user.extend({
        // 是否支持本地存储
        storageIsAvailable: function (type) {
            try {
                var storage = window[type],
                    x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch (e) {
                return false;
            }
        },
        // flash版本
        flashIsLoaded: function () {
            var hasFlash = 0, flashVersion = 0, swf, VSwf;
            if (document.all) {
                swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
                if (swf) {
                    hasFlash = 1;
                    VSwf = swf.GetVariable("$version");
                    flashVersion = parseInt(VSwf.split(" ")[1].split(",")[0]);
                }
            } else {
                if (navigator.plugins && navigator.plugins.length > 0) {
                    swf = navigator.plugins["Shockwave Flash"];
                    if (swf) {
                        hasFlash = 1;
                        var words = swf.description.split(" ");
                        for (var i = 0; i < words.length; ++i) {
                            if (isNaN(parseInt(words[i]))) continue;
                            flashVersion = parseInt(words[i]);
                        }
                    }
                }
            }
            return {
                hasFlash: hasFlash,
                version: flashVersion
            };
        },
        // 基本信息
        getBaseInfo: function () {
            var baseInfo = {}, userAgent = navigator.userAgent.toLowerCase();
            baseInfo.borwser = {
                userAgent: navigator.userAgent,
                version: (userAgent.match( /.+(?:rv|it|ra|ie)[\/: ]([\d.]+)/ ) || [])[1],
                chrome: /webkit/.test( userAgent ),
                opera: /opera/.test( userAgent ),
                msie: /msie/.test( userAgent ) && !/opera/.test( userAgent ),
                mozilla: /mozilla/.test( userAgent ) && !/(compatible|webkit)/.test( userAgent )
            };
            baseInfo.screen = {
                width: window.screen.height,
                height: window.screen.width
            };
            return baseInfo;
        },
        // 获取url地址参数
        getRequestPrams: function () {
            var str = '',
                strs = '',
                url = location.search,
                theRequest = new Object({});
            if (url.indexOf("?") != -1) {
                str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    // theRequest[strs[i].split("=")[0]] = strs[i].split("=")[1];   // 不转码
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        // 定时器
        timeCounter: function (paramObj, beforeCallback, timeCallback, afterCallback) {
            /**
             * 倒计时，分为两种，A模式为固定值(3600)，B模式为固定时间(2017 03 06 12:37)。pc&mobile
             * @param paramObj.initDiff         若为A模式，传递倒计时毫秒数除以10;若为B模式，则传null
             * @param paramObj.interval         定时器时间间隔
             * @param paramObj.targetTime       任意格式的时间
             * @param paramObj.day              将要显示天的位置
             * @param paramObj.hour             将要显示小时的位置
             * @param paramObj.minute           将要显示分的位置
             * @param paramObj.second           将要显示秒的位置
             * @param paramObj.miniSecond       将要显示微秒的位置
             * @param beforeCallback            倒计未结束执行的回调
             * @param timeCallback              倒计时结束时执行的回调
             * @param afterCallback             倒计时结束后执行的回调
             * @returns {boolean}               倒计时的执行状态，true为正在执行，false为结束了。
             * @constructor
             * paramObj示例：{initDiff: null, targetTime: '2017-04-18T03:24:00', day: $('.day'), hour: $('.hour'), minute: $('.minute'),second: $('.second'),miniSecond: $('.miniSecond')}
             */
            var day = 0,
                hour = 0,
                minute = 0,
                second = 0,
                miniSecond = 0,
                countFlag = true,
                nowTime = Date.parse(new Date()),
                targetTime = Date.parse(paramObj.targetTime),
                intDiff = paramObj.initDiff || parseInt((targetTime - nowTime) / 10);
            var timer = setInterval(function () {
                if (intDiff > 0) {
                    day = Math.floor(intDiff / (60 * 60 * 24 * 100));
                    hour = Math.floor(intDiff / (60 * 60 * 100)) - (day * 24);
                    minute = Math.floor(intDiff / 60 / 100) - (day * 24 * 60) - (hour * 60);
                    second = Math.floor(intDiff / 100) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
                    miniSecond = Math.floor(intDiff) - (day * 24 * 60 * 60 * 100) - (hour * 60 * 60 * 100) - (minute * 60 * 100) - (second * 100);
                }
                if (day <= 9) day = '0' + day;
                if (hour <= 9) hour = '0' + hour;
                if (minute <= 9) minute = '0' + minute;
                if (second <= 9) second = '0' + second;
                if (miniSecond <= 9) miniSecond = '0' + miniSecond;
                intDiff--;
                if (intDiff <= 0) {
                    clearInterval(timer);
                    miniSecond = '00';
                    countFlag = false;
                    timeCallback();
                }
                paramObj.day.text(day);
                paramObj.hour.text(hour);
                paramObj.minute.text(minute);
                paramObj.second.text(second);
                paramObj.miniSecond.text(miniSecond);
                beforeCallback();
            }, paramObj.interval);
            /*倒计时结束后进来的游客看到的界面变化*/
            if (!paramObj.initDiff && (nowTime >= targetTime)) {
                /*做相应的处理操作*/
                countFlag = false;
                afterCallback();
            }
            return countFlag;
        },
        // 当前时间的各种格式
        returnNowTime: function (paramObj) {
            // 传参为时间后的符号，minute为null时返回没有秒数的时间
            // 传参示例：{year: '-',month: '-',day: ' ',hour: ':', minute: null,}
            var date = new Date(),
                year = date.getFullYear(),
                month = ((date.getMonth() + 1) < 10) ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1),
                day = (date.getDate() < 10) ? ('0' + date.getDate()) : date.getDate(),
                hour = (date.getHours() < 10) ? ('0' + date.getHours()) : date.getHours(),
                minute = (date.getMinutes() < 10) ? ('0' + date.getMinutes()) : date.getMinutes(),
                second = (date.getSeconds() < 10) ? ('0' + date.getSeconds()) : date.getSeconds();
            $('#wrapper').text(year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second);
            if (paramObj.minute == null) {
                return year + paramObj.year + month + paramObj.month + day + paramObj.day + hour + paramObj.hour + minute;
            } else {
                return year + paramObj.year + month + paramObj.month + day + paramObj.day + hour + paramObj.hour + minute + paramObj.minute + second;
            }
        },
        // 距离现在还剩多久
        reminTime: function (time, noTimeCallback) {
            // 某一时间距离现在还剩多久,传参为那一刻的时间转换成*秒数*后的数值，number类型,callback为时间到后的回调，采用的是四舍五入
            var time = parseInt(time),
                baseTime = Date.parse(new Date()) / 1000,
                diff = time - baseTime,
                oneMinute = 60,
                oneHour = 60 * 60,
                oneDay = 60 * 60 * 24,
                oneMonth = 60 * 60 * 24 * 30,
                oneYear = 60 * 60 * 24 * 30 * 12;
            if (diff < 0) {
                noTimeCallback();
            } else if (diff < oneMinute) {
                return diff + '秒';
            } else if (diff < oneHour) {
                return Math.round(diff / oneMinute) + '分钟';
            } else if (diff < oneDay) {
                return Math.round(diff / oneHour) + '小时';
            } else if (diff < oneMonth) {
                return Math.round(diff / oneDay) + '天';
            } else if (diff < oneYear) {
                return Math.round(diff / oneMonth) + '月';
            } else if (diff < oneYear * 5) {
                return Math.round(diff / oneYear) + '年';
            }
        },
        // 过去了多久
        timeAgo: function (time) {
            // 某一时间到现在过去了多久,传参为那一刻的时间转换成*秒数*后的数值，number类型,采用的是四舍五入
            var time = parseInt(time),
                baseTime = Date.parse(new Date()) / 1000,
                diff = baseTime - time,
                oneMinute = 60,
                oneHour = 60 * 60,
                oneDay = 60 * 60 * 24,
                oneMonth = 60 * 60 * 24 * 30,
                oneYear = 60 * 60 * 24 * 30 * 12;
            if (diff < oneMinute) {
                return '刚刚';
            } else if (diff < oneHour) {
                return Math.round(diff / oneMinute) + '分钟前';
            } else if (diff < oneDay) {
                return Math.round(diff / oneHour) + '小时前';
            } else if (diff < oneMonth) {
                return Math.round(diff / oneDay) + '天前';
            } else if (diff < oneYear) {
                return Math.round(diff / oneMonth) + '月前';
            } else if (diff < oneYear * 5) {
                return Math.round(diff / oneYear) + '年前';
            }
        },
        // ajax网络请求
        httpRequest: function (method, url, data, successCallback) {
            $.ajax({
                type: method,
                url: url,
                data: data,
                // dataType: 'json',
                // contentType: "application/json; charset=utf-8",
                beforeSend: function () {
                    // 发送请求之前处理，比如loading
                },
                success: function (data) {
                    // 请求出错处理，比如token失效
                    successCallback(data);
                },
                error: function () {
                    console.log('error');
                },
                complete: function () {
                    // 请求完成后处理，比如移除loading
                }
            });
        },
        // 垂直滚动条
        verticalScrollBar: function (element, width, height) {
            // 垂直滚动滚动条,传入参数为jquery元素和元素宽高(number)，需要引入slimScroll插件
            element.slimScroll({
                height: height + 'px',
                size: '4px',
                position: 'right',
                color: '#756cb7',
                alwaysVisible: false,
                distance: '1px',
                start: 'bottom',
                railVisible: true,
                /* railColor: '#756cb7',*/
                railOpacity: 0.3,
                wheelStep: 10,
                allowPageScroll: false,
                disableFadeOut: false
            });
            $('.slimScrollDiv').css('width', width + 'px');
        },
        // 点击回顶
        gotoTop: function (element) {
            $(window).scroll(function () {
                if ($(window).scrollTop() > 100) {
                    element.fadeIn(150);
                } else {
                    element.fadeOut(150);
                }
            });
            element.click(function () {
                $('body,html').animate({scrollTop: 0}, 300);
                return false;
            });
        },
        // 设置本地存储
        setLocalStorage: function (key, value) {
            if (uni.fn.StorageAvailable('localStorage')) {
                return localStorage.setItem(key, JSON.stringify(value));
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        // 获取本地存储
        getLocalStorage: function (key) {
            if (uni.fn.StorageAvailable('localStorage')) {
                return JSON.parse(localStorage.getItem(key));
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        // 清除本地存储
        removeLocalStorage: function (key) {
            if (uni.fn.StorageAvailable('localStorage')) {
                localStorage.removeItem(key);
                return null;
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        // 本地存储变化回调
        rereshLocalData: function (key, callback) {
            // 用于监视本地存储数据的变化,传参为存储的键和回调函数
            window.onstorage = function (e) {
                if (e.key == key) {
                    callback();
                }
            }
        },
        // 设置session
        setSessionStorage:function(key,value){
            return window.sessionStorage?sessionStorage.setItem(key,value):this.setCookie(key,value,1000);
        },
        // 获取session
        getSessionStorage:function(key){
            return window.sessionStorage?sessionStorage.getItem(key):this.getCookie(key);
        },
        // 清除session
        clearSessionStorage:function(key){
            if(key==-1){
                window.sessionStorage.clear();
            }else{
                window.sessionStorage.removeItem(key);
            }
        },
        // 设置cookie
        setCookie: function (name, value, Hours) {
            var d = new Date();
            var offset = 8;
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var nd = utc + (3600000 * offset);
            var exp = new Date(nd);
            exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString() + ";domain=360doc.com;"
        },
        // 获取cookie
        getCookie: function (name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) return unescape(arr[2]);
            return null
        },
        // 删除cookie
        delCookie:function(name){
            var exp = new Date();
            exp.setTime(exp.getTime() - 1);
            var cval=getCookie(name);
            if(cval!=null)
                document.cookie= name + "="+cval+";expires="+exp.toGMTString();
        },
        // url编码
        urlEncode: function (str) {
            return encodeURIComponent(str).
            replace(/['()]/g, escape).
            replace(/\*/g, '%2A').
            replace(/%(?:7C|60|5E)/g, unescape);
        },
        // url解码
        urlDecode: function (str) {
            try {
                return decodeURIComponent(str);
            } catch(e) {
                console.error(e);
            }
        },
        // base64加密和解密
        base64: function(){
            //调用方法 加密new ch.base64().encode("somestrings");解密 new ch.base64().decode("somestrings")
            _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            this.encode = function (input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;
                input = _utf8_encode(input);
                while (i < input.length) {
                    chr1 = input.charCodeAt(i++);
                    chr2 = input.charCodeAt(i++);
                    chr3 = input.charCodeAt(i++);
                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;
                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }
                    output = output +
                        _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                        _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
                }
                return output;
            }
            // public method for decoding
            this.decode = function (input) {
                var output = "";
                var chr1, chr2, chr3;
                var enc1, enc2, enc3, enc4;
                var i = 0;
                input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
                while (i < input.length) {
                    enc1 = _keyStr.indexOf(input.charAt(i++));
                    enc2 = _keyStr.indexOf(input.charAt(i++));
                    enc3 = _keyStr.indexOf(input.charAt(i++));
                    enc4 = _keyStr.indexOf(input.charAt(i++));
                    chr1 = (enc1 << 2) | (enc2 >> 4);
                    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                    chr3 = ((enc3 & 3) << 6) | enc4;
                    output = output + String.fromCharCode(chr1);
                    if (enc3 != 64) {
                        output = output + String.fromCharCode(chr2);
                    }
                    if (enc4 != 64) {
                        output = output + String.fromCharCode(chr3);
                    }
                }
                output = _utf8_decode(output);
                return output;
            }
            // private method for UTF-8 encoding
            _utf8_encode = function (string) {
                string = string.replace(/\r\n/g,"\n");
                var utftext = "";
                for (var n = 0; n < string.length; n++) {
                    var c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }
                return utftext;
            }
            // private method for UTF-8 decoding
            _utf8_decode = function (utftext) {
                var string = "";
                var i = 0;
                var c = c1 = c2 = 0;
                while ( i < utftext.length ) {
                    c = utftext.charCodeAt(i);
                    if (c < 128) {
                        string += String.fromCharCode(c);
                        i++;
                    } else if((c > 191) && (c < 224)) {
                        c2 = utftext.charCodeAt(i+1);
                        string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                        i += 2;
                    } else {
                        c2 = utftext.charCodeAt(i+1);
                        c3 = utftext.charCodeAt(i+2);
                        string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                        i += 3;
                    }
                }
                return string;
            }
        },
        // 打开新窗口
        openWindow: function (url, windowName, width, height) {
            var x = parseInt(screen.width / 2.0) - (width / 2.0);
            var y = parseInt(screen.height / 2.0) - (height / 2.0);
            var isMSIE = (navigator.appName == "Microsoft Internet Explorer");
            if (isMSIE) {
                var p = "resizable=1,location=no,scrollbars=no,width=";
                p = p + width;
                p = p + ",height=";
                p = p + height;
                p = p + ",left=";
                p = p + x;
                p = p + ",top=";
                p = p + y;
                retval = window.open(url, windowName, p);
            } else {
                var win = window.open(url, "ZyiisPopup", "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,modal=yes,width=" + width + ",height=" + height + ",resizable=no");
                eval("try { win.resizeTo(width, height); } catch(e) { }");
                win.focus();
            }
        },
        // 关闭浏览器
        closeWindow: function () {
            if (navigator.userAgent.indexOf("MSIE") > 0) {
                if (navigator.userAgent.indexOf("MSIE 6.0") > 0) {
                    window.opener = null;
                    window.close();
                } else {
                    window.open('', '_top');
                    window.top.close();
                }
            } else if (navigator.userAgent.indexOf("Firefox") > 0 || navigator.userAgent.indexOf("Chrome") > 0) {
                window.self.opener = null;
                window.self.close();
            } else {
                window.opener = null;
                window.open('', '_self', '');
                window.self.close();
            }
        },
        // 关闭浏览器，刷新父页面
        closeWinReresh: function () {
            window.opener.location.reload();
            window.close();
        },
        // 图片懒加载
        lazyLoad: function (element, callback) {
            // 图片懒加载，传入参数为图片元素和图片显示时执行的回调函数
            $(window).scroll(function () {
                element.each(function () {
                    var _this = this;
                    var $imgSrc = $(this).attr('data-src');
                    var $imgTop = $(this).offset().top;
                    /*获取每张图片对应距离document顶部的高度*/
                    var scrollT = $(window).scrollTop();
                    /*获取滚轮滚动的距离*/
                    var halfDoc = $(window).height();
                    /*获取浏览器窗口可视高度*/
                    if ((scrollT + halfDoc) >= $imgTop) { /*如果滚动距离加上窗口可视高度大于该图片距离document顶部的高度*/
                        setTimeout(function () {
                            callback();
                            $(_this).attr('src', $imgSrc);
                        }, 1000);
                    }
                })
            })
        },
        // 图片错误处理
        imgErrorHander: function (imgElement, defaultImgSrc) {
            // 图片未加载出来执行的方法,传入参数为图片元素和默认图片的路径，需放在js加载完后执行
            var url = imgElement.attr('src');
            if (url === undefined || url === null || url == "undefined" || url === "") {
                imgElement.attr('src', defaultImgSrc);
            }
            imgElement.error(function () {
                $(this).attr("src", defaultImgSrc);
            });
        },
        // 生成随机时间戳
        randomTimeStamp: function () {
            var a = Math.random, b = parseInt;
            return Number(new Date()).toString() + b(10 * a()) + b(10 * a()) + b(10 * a());
        },
    });

    // 常见功能方法
    user.extend({
        // tableBar切换
        tableBar: function (element, styleName, responseElement, callback) {
            // tableBar切换,传参为table栏元素，点击后改变的样式名，点击后响应的元素,回调函数
            element.click(function () {
                var index = $(this).index();
                $(this).addClass(styleName).siblings().removeClass(styleName);
                responseElement.each(function (Index, ele) {
                    if (Index == index) {
                        $(ele).removeClass("hide").addClass("show")
                            .siblings().removeClass("show").addClass("hide");
                        callback();
                    }
                })
            });
        },
        // hash路由
        hashRoute: function () {
            /*调用示例：uni.HashRoute();
             uni.params.hash.route('/', home);*/
            function Router() {
                this.routes = {};
                this.currentUrl = '';
            }

            Router.prototype.route = function (path, callback) {
                this.routes[path] = callback || function () {
                };
            };
            Router.prototype.refresh = function () {
                this.currentUrl = location.hash.slice(1) || '/';
                this.routes[this.currentUrl]();
            };
            Router.prototype.init = function () {
                window.addEventListener('load', this.refresh.bind(this), false);
                window.addEventListener('hashchange', this.refresh.bind(this), false);
            }
            this.params.hash = new Router();
            this.params.hash.init();
        },
        // 弹框
        dialog: function () {
            // 封装弹框，对话框或者引用第三方
        },
        // loading
        loading: function () {
            // 封装loading
        },
        // 文字溢出隐藏
        textOverflowEllipsis: function (element, maxLength) {
            var maxwidth = maxLength;
            if ($(this).text().length > maxwidth) {
                $(this).text($(this).text().substring(0, maxwidth));
                $(this).html($(this).html() + '...');
            }
        },
        // 鼠标悬停动画
        fadeInfo: function (obj, fadeObj) {
            // 鼠标悬停显示，离开隐藏,FadeInfo没有动画，SlideInfo有动画
            obj.mouseenter(function (e) {
                fadeObj.fadeIn(160);
            }).mouseleave(function (e) {
                fadeObj.fadeOut(160);
            });
        },
        slideInfo: function (obj, fadeObj) {
            obj.mouseenter(function (e) {
                fadeObj.slideDown();
            }).mouseleave(function (e) {
                fadeObj.slideUp();
            });
        },
        // 轮播图
        bannerJs: function () {
            // 封装轮播图或者第三方轮播图插件
        },
        // 分页
        paganation: function () {
            // 封装分页或者第三方分页插件
        },
        // 扫描二维码
        qrcode: function (element, url) {
            // 依赖于jquery.qrcode.min.js
            element.qrcode(url);
        },
        // 楼梯导航
        stairNav: function () {
            // 封装楼梯导航或者第三方楼梯导航插件
        },
        // 上传图片转成base64
        uploadImg2Base64: function () {
            /*调用示例：document.getElementById("img_upload").addEventListener('change', uni.ImgToBase64, false);！！！必须用原生js*/
            var file = this.files[0];
            if (!/image\/\w+/.test(file.type)) {
                alert("请确保文件为图像类型");
                return false;
            }
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function (e) {
                console.log(this.result);
                return this.result;
            }
        },
        // 图片裁剪
        ImgClip: function () {
            // 封装图片裁剪或者第三方图片裁剪
        }
    });

    // 附加功能
    user.extend({
        // 浏览器加入收藏
        AddFavorite: function (sURL, sTitle) {
            // 加入收藏夹，传参为地址和title
            try {
                window.external.addFavorite(sURL, sTitle)
            } catch (e) {
                try {
                    window.sidebar.addPanel(sTitle, sURL, "")
                } catch (e) {
                    alert("加入收藏失败，请使用Ctrl+D进行添加")
                }
            }
        },
        // 将网址设为首页
        setHomepage: function (url) {
            if (document.all) {
                document.body.style.behavior = 'url(#default#homepage)';
                document.body.setHomePage(url)
            } else if (window.sidebar) {
                if (window.netscape) {
                    try {
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
                    } catch (e) {
                        alert("该操作被浏览器拒绝，如果想启用该功能，请在地址栏内输入 about:config,然后将项 signed.applets.codebase_principal_support 值该为true")
                    }
                }
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
                prefs.setCharPref('browser.startup.homepage', url)
            }
        },
        // 提取页面中所有的网址
        getAllUrl: function () {
            return document.documentElement.outerHTML.match(/(url\(|src=|href=)[\"\']*([^\"\'\(\)\<\>\[\] ]+)[\"\'\)]*|(http:\/\/[\w\-\.]+[^\"\'\(\)\<\>\[\] ]+)/ig).join("\r\n").replace(/^(src=|href=|url\()[\"\']*|[\"\'\>\) ]*$/igm, "");
        },
        // 检测url是否有效
        checkUrlIsAvaliable: function (URL) {
            var xmlhttp = new ActiveXObject("microsoft.xmlhttp");
            xmlhttp.Open("GET", URL, false);
            try {
                xmlhttp.Send();
            } catch (e) {
            } finally {
                var result = xmlhttp.responseText;
                if (result) {
                    if (xmlhttp.Status == 200) {
                        return (true);
                    } else {
                        return (false);
                    }
                } else {
                    return (false);
                }
            }
        },
        // html转义
        encodeHtml: function (html) {
            return html.replace(/&/g, '&').replace(/\"/g, '"').replace(/</g, '<').replace(/>/g, '>');
        },
        // 去掉url前缀(http://)
        removePreFix: function (a) {
            a = a.replace(/：/g, ":").replace(/．/g, ".").replace(/／/g, "/");
            while (trim(a).toLowerCase().indexOf("http://") == 0) {
                a = trim(a.replace(/http:\/\//i, ""));
            }
            return a;
        },
        // 转换大写金额
        tranform2Num: function (tranvalue) {
            try {
                var i = 1;
                var dw2 = new Array("", "万", "亿"); //大单位
                var dw1 = new Array("拾", "佰", "仟"); //小单位
                var dw = new Array("零", "壹", "贰", "叁", "肆", "伍", "陆", "柒", "捌", "玖"); //整数部分用
                //以下是小写转换成大写显示在合计大写的文本框中
                //分离整数与小数
                var source = splits(tranvalue);
                var num = source[0];
                var dig = source[1];
                //转换整数部分
                var k1 = 0; //计小单位
                var k2 = 0; //计大单位
                var sum = 0;
                var str = "";
                var len = source[0].length; //整数的长度
                for (i = 1; i <= len; i++) {
                    var n = source[0].charAt(len - i); //取得某个位数上的数字
                    var bn = 0;
                    if (len - i - 1 >= 0) {
                        bn = source[0].charAt(len - i - 1); //取得某个位数前一位上的数字
                    }
                    sum = sum + Number(n);
                    if (sum != 0) {
                        str = dw[Number(n)].concat(str); //取得该数字对应的大写数字，并插入到str字符串的前面
                        if (n == '0') sum = 0;
                    }
                    if (len - i - 1 >= 0) { //在数字范围内
                        if (k1 != 3) { //加小单位
                            if (bn != 0) {
                                str = dw1[k1].concat(str);
                            }
                            k1++;
                        } else { //不加小单位，加大单位
                            k1 = 0;
                            var temp = str.charAt(0);
                            if (temp == "万" || temp == "亿") //若大单位前没有数字则舍去大单位
                                str = str.substr(1, str.length - 1);
                            str = dw2[k2].concat(str);
                            sum = 0;
                        }
                    }
                    if (k1 == 3) { //小单位到千则大单位进一
                        k2++;
                    }
                }
                //转换小数部分
                var strdig = "";
                if (dig != "") {
                    var n = dig.charAt(0);
                    if (n != 0) {
                        strdig += dw[Number(n)] + "角"; //加数字
                    }
                    var n = dig.charAt(1);
                    if (n != 0) {
                        strdig += dw[Number(n)] + "分"; //加数字
                    }
                }
                str += "元" + strdig;
            } catch (e) {
                return "0元";
            }
            return str;
            // 拆分整数与小数
            function splits(tranvalue) {
                var value = new Array('', '');
                temp = tranvalue.split(".");
                for (var i = 0; i < temp.length; i++) {
                    value = temp;
                }
                return value;
            }
        },
        // utf-8解码
        utf8Decode: function (str_data) {
            var tmp_arr = [], i = 0, ac = 0, c1 = 0, c2 = 0, c3 = 0;
            str_data += '';
            while (i < str_data.length) {
                c1 = str_data.charCodeAt(i);
                if (c1 < 128) {
                    tmp_arr[ac++] = String.fromCharCode(c1);
                    i++;
                } else if (c1 > 191 && c1 < 224) {
                    c2 = str_data.charCodeAt(i + 1);
                    tmp_arr[ac++] = String.fromCharCode(((c1 & 31) << 6) | (c2 & 63));
                    i += 2;
                } else {
                    c2 = str_data.charCodeAt(i + 1);
                    c3 = str_data.charCodeAt(i + 2);
                    tmp_arr[ac++] = String.fromCharCode(((c1 & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
                }
            }
            return tmp_arr.join('');
        }
    });

    // 公共成员,添加插件时调用
    user.fn.extend({

    });

    /* 初始化静态参数*/
    user.init();
})(window);