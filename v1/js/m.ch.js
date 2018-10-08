;(function (window, undefind) {
    // 保存chinahufei和ch的关键字, 防止被重写后没法恢复.
    var _chinahufei = window.chinahufei,
        _ch = window.ch,
        ENVIRONMENT = 'PUB';    // 当前开发环境是开发环境(DEV)，还是发布环境(PUB)

    // chinahufei构造函数入口(chinahufei.fn.init)
    var chinahufei = window.chinahufei = window.ch = function () {
        return new chinahufei.fn.init();
    };

    // chinahufei初始化对象
    chinahufei.fn = chinahufei.prototype = {
        constructor: chinahufei,
        init: function () {
            // 此处初始化方法
            this.chinahufei = 'v1.1.0';
            return this;
        }
    };

    // 使chinahufei.fn.init也能实例化一个对象
    chinahufei.fn.init.prototype = chinahufei.fn;

    // 在chinahufei中和chinahufei对象中扩展方法
    chinahufei.extend = chinahufei.fn.extend = function (obj) {
        var k;
        for (k in obj) {
            this[k] = obj[k];
        }
    };

    // 私有成员,基础参数
    chinahufei.extend({
        devParams: {
            url: '192.168.15.128'
        },
        pubParams: {
            url: 'http://www.chinahufei.com'
        },
        params: {
            mobileInfo: {},
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
            // 环境处理
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

    // 扩展方法
    chinahufei.extend({
        // 获取设备基本信息
        getMobileInfo: function () {
            var info = {
                screen: {},
                device: {
                    deviceType: 0,
                    deviceVal: ''
                },
                env: {
                    type: 0,
                    value: ''
                }
            };
            // 屏幕大小
            info.screen.width = window.screen.height;
            info.screen.height = window.screen.width;
            // 设备终端
            var sUserAgent = navigator.userAgent.toLowerCase(),
                bIsiOs = (/iPad|iPhone|iPod/.test(sUserAgent) && !window.MSStream),
                bIsAndroid = sUserAgent.match(/android/i) == "android",
                bIsMidp = sUserAgent.match(/midp/i) == "midp",
                bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4",
                bIsUc = sUserAgent.match(/ucweb/i) == "ucweb",
                bIsCE = sUserAgent.match(/windows ce/i) == "windows ce",
                bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile",

                isWeixin = sUserAgent.match(/MicroMessenger/i) == "micromessenger",
                isWeiBo = sUserAgent.match(/WeiBo/i) == "weibo",
                isQQ = sUserAgent.match(/QQ/i) == "qq";
            if (bIsiOs) {
                info.device.deviceType = 1;
                info.device.deviceVal = 'iOS';
            } else if (bIsAndroid) {
                info.device.deviceType = 2;
                info.device.deviceVal = 'Android';
            } else if (bIsWM) {
                info.device.deviceType = 3;
                info.device.deviceVal = 'Windows mobile';
            } else {
                info.device.deviceType = 0;
                info.device.deviceVal = 'pc';
            }
            // 第三方环境
            if (isWeixin) {
                info.env.type = 1;
                info.env.value = 'weixin';
            } else if (isWeiBo) {
                info.env.type = 2;
                info.env.value = 'weibo';
            } else if (isQQ) {
                info.env.type = 3;
                info.env.value = 'qq';
            } else {
                info.env.type = 0;
                info.env.value = '其他';
            }
            return info;
        },
        // 检测是否支持本地存储
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
        }
    });

    // 与app相关方法
    chinahufei.extend({
        // 设置js桥
        setupWebViewJavascriptBridge: function (callback) {
            if (window.WebViewJavascriptBridge) {
                return callback(WebViewJavascriptBridge);
            }
            if (window.WVJBCallbacks) {
                return window.WVJBCallbacks.push(callback);
            }
            window.WVJBCallbacks = [callback];
            var WVJBIframe = document.createElement('iframe');
            WVJBIframe.style.display = 'none';
            WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__';
            document.documentElement.appendChild(WVJBIframe);
            setTimeout(function () {
                document.documentElement.removeChild(WVJBIframe)
            }, 0)
        },
        // 连接js桥
        connectWebViewJavascriptBridge: function (callback) {
            if (window.WebViewJavascriptBridge) {
                callback(WebViewJavascriptBridge)
            } else {
                document.addEventListener(
                    'WebViewJavascriptBridgeReady'
                    , function () {
                        callback(WebViewJavascriptBridge)
                    },
                    false
                );
            }
        },
        // h5和客户端app交互
        webViewHandler: function (iOSCallback, androidCallback) {
            if (this.getMobileInfo().device.deviceType === 1) {
                this.setupWebViewJavascriptBridge(iOSCallback);
                return;
            }
            this.connectWebViewJavascriptBridge(androidCallback);
        },
        // 移动端手势
        gestureHander: function (idName, handerObj) {
            // 移动端手势，依赖于hammer插件,传入参数元素id名和回调函数对象, mobile
            /*handerObj示例: {left:callback1,right:callback2,up:callback3,down:callback4}*/
            var element = document.getElementById(idName);
            var mc = new Hammer(element);
            mc.get('pan').set({direction: Hammer.DIRECTION_ALL});

            var temp = new Hammer.Manager(element);
            temp.set({'touch-action': 'pan-y'});
            /*listen to events...*/
            mc.on("panleft panright panup pandown tap press", function (ev) {
                if (ev.type == "panleft") {
                    handerObj.left();
                } else if (ev.type == "panright") {
                    handerObj.right();
                } else if (ev.type == "panup") {
                    handerObj.up();
                } else if (ev.type == "pandown") {
                    handerObj.down();
                }
            });
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
        }
    });
    // 公共成员,添加插件时调用
    chinahufei.fn.extend({});

    /* 初始化静态参数*/
    chinahufei.init();
})(window);