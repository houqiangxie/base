;
(function (window, undefind) {
    var horseFox = function () {
        return new horseFox.fn.init();
    };
    horseFox.fn = horseFox.prototype = {
        constructor: horseFox,
        /*开发环境下为DEV,发布环境为PUB*/
        _ENV: 'DEV',
        DevParams: {
            url: "test7.ttddsh.com"
        },
        PubParams: {
            url: "www.vshowtv.com"
        },
        /*业务上用的参数对象*/
        params: {
            regexp: {
                account: /^[a-zA-Z][a-zA-Z0-9_]{4,9}$/,   // 匹配帐号是否合法(字母开头，允许5-10字节，允许字母数字下划线)
                name: /^[\u4E00-\u9FA5]{2,4}$/,           // 表单验证姓名(规则：2-4位汉字)
                phone:  /^1[34578]\d{9}$/,                // 手机验证
                tel: /(\d{3}-|\d{4}-)?(\d{8}|\d{7})?/,    // 国内固话
                idcard: /^(\d{6})(19)(\d{2})(0|1)(\d)([0-3])(\d)(\d{3})([0-9]|X|x)$/,    // 匹配大陆身份证，19**
                email: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/,                          // 邮箱
                ip: /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/  // ip
            }
        },
        init: function () {
            /*判断如果是开发环境，用DevParams的参数；如果是发布环境，用PubParams的参数*/
            if (this._ENV === "DEV") {
                for (var k in this.DevParams) {
                    this.params[k] = this.DevParams[k];
                }
            } else if (this._ENV === "PUB") {
                for (var k in this.DevParams) {
                    this.params[k] = this.PubParams[k];
                }
            }
            return this;
        }
    };
    horseFox.fn.init.prototype = horseFox.prototype;
    /* 将私有成员和公共成员都添加extend方法*/
    horseFox.extend = horseFox.fn.extend = function (obj) {
        var k;
        for (k in obj) {
            this[k] = obj[k];
        }
    };
    horseFox.fn.extend({
        /*http请求中，显示的ui页面*/
        HttpBeforeSend: function () {
            console.log("努力加载中...");
        },
        /*获取项目信息，传参为项目参数*/
        GetProjInfoNativeFunc: function (pragram) {
            localStorage.setItem("pras", JSON.stringify(pragram));
        },
        /*检测浏览器是否支持本地存储，type为localStorage*/
        StorageAvailable: function(type) {
            try {
                var storage = window[type],
                    x = '__storage_test__';
                storage.setItem(x, x);
                storage.removeItem(x);
                return true;
            }
            catch(e) {
                return false;
            }
        }
    });
    /* pc&mobile */
    horseFox.extend({
        /*方法用参数对象*/
        params:{
            router: null
        },
        /*通过hash设置前端路由，可刷新*/
        HashRoute: function () {
            /*调用示例：hf.HashRoute();
             hf.params.hash.route('/', home);*/
            function Router() {
                this.routes = {};
                this.currentUrl = '';
            }
            Router.prototype.route = function(path, callback) {
                this.routes[path] = callback || function(){};
            };
            Router.prototype.refresh = function() {
                this.currentUrl = location.hash.slice(1) || '/';
                this.routes[this.currentUrl]();
            };
            Router.prototype.init = function() {
                window.addEventListener('load', this.refresh.bind(this), false);
                window.addEventListener('hashchange', this.refresh.bind(this), false);
            }
            this.params.hash = new Router();
            this.params.hash.init();
        },
        /*获取url参数对象，返回值为包含多个参数的对象,pc&mobile */
        GetRequestPrams: function () {
            var str = '',
                strs = '',
                url = location.search,
                theRequest = new Object({});
            if (url.indexOf("?") != -1) {
                str = url.substr(1);
                strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    theRequest[strs[i].split("=")[0]] = unescape(strs[i].split("=")[1]);
                }
            }
            return theRequest;
        },
        /*获取浏览器or屏幕尺寸，返回为包含宽高的对象，pc&mobile*/
        BrowserScreen: function () {
            var srceenValue = {};
            var height = window.screen.height, width = window.screen.width;
            srceenValue.width = width;
            srceenValue.height = height;
            return srceenValue;
        },
        /*关闭浏览器，pc*/
        CloseWindow: function () {
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
        /*关闭浏览器，刷新打开此页面的根页面，regExp为正则匹配条件，没有则为true,pc*/
        CloseWinReresh: function (regExp) {
            //示例： var tempvara = parseInt(window.opener.location.href.split('com/')[1].split('.')[0]);
            if ( regExp ) {
                window.opener.location.reload();
            }
            window.close();
        },
        /*判断终端是pc还是mobile,返回值为number,0为pc,1为mobile,pc&mobile*/
        IsWap: function () {
            var motionType = 0;
            var sUserAgent = navigator.userAgent.toLowerCase();
            var bIsIpad = sUserAgent.match(/ipad/i) == "ipad";
            var bIsIphoneOs = sUserAgent.match(/iphone os/i) == "iphone os";
            var bIsMidp = sUserAgent.match(/midp/i) == "midp";
            var bIsUc7 = sUserAgent.match(/rv:1.2.3.4/i) == "rv:1.2.3.4";
            var bIsUc = sUserAgent.match(/ucweb/i) == "ucweb";
            var bIsAndroid = sUserAgent.match(/android/i) == "android";
            var bIsCE = sUserAgent.match(/windows ce/i) == "windows ce";
            var bIsWM = sUserAgent.match(/windows mobile/i) == "windows mobile";
            if (bIsIpad || bIsIphoneOs || bIsMidp || bIsUc7 || bIsUc || bIsAndroid || bIsCE || bIsWM) {
                motionType = 1;
            }
            return motionType;
        },
        /*获取浏览器名称，返回值为number,0是IE,1是safari,2是chrome,3是firefox,4是opera,-1是其他，pc&mobile*/
        BrowserType: function () {
            var userAgent = navigator.userAgent;
            var isOpera = userAgent.indexOf("Opera") > -1;
            if (isOpera) {
                return 4;
            }
            if (userAgent.indexOf("Firefox") > -1) {
                return 3;
            }
            if (userAgent.indexOf("Chrome") > -1) {
                return 2;
            }
            if (userAgent.indexOf("Safari") > -1) {
                return 1;
            }
            if (userAgent.indexOf("compatible") > -1 && userAgent.indexOf("MSIE") > -1 && !isOpera) {
                return 0;
            }
            if (!!window.ActiveXObject || "ActiveXObject" in window) {
                return 0;
            }
            return -1;
        },
        /*判断是不是微信*/
        IsWechat: function () {
            var ua = navigator.userAgent.toLowerCase();
            if (ua.match(/MicroMessenger/i) == "micromessenger") {
                return true;
            } else {
                return false;
            }
        },
        /*检查浏览器加载flash以及flash版本，返回值为对象,hasFlash为0为没有，为1是有，version是版本,pc*/
        FlashCheck: function () {
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
        /*文字溢出省略,传参为jquery元素和最长长度，pc&mobile*/
        TextOverflowEllipsis: function (element, maxLength) {
            var maxwidth = maxLength;
            if ($(this).text().length > maxwidth) {
                $(this).text($(this).text().substring(0, maxwidth));
                $(this).html($(this).html() + '...');
            }
        },
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
         */
        TimeCount: function (paramObj, beforeCallback, timeCallback, afterCallback) {
            /*paramObj示例：{initDiff: null, targetTime: '2017-04-18T03:24:00', day: $('.day'), hour: $('.hour'), minute: $('.minute'),second: $('.second'),miniSecond: $('.miniSecond')}*/
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
        /*返回任意形式的当前时间,传参为时间后的符号，minute为null时返回没有秒数的时间，pc&mobile*/
        ReturnNowTime: function (paramObj) {
            /*传参示例：{year: '-',month: '-',day: ' ',hour: ':', minute: null,}*/
            var date = new Date(),
                year = date.getFullYear(),
                month = ((date.getMonth()+1)<10)?('0'+(date.getMonth()+1)):(date.getMonth()+1),
                day = (date.getDate()<10)?('0'+date.getDate()):date.getDate(),
                hour = (date.getHours()<10)?('0'+date.getHours()):date.getHours(),
                minute = (date.getMinutes()<10)?('0'+date.getMinutes()):date.getMinutes(),
                second = (date.getSeconds()<10)?('0'+date.getSeconds()):date.getSeconds();
            $('#wrapper').text(year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second);
            if ( paramObj.minute == null ) {
                return year+paramObj.year+month+paramObj.month+day+paramObj.day+hour+paramObj.hour+minute;
            } else {
                return year+paramObj.year+month+paramObj.month+day+paramObj.day+hour+paramObj.hour+minute+paramObj.minute+second;
            }
        },
        /*某一时间距离现在还剩多久,传参为那一刻的时间转换成*秒数*后的数值，number类型,callback为时间到后的回调，采用的是四舍五入*/
        ReminTime: function (time, noTimeCallback) {
            var time = parseInt(time),
                baseTime = Date.parse(new Date())/1000,
                diff = time - baseTime,
                oneMinute = 60,
                oneHour = 60*60,
                oneDay = 60*60*24,
                oneMonth = 60*60*24*30,
                oneYear = 60*60*24*30*12;
            if (diff < 0) {
                noTimeCallback();
            } else if(diff < oneMinute) {
                return diff+'秒';
            } else if (diff < oneHour) {
                return Math.round(diff/oneMinute)+'分钟';
            } else if (diff < oneDay) {
                return Math.round(diff/oneHour)+'小时';
            } else if (diff < oneMonth) {
                return Math.round(diff/oneDay)+'天';
            } else if (diff < oneYear) {
                return Math.round(diff/oneMonth)+'月';
            } else if (diff < oneYear*5) {
                return Math.round(diff/oneYear)+'年';
            }

        },
        /*某一时间到现在过去了多久,传参为那一刻的时间转换成*秒数*后的数值，number类型,采用的是四舍五入*/
        TimeAgo: function (time) {
            var time = parseInt(time),
                baseTime = Date.parse(new Date())/1000,
                diff = baseTime - time,
                oneMinute = 60,
                oneHour = 60*60,
                oneDay = 60*60*24,
                oneMonth = 60*60*24*30,
                oneYear = 60*60*24*30*12;
            if (diff < oneMinute) {
                return '刚刚';
            } else if (diff < oneHour) {
                return Math.round(diff/oneMinute)+'分钟前';
            } else if (diff < oneDay) {
                return Math.round(diff/oneHour)+'小时前';
            } else if (diff < oneMonth) {
                return Math.round(diff/oneDay)+'天前';
            } else if (diff < oneYear) {
                return Math.round(diff/oneMonth)+'月前';
            } else if (diff < oneYear*5) {
                return Math.round(diff/oneYear)+'年前';
            }
        },
        /*通过ajax发起网络请求,pc&mobile*/
        HttpRequest: function (method, url, data, successCallback) {
            $.ajax({
                type: method,
                url: url,
                data: data,
                dataType: 'json',
                contentType: "application/json; charset=utf-8",
                beforeSend: horseFox.HttpBeforeSend,
                success: function () {
                    successCallback();
                },
                error: function () {
                    console.log('error');
                },
                complete: function () {
                    console.log('complete');
                }
            });
        },
        /*垂直滚动滚动条,传入参数为jquery元素和元素宽高(number)，需要引入slimScroll插件,pc*/
        ScrollBar: function (element, width, height) {
            element.slimScroll({
                height: height+'px',
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
            $('.slimScrollDiv').css('width', width+'px');
        },
        /*点击回顶,传入参数为jquery元素,pc&mobile*/
        GotoTop: function (element) {
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
        /*图片未加载出来执行的方法,传入参数为图片元素和默认图片的路径，需放在js加载完后执行,pc&mobile*/
        ImgErrorHander: function (imgElement, defaultImgSrc) {
            var imgUrl = imgElement.attr('src');
            if (url === undefined || url === null || url == "undefined" || url === "") {
                imgElement.attr('src', defaultImgSrc);
            }
            imgElement.error(function () {
                $(this).attr("src", defaultImgSrc);
            });
        },
        /*设置本地存储*/
        SetLocalStorage:function (key, value) {
            if ( hf.fn.StorageAvailable('localStorage') ) {
                return localStorage.setItem(key, JSON.stringify(value));
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        /*获取本地存储*/
        GetLocalStorage:function (key) {
            if ( hf.fn.StorageAvailable('localStorage') ) {
                return JSON.parse(localStorage.getItem(key));
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        /*清除本地存储*/
        RemoveLocalStorage:function (key) {
            if ( hf.fn.StorageAvailable('localStorage') ) {
                localStorage.removeItem(key);
                return null;
            } else {
                console.log('localStorage is not avaliable');
            }
        },
        /*用于监视本地存储数据的变化,传参为存储的键和回调函数,pc*/
        RereshLocalData: function (key, callback) {
            window.onstorage = function (e) {
                if (e.key == key) {
                    callback();
                }
            }
        },
        /*对于不变的比较大的数据，若有本地存储则取本地存储，没有则网络请求获取，传参key为本地存储的key，ajaxGet为ajax请求并且本地存储*/
        GetData: function (key, ajaxGet) {
            var value = this.GetLocalStorage(key);
            if ( value == null || value == '[]' || value == 'null' ) {
                ajaxGet();
            } else {
                return this.GetLocalStorage(key);
            }
        },
        /*tableBar切换,传参为table栏元素，点击后改变的样式名，点击后响应的元素*/
        TableBar: function (element, styleName, responseElement) {
            element.click(function () {
                var index = $(this).index();
                $(this).addClass(styleName).siblings().removeClass(styleName);
                responseElement.each(function (Index, ele) {
                    if (Index == index) {
                        $(ele).removeClass("hide").addClass("show")
                            .siblings().removeClass("show").addClass("hide");
                    }
                })
            });
        },
        /*鼠标悬停显示，离开隐藏,FadeInfo没有动画，SlideInfo有动画*/
        FadeInfo:function(obj,fadeObj){
            obj.mouseenter(function(e){
                fadeObj.fadeIn(160);
            }).mouseleave(function(e){
                fadeObj.fadeOut(160);
            });
        },
        SlideInfo:function(obj,fadeObj){
            obj.mouseenter(function(e){
                fadeObj.slideDown();
            }).mouseleave(function(e){
                fadeObj.slideUp();
            });
        },
        /*图片懒加载，传入参数为图片元素和图片显示时执行的回调函数*/
        LazyLoad: function (element, callback) {
            /*图片延迟加载主要是用来解决一个页面中图片太多，导致打开页面的时候一次性加载太多图片导致打开速度慢的问题。*/
            $(window).scroll(function() {
                element.each(function() {
                    var _this = this;
                    var $imgSrc = $(this).attr('data-src');
                    var $imgTop = $(this).offset().top;/*获取每张图片对应距离document顶部的高度*/
                    var scrollT = $(window).scrollTop();/*获取滚轮滚动的距离*/
                    var halfDoc = $(window).height();/*获取浏览器窗口可视高度*/
                    if ( (scrollT+halfDoc)>=$imgTop ) { /*如果滚动距离加上窗口可视高度大于该图片距离document顶部的高度*/
                        setTimeout(function(){callback();$(_this).attr('src',$imgSrc);},1000);
                    }
                })
            })
        },
        /*轮播图,传参为轮播图最外层容器元素，图片相关的参数对象。使用需自定义一个.on的样式和下列html代码，可以用插件替代*/
        Banner: function () {
            // html
            /*<div class="bannerBg">
                <!-- 图片区域 -->
                <ul class="banner clearfix">
                <li>
                <a href="javascript:;"><img src="images/1920/1.jpg" /></a>
                </li>
                <li>
                <a href="javascript:;"><img src="images/1920/2.jpg" /></a>
                </li>
                <li>
                <a href="javascript:;"><img src="images/1920/3.jpg" /></a>
                </li>
                </ul>
                <!-- 按钮区域 -->
                <div class="leftBtn"></div>
                <div class="rightBtn"></div>
                <!-- 小点区域 -->
                <ul class="dianBg">
                <li class="current"></li>
                <li></li>
                <li style="margin-right:0;"></li>
                </ul>
                </div>*/
            var x=$(window).width()/2;
            var y=$('.banner li img').height()/2;
            $('.banner li img').css({
                'margin-left': -x,
                'margin-top': -y
            });
            var firstWidth=$(window).width();
            setInterval(function(){
                if($(window).width()!=firstWidth){
                    firstWidth=$(window).width();
                    var x=$(window).width()/2;
                    var y=$('.banner li img').height()/2;
                    $('.banner li img').css({
                        'margin-left': -x,
                        'margin-top': -y
                    });
                }
            }, 30);
            //用来模拟图片下标
            var num=0;
            //用来模拟小点下标
            var dianNum=0;
            var oneImg=$('.banner li:first').clone(true);
            $('.banner').append(oneImg);

            //下一张图
            var nextFn=function(){

                num++;
                dianNum++;
                if(num>3){
                    $('.banner').css('left', 0);
                    num=1;
                }
                if(dianNum>2){
                    dianNum=0;
                }
                var myLeft=-num*100;
                myLeft=myLeft+'%';
                $('.banner').stop().animate({'left':myLeft}, 800,'easeInBounce');
                $('.dianBg li').eq(dianNum).addClass('current').siblings('li').removeClass('current');

            }
            //单击右按钮进入下一张
            $('.rightBtn').click(nextFn);
            var timer=setInterval(nextFn, 3000);
            //上一张图片
            var prevFn=function(){
                num--;
                dianNum--;
                if(num<0){
                    $('.banner').css('left', '-300%');
                    num=2;
                }

                if(dianNum<0){
                    dianNum=2;
                }
                var myLeft=-num*100;
                myLeft=myLeft+'%';
                $('.banner').stop().animate({'left':myLeft}, 800,'easeInBounce');//走动的特点
                $('.dianBg li').eq(dianNum).addClass('current').siblings('li').removeClass('current');

            }
            //单击左按钮进入上一张
            $('.leftBtn').click(prevFn);

            //小点点击效果
            $('.dianBg li').click(function(event) {
                num=$(this).index();
                dianNum=$(this).index();
                var myLeft=-num*100;
                myLeft=myLeft+'%';
                $('.banner').stop().animate({'left':myLeft}, 800,'easeInBounce');
                $('.dianBg li').eq(dianNum).addClass('current').siblings('li').removeClass('current');
            });
            $('.bannerBg').hover(function() {
                clearInterval(timer);
            }, function() {
                clearInterval(timer);
                timer=setInterval(nextFn, 3000);
            });
        },
        /*弹层，传参为根元素，触发弹层元素，标题，弹层内容，ok回调，cannel回调*/
        Layer: function (rootElement, traggerElement, title, content, okCallback, cancelCallback) {
            var tempStr = '<div class="hw-overlay" id="hw-layer"><div class="hw-layer-wrap"><span class="glyphicon glyphicon-remove hwLayer-close">X</span>' +
                '<div class="row"><div class="col-md-9 col-sm-12 content-layer"><h4>'+title+'</h4>'+content+'<button class="btn btn-success hwLayer-ok">确 定</button>' +
                '<button class="btn btn-warning hwLayer-cancel">取 消</button></div></div></div></div>';
            rootElement.html(tempStr);
            /*展示层*/
            function showLayer(id){
                var layer = $('#'+id),
                    layerwrap = layer.find('.hw-layer-wrap');
                layer.fadeIn();
                layerwrap.css({
                    'margin-top': -layerwrap.outerHeight()/2
                });
            }
            /*隐藏层*/
            function hideLayer(){ $('.hw-overlay').fadeOut(); }
            $('.hwLayer-ok').on('click', function() {
                hideLayer(); okCallback();
            });

            $('.hwLayer-cancel,.hwLayer-close').on('click', function() {
                hideLayer();
                cancelCallback();
            });
            /*触发弹出层*/
            traggerElement.on('click',  function() {
                showLayer('hw-layer');
            });
            /*点击或者触控弹出层外的半透明遮罩层，关闭弹出层*/
            $('.hw-overlay').on('click',  function(event) {
                if (event.target == this){ hideLayer(); }
            });
            /*按ESC键关闭弹出层*/
            $(document).keyup(function(event) {
                if (event.keyCode == 27) {
                    hideLayer();
                }
            });
        },
        /*分页，传参为总页数和点击页码后的回调，回调有pageNum参数，依赖于jquery.page.js*/
        Paganation: function (totalPage, callback) {
            /*根元素类名必须命名为：pagnation-hf-container*/
            $(".pagnation-hf-container").createPage({
                pageCount:totalPage,
                current:1,
                backFn: callback
            });
        },
        /*二维码,传参为元素名和url地址，需要依赖jquery.qrcode.min.js*/
        Qrcode: function (element, url) {
            element.qrcode(url);
        },
        /*京东楼梯导航,传参为导航栏外部li元素，内部hover的span元素和中心部分的内容*/
        JDStairNav: function (leftNav, leftNavHover, rightContent) {
            /*参考html:<div class="nav-hf-leftStairs">
             <ul>
             <li>1F<span class="nav-hf-active">服饰</span></li>
             <li>2F<span>美妆</span></li>
             <li>3F<span>手机</span></li>
             </ul>
             </div>
             <div class="nav-hf-content">
             <div class="stairs-content" style="background: #ff99cc;">1F服饰</div>
             <div class="stairs-content" style="background: #6699cc;">2F美妆</div>
             <div class="stairs-content" style="background: #779911;">3F手机</div>
             </div>*/
            var istop = true;
            leftNav.click(function() {
                istop = false;
                leftNavHover.removeClass("nav-hf-active");
                $(this).find("span").addClass("nav-hf-active");
                var index = $(this).index();
                var target = rightContent.eq(index).offset().top;
                $('body,html').stop().animate({
                    'scrollTop': target
                }, 300, function() {
                    istop = true;
                })
            })
            $(window).scroll(function() {
                if (istop) {
                    var top = $(window).scrollTop();
                    var index = 0;
                    rightContent.each(function(ind, obj) {
                        if (top >= $(obj).offset().top - 100) {
                            index = ind;
                        }
                    })
                    leftNavHover.removeClass("nav-hf-active");
                    leftNavHover.eq(index).addClass("nav-hf-active");
                }
            })
        },
        /*加入收藏夹，传参为地址和title*/
        AddFavorite: function (sURL, sTitle) {
        try {
            window.external.addFavorite(sURL, sTitle)
        } catch(e) {
            try {
                window.sidebar.addPanel(sTitle, sURL, "")
            } catch(e) {
                alert("加入收藏失败，请使用Ctrl+D进行添加")
            }
        }
    },
        /*提取页面中所有的网址*/
        GetAllUrl: function () {
            return document.documentElement.outerHTML.match(/(url\(|src=|href=)[\"\']*([^\"\'\(\)\<\>\[\] ]+)[\"\'\)]*|(http:\/\/[\w\-\.]+[^\"\'\(\)\<\>\[\] ]+)/ig).join("\r\n").replace(/^(src=|href=|url\()[\"\']*|[\"\'\>\) ]*$/igm,"");
        },
        /*将base64解码*/
        Base64Decode: function (base64) {
            // var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
            var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,ac = 0,dec = "",tmp_arr = [];
            if (!data) { return data; }
            data += '';
            do {
                h1 = base64.indexOf(data.charAt(i++));
                h2 = base64.indexOf(data.charAt(i++));
                h3 = base64.indexOf(data.charAt(i++));
                h4 = base64.indexOf(data.charAt(i++));
                bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
                o1 = bits >> 16 & 0xff;
                o2 = bits >> 8 & 0xff;
                o3 = bits & 0xff;
                if (h3 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1);
                } else if (h4 == 64) {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2);
                } else {
                    tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
                }
            } while (i < data.length);
            dec = tmp_arr.join('');
            dec = utf8_decode(dec);
            return dec;
        },
        /*检测url的有效性*/
        GetUrlState: function (URL) {
            var xmlhttp = new ActiveXObject("microsoft.xmlhttp");
            xmlhttp.Open("GET",URL, false);
            try{
                xmlhttp.Send();
            }catch(e){
            }finally{
                var result = xmlhttp.responseText;
                if(result){
                    if(xmlhttp.Status==200){
                        return(true);
                    }else{
                        return(false);
                    }
                }else{
                    return(false);
                }
            }
        },
        /*将html转义*/
        EncodeHtml: function (html) {
            return html.replace(/&/g, '&').replace(/\"/g, '"').replace(/</g, '<').replace(/>/g, '>');
        },
        /*打开窗口*/
        OpenWindow: function (url,windowName,width,height) {
            var x = parseInt(screen.width / 2.0) - (width / 2.0);
            var y = parseInt(screen.height / 2.0) - (height / 2.0);
            var isMSIE= (navigator.appName == "Microsoft Internet Explorer");
            if (isMSIE) {
                var p = "resizable=1,location=no,scrollbars=no,width=";
                p = p+width;
                p = p+",height=";
                p = p+height;
                p = p+",left=";
                p = p+x;
                p = p+",top=";
                p = p+y;
                retval = window.open(url, windowName, p);
            } else {
                var win = window.open(url, "ZyiisPopup", "top=" + y + ",left=" + x + ",scrollbars=" + scrollbars + ",dialog=yes,modal=yes,width=" + width + ",height=" + height + ",resizable=no" );
                eval("try { win.resizeTo(width, height); } catch(e) { }");
                win.focus();
            }
        },
        /*去掉url前缀http://*/
        RemoveUrlPrefix: function (a) {
            a=a.replace(/：/g,":").replace(/．/g,".").replace(/／/g,"/");
            while(trim(a).toLowerCase().indexOf("http://")==0){
                a=trim(a.replace(/http:\/\//i,""));
            }
            return a;
        },
        /*设置cookie*/
        SetCookie: function (name, value, Hours) {
            var d = new Date();
            var offset = 8;
            var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
            var nd = utc + (3600000 * offset);
            var exp = new Date(nd);
            exp.setTime(exp.getTime() + Hours * 60 * 60 * 1000);
            document.cookie = name + "=" + escape(value) + ";path=/;expires=" + exp.toGMTString() + ";domain=360doc.com;"
        },
        /*获取cookie*/
        GetCookie: function (name) {
            var arr = document.cookie.match(new RegExp("(^| )" + name + "=([^;]*)(;|$)"));
            if (arr != null) return unescape(arr[2]);
            return null
        },
        /*将网址设为首页*/
        SetHomepage: function (url) {
            if (document.all) {
                document.body.style.behavior = 'url(#default#homepage)';
                document.body.setHomePage(url)
            } else if (window.sidebar) {
                if (window.netscape) {
                    try {
                        netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect")
                    } catch(e) {
                        alert("该操作被浏览器拒绝，如果想启用该功能，请在地址栏内输入 about:config,然后将项 signed.applets.codebase_principal_support 值该为true")
                    }
                }
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components.interfaces.nsIPrefBranch);
                prefs.setCharPref('browser.startup.homepage', url)
            }
        },
        /*将金额转换成大写*/
        TransMoney: function (tranvalue) {
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
                    if (k1 == 3){ //小单位到千则大单位进一
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
            } catch(e) {
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
        /*生成随机数时间戳*/
        RandomTimeStamp: function () {
            var a=Math.random,b=parseInt;
            return Number(new Date()).toString()+b(10*a())+b(10*a())+b(10*a());
        },
        /*utf-8解码*/
        Utf8Decode: function (str_data) {
            var tmp_arr = [],i = 0,ac = 0,c1 = 0,c2 = 0,c3 = 0;str_data += '';
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
    /*mobile*/
    horseFox.extend({
        /*获取移动终端的操作系统,mobile*/
        getMobileOperatingSystem: function () {
            var userAgent = navigator.userAgent || navigator.vendor || window.opera;
            if (/windows phone/i.test(userAgent)) {
                return "Windows Phone";
            }
            if (/android/i.test(userAgent)) {
                return "Android";
            }
            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
                return "iOS";
            }
            return "unknown";
        },
        /*设置页面js桥,mobile*/
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
        /*连接页面js桥,mobile*/
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
        /*H5更新数据成功后，给客户端传递信息,mobile*/
        SuccessCallBack: function () {
            if (this.getMobileOperatingSystem() == 'iOS') {
                this.setupWebViewJavascriptBridge(function (bridge) {
                    bridge.callHandler('IsLoadingEndNativeFunc', {"IsLoadingEnd": true});
                });
            } else {
                this.connectWebViewJavascriptBridge(function (bridge) {
                    window.WebViewJavascriptBridge.callHandler('IsLoadingEndNativeFunc', {"IsLoadingEnd": true});
                })
            }
        },
        /**
         * 与客户端webview的交互,mobile
         * @param  {string}  registerParas    注册方法，供客户端调用
         * @param  {callback}  UpdatePageJSFunc 调用方法后执行的函数
         * @param  {$("div")}  ele              点击事件的元素
         * @param  {string}  paras            点击后响应的方法
         * @param  {obj}  parasObj          点击后传递的参数对象
         * @return {Boolean}                  无返回值
         */
        ClientWebViewConnect: function (registerParas, UpdatePageJSFunc, ele, paras, parasObj) {
            if (this.getMobileOperatingSystem() == 'iOS') {
                this.setupWebViewJavascriptBridge(function (bridge) {
                    bridge.registerHandler(registerParas, UpdatePageJSFunc);
                    bridge.callHandler('IsLoadingEndNativeFunc', {"IsLoadingEnd": true});
                    bridge.callHandler('GetProjInfoNativeFunc', null, horseFox.GetProjInfoNativeFunc);
                    ele.click(function (event) {
                        bridge.callHandler(paras, parasObj);
                    });
                });
            } else {
                this.connectWebViewJavascriptBridge(function (bridge) {
                    bridge.init(function (message, responseCallback) {
                    });
                    /*必须要*/
                    bridge.registerHandler(registerParas, UpdatePageJSFunc);
                    window.WebViewJavascriptBridge.callHandler('IsLoadingEndNativeFunc', {"IsLoadingEnd": true});
                    window.WebViewJavascriptBridge.callHandler('GetProjInfoNativeFunc', null, horseFox.GetProjInfoNativeFunc);
                    ele.click(function (event) {
                        bridge.callHandler(paras, parasObj);
                    });
                })
            }
        },
        /*下拉刷新，上拉加载更多,传参为上拉后回调和下拉后回调,依赖于iscroll插件, mobile*/
        DropLoadReresh: function (upDropCallback, downDropCallback) {
            /*调用html示例：<div id="wrapper"><ul><li>row 1</li></ul></div>*/
            var refresher = {
                info: {
                    "pullDownLable": "下拉加载",
                    "pullingDownLable": "下拉加载中...",
                    "pullUpLable": "上拉加载",
                    "pullingUpLable": "上拉加载中...",
                    "loadingLable": "加载中..."
                },
                init: function(parameter) {
                    var wrapper = document.getElementById(parameter.id);
                    var div = document.createElement("div");
                    div.className = "scroll-hf-scroller";
                    wrapper.appendChild(div);
                    var scroller = wrapper.querySelector(".scroll-hf-scroller");
                    var list = wrapper.querySelector("#" + parameter.id + " ul");
                    scroller.insertBefore(list, scroller.childNodes[0]);
                    var pullDown = document.createElement("div");
                    pullDown.className = "scroll-hf-pullDown";
                    var loader = document.createElement("div");
                    loader.className = "scroll-hf-loader";
                    for (var i = 0; i < 4; i++) {
                        var span = document.createElement("span");
                        loader.appendChild(span);
                    }
                    pullDown.appendChild(loader);
                    var pullDownLabel = document.createElement("div");
                    pullDownLabel.className = "scroll-hf-pullDownLabel";
                    pullDown.appendChild(pullDownLabel);
                    scroller.insertBefore(pullDown, scroller.childNodes[0]);
                    var pullUp = document.createElement("div");
                    pullUp.className = "scroll-hf-pullUp";
                    var loader = document.createElement("div");
                    loader.className = "scroll-hf-loader";
                    for (var i = 0; i < 4; i++) {
                        var span = document.createElement("span");
                        loader.appendChild(span);
                    }
                    pullUp.appendChild(loader);
                    var pullUpLabel = document.createElement("div");
                    pullUpLabel.className = "scroll-hf-pullUpLabel";
                    var content = document.createTextNode(refresher.info.pullUpLable);
                    pullUpLabel.appendChild(content);
                    pullUp.appendChild(pullUpLabel);
                    scroller.appendChild(pullUp);
                    var pullDownEl = wrapper.querySelector(".scroll-hf-pullDown");
                    var pullDownOffset = pullDownEl.offsetHeight;
                    var pullUpEl = wrapper.querySelector(".scroll-hf-pullUp");
                    var pullUpOffset = pullUpEl.offsetHeight;
                    this.scrollIt(parameter, pullDownEl, pullDownOffset, pullUpEl, pullUpOffset);
                },
                scrollIt: function(parameter, pullDownEl, pullDownOffset, pullUpEl, pullUpOffset) {
                    eval(parameter.id + "= new iScroll(parameter.id, {useTransition: true,vScrollbar: false,topOffset: pullDownOffset,onRefresh: function () {refresher.onRelease(pullDownEl,pullUpEl);},onScrollMove: function () {refresher.onScrolling(this,pullDownEl,pullUpEl,pullUpOffset);},onScrollEnd: function () {refresher.onPulling(pullDownEl,parameter.pullDownAction,pullUpEl,parameter.pullUpAction);},})");
                    pullDownEl.querySelector('.scroll-hf-pullDownLabel').innerHTML = refresher.info.pullDownLable;
                    document.addEventListener('touchmove', function(e) {
                        e.preventDefault();
                    }, false);
                },
                onScrolling: function(e, pullDownEl, pullUpEl, pullUpOffset) {
                    if (e.y > -(pullUpOffset)) {
                        pullDownEl.id = '';
                        pullDownEl.querySelector('.scroll-hf-pullDownLabel').innerHTML = refresher.info.pullDownLable;
                        e.minScrollY = -pullUpOffset;
                    }
                    if (e.y > 0) {
                        pullDownEl.classList.add("flip");
                        pullDownEl.querySelector('.scroll-hf-pullDownLabel').innerHTML = refresher.info.pullingDownLable;
                        e.minScrollY = 0;
                    }
                    if (e.scrollerH < e.wrapperH && e.y < (e.minScrollY - pullUpOffset) || e.scrollerH > e.wrapperH && e.y < (e.maxScrollY - pullUpOffset)) {
                        pullUpEl.style.display = "block";
                        pullUpEl.classList.add("flip");
                        pullUpEl.querySelector('.scroll-hf-pullUpLabel').innerHTML = refresher.info.pullingUpLable;
                    }
                    if (e.scrollerH < e.wrapperH && e.y > (e.minScrollY - pullUpOffset) && pullUpEl.id.match('flip') || e.scrollerH > e.wrapperH && e.y > (e.maxScrollY - pullUpOffset) && pullUpEl.id.match('flip')) {
                        pullDownEl.classList.remove("flip");
                        pullUpEl.querySelector('.scroll-hf-pullUpLabel').innerHTML = refresher.info.pullUpLable;
                    }
                },
                onRelease: function(pullDownEl, pullUpEl) {
                    if (pullDownEl.className.match('loading')) {
                        pullDownEl.classList.toggle("loading");
                        pullDownEl.querySelector('.scroll-hf-pullDownLabel').innerHTML = refresher.info.pullDownLable;
                        pullDownEl.querySelector('.scroll-hf-loader').style.display = "none"
                        pullDownEl.style.lineHeight = pullDownEl.offsetHeight + "px";
                    }
                    if (pullUpEl.className.match('loading')) {
                        pullUpEl.classList.toggle("loading");
                        pullUpEl.querySelector('.scroll-hf-pullUpLabel').innerHTML = refresher.info.pullUpLable;
                        pullUpEl.querySelector('.scroll-hf-loader').style.display = "none"
                        pullUpEl.style.lineHeight = pullUpEl.offsetHeight + "px";
                    }
                },
                onPulling: function(pullDownEl, pullDownAction, pullUpEl, pullUpAction) {
                    if (pullDownEl.className.match('flip') /*&&!pullUpEl.className.match('loading')*/ ) {
                        pullDownEl.classList.add("loading");
                        pullDownEl.classList.remove("flip");
                        pullDownEl.querySelector('.scroll-hf-pullDownLabel').innerHTML = refresher.info.loadingLable;
                        pullDownEl.querySelector('.scroll-hf-loader').style.display = "block"
                        pullDownEl.style.lineHeight = "20px";
                        if (pullDownAction) pullDownAction();
                    }
                    if (pullUpEl.className.match('flip') /*&&!pullDownEl.className.match('loading')*/ ) {
                        pullUpEl.classList.add("loading");
                        pullUpEl.classList.remove("flip");
                        pullUpEl.querySelector('.scroll-hf-pullUpLabel').innerHTML = refresher.info.loadingLable;
                        pullUpEl.querySelector('.scroll-hf-loader').style.display = "block"
                        pullUpEl.style.lineHeight = "20px";
                        if (pullUpAction) pullUpAction();
                    }
                }
            }
            refresher.init({
                id: "wrapper",
                pullDownAction: Refresh,
                pullUpAction: Load
            });
            var generatedCount = 0;
            function Refresh() {
                setTimeout(function () {
                    downDropCallback();
                    wrapper.refresh();
                }, 500);

            }
            function Load() {
                setTimeout(function () {
                    upDropCallback();
                    wrapper.refresh();
                }, 500);
            }
        },
        /*移动端手势，依赖于hammer插件,传入参数元素id名和回调函数对象, mobile*/
        GestureHander: function (idName, handerObj) {
            /*handerObj示例: {left:callback1,right:callback2,up:callback3,down:callback4}*/
            var element = document.getElementById(idName);
            var mc = new Hammer(element);
            mc.get('pan').set({ direction: Hammer.DIRECTION_ALL });
            /*listen to events...*/
            mc.on("panleft panright panup pandown tap press", function(ev) {
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
        }
    })
    /* 初始化静态参数*/
    horseFox.fn.init();
    /* 暴露全局变量*/
    window.hf = window.horseFox = horseFox;
}(window));