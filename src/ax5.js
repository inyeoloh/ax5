/*!
 * AX5 JavaScript UI Library v0.0.1
 * www.axisj.com
 *
 * Copyright 2013, 2015 AXISJ.com and other contributors
 * Released under the MIT license
 * www.axisj.com/ax5/license
 */

/*
argument
 - O : Object 전달받은 오브젝트 인자
 - _fn : 사용자정의 함수 인자
 - msg : 메세지
 _d : dom
 _na : new Array
 */

// 필수 Ployfill 확장 구문
(function(){

	var root = this;

	// From https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
	if (!Object.keys) {
		Object.keys = (function() {
			'use strict';
			var hasOwnProperty = Object.prototype.hasOwnProperty,
				hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
				dontEnums = [
					'toString',
					'toLocaleString',
					'valueOf',
					'hasOwnProperty',
					'isPrototypeOf',
					'propertyIsEnumerable',
					'constructor'
				],
				dontEnumsLength = dontEnums.length;

			return function(obj) {
				if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
					throw new TypeError('Object.keys called on non-object');
				}

				var result = [], prop, i;

				for (prop in obj) {
					if (hasOwnProperty.call(obj, prop)) {
						result.push(prop);
					}
				}

				if (hasDontEnumBug) {
					for (i = 0; i < dontEnumsLength; i++) {
						if (hasOwnProperty.call(obj, dontEnums[i])) {
							result.push(dontEnums[i]);
						}
					}
				}
				return result;
			};
		}());
	}

	// ES5 15.4.4.18 Array.prototype.forEach ( callbackfn [ , thisArg ] )
	// From https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	if (!Array.prototype.forEach) {
		Array.prototype.forEach = function (fun /*, thisp */) {
			if (this === void 0 || this === null) { throw TypeError(); }

			var t = Object(this);
			var len = t.length >>> 0;
			if (typeof fun !== "function") { throw TypeError(); }

			var thisp = arguments[1], i;
			for (i = 0; i < len; i++) {
				if (i in t) {
					fun.call(thisp, t[i], i, t);
				}
			}
		};
	}

	// ES5 15.3.4.5 Function.prototype.bind ( thisArg [, arg1 [, arg2, ... ]] )
	// https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Function/bind
	if (!Function.prototype.bind) {
		Function.prototype.bind = function (o) {
			if (typeof this !== 'function') { throw TypeError("Bind must be called on a function"); }
			var slice = [].slice,
				args = slice.call(arguments, 1),
				self = this,
				bound = function () {
					return self.apply(this instanceof nop ? this : o,
						args.concat(slice.call(arguments)));
				};

			function nop() {}
			nop.prototype = self.prototype;
			bound.prototype = new nop();
			return bound;
		};
	}

	/*global document */
	/**
	 * define document.querySelector & document.querySelectorAll for IE7
	 *
	 * A not very fast but small hack. The approach is taken from
	 * http://weblogs.asp.net/bleroy/archive/2009/08/31/queryselectorall-on-old-ie-versions-something-that-doesn-t-work.aspx
	 *
	 */
	(function () {
		if (document.querySelectorAll || document.querySelector) {
			return;
		}
		if(!document.createStyleSheet) return;
		var style = document.createStyleSheet(),
			select = function (selector, maxCount) {
				var
					all = document.all,
					l = all.length,
					i,
					resultSet = [];

				style.addRule(selector, "foo:bar");
				for (i = 0; i < l; i += 1) {
					if (all[i].currentStyle.foo === "bar") {
						resultSet.push(all[i]);
						if (resultSet.length > maxCount) {
							break;
						}
					}
				}
				style.removeRule(0);
				return resultSet;
			};

		document.querySelectorAll = function (selector) {
			return select(selector, Infinity);
		};
		document.querySelector = function (selector) {
			return select(selector, 1)[0] || null;
		};
	}());

	if (!String.prototype.trim) {
		(function() {
			// Make sure we trim BOM and NBSP
			var rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;
			String.prototype.trim = function() {
				return this.replace(rtrim, '');
			};
		})();
	}

	if (!window.JSON) {
		window.JSON = {
			parse: function (sJSON) { return eval("(" + sJSON + ")"); },
			stringify: function (vContent) {
				if (vContent instanceof Object) {
					var sOutput = "";
					if (vContent.constructor === Array) {
						for (var nId = 0; nId < vContent.length; sOutput += this.stringify(vContent[nId]) + ",", nId++);
						return "[" + sOutput.substr(0, sOutput.length - 1) + "]";
					}
					if (vContent.toString !== Object.prototype.toString) {
						return "\"" + vContent.toString().replace(/"/g, "\\$&") + "\"";
					}
					for (var sProp in vContent) {
						sOutput += "\"" + sProp.replace(/"/g, "\\$&") + "\":" + this.stringify(vContent[sProp]) + ",";
					}
					return "{" + sOutput.substr(0, sOutput.length - 1) + "}";
				}
				return typeof vContent === "string" ? "\"" + vContent.replace(/"/g, "\\$&") + "\"" : String(vContent);
			}
		};
	}

	// Console-polyfill. MIT license. https://github.com/paulmillr/console-polyfill
	// Make it safe to do console.log() always.
	(function(con) {
		'use strict';
		var prop, method;
		var empty = {};
		var dummy = function() {};
		var properties = 'memory'.split(',');
		var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
			'groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,' +
			'show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn').split(',');
		while (prop = properties.pop()) con[prop] = con[prop] || empty;
		while (method = methods.pop()) con[method] = con[method] || dummy;
	})(root.console = root.console || {}); // Using `this` for web workers.

}.call(this));

// ax5 선언
(function() {
	'use strict';

	// root of function
	var root = this, doc = document, win = window,
		fval = eval,
		/** @namespace {Object} ax5 */
		ax5 = {}, info, U, dom, xhr, ui;

	// jquery 1.10.2 from http://jquery.com
	var nodeNames = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|" +
			"header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
		rnoshimcache = new RegExp("<(?:" + nodeNames + ")[\\s/>]", "i"),
		rleadingWhitespace = /^\s+/,
		rxhtmlTag = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
		rtagName = /<([\w:]+)/,
		rtbody = /<tbody/i,
		rhtml = /<|&#?\w+;/,
		rnoInnerhtml = /<(?:script|style|link)/i;

	/**
	 * guid
	 * @member {Number} ax5.guid
	 */
	ax5.guid = 1;
	/**
	 * ax5.guid를 구하고 증가시킵니다.
	 * @method ax5.get_guid
	 * @returns {Number} guid
	 */
	ax5.get_guid = function(){return ax5.guid++;};

	/**
	 * 상수모음
	 * @namespace ax5.info
	 */
	ax5.info = info = (function(){
/**
 * ax5 version
 * @member {String} ax5.info.version
 */
		var version = "0.0.1";
		var base_url = "";

/**
 * event keyCodes
 * @member {Object} ax5.info.event_keys
 * @example
 ```
 {
	BACKSPACE: 8, TAB: 9,
	RETURN: 13, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46,
	HOME: 36, END: 35, PAGEUP: 33, PAGEDOWN: 34, INSERT: 45, SPACE: 32
 }
 ```
 */
		var event_keys = {
			BACKSPACE: 8, TAB: 9,
				RETURN: 13, ESC: 27, LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, DELETE: 46,
				HOME: 36, END: 35, PAGEUP: 33, PAGEDOWN: 34, INSERT: 45, SPACE: 32
		};

/**
 * 사용자 브라우저 식별용 오브젝트
 * @member {Object} ax5.info.browser
 * @example
 ```
 console.log( ax5.info.browser );
 //Object {name: "chrome", version: "39.0.2171.71", mobile: false}
 ```
 */
		var browser = (function () {
			var ua = navigator.userAgent.toLowerCase();
			var mobile = (ua.search(/mobile/g) != -1);
			if (ua.search(/iphone/g) != -1) {
				return { name: "iphone", version: 0, mobile: true }
			} else if (ua.search(/ipad/g) != -1) {
				return { name: "ipad", version: 0, mobile: true }
			} else if (ua.search(/android/g) != -1) {
				var match = /(android)[ \/]([\w.]+)/.exec(ua) || [];
				var browserVersion = (match[2] || "0");
				return { name: "android", version: browserVersion, mobile: mobile }
			} else {
				var browserName = "";
				var match = /(opr)[ \/]([\w.]+)/.exec(ua) ||
					/(chrome)[ \/]([\w.]+)/.exec(ua) ||
					/(webkit)[ \/]([\w.]+)/.exec(ua) ||
					/(msie) ([\w.]+)/.exec(ua) ||
					ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
					[];

				var browser = (match[1] || "");
				var browserVersion = (match[2] || "0");

				if (browser == "msie") browser = "ie";
				return {
					name: browser,
					version: browserVersion,
					mobile: mobile
				}
			}
		})();
	/**
	 * 브라우저 여부
	 * @member {Boolean} ax5.info.is_browser
	 */
		var is_browser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && win.document);
	/**
	 * 브라우저에 따른 마우스 휠 이벤트이름
	 * @member {Object} ax5.info.mousewheelevt
	 */
		var mousewheelevt = ((/Firefox/i.test(navigator.userAgent)) ? "DOMMouseScroll" : "mousewheel");

/**
 * 현재 페이지의 Url 정보를 리턴합니다.
 * @method ax5.info.url_util
 * @returns {Object}
 * @example
 ```js

 console.log( ax5.util.to_json( ax5.util.url_util() ) );
 {
	"base_url": "http://ax5:2018",
	"href": "http://ax5:2018/samples/index.html?a=1&b=1#abc",
	"param": "a=1&b=1",
	"referrer": "",
	"pathname": "/samples/index.html",
	"hostname": "ax5",
	"port": "2018",
	"url": "http://ax5:2018/samples/index.html",
	"hashdata": "abc"
 }
 ```
 */
		function url_util() {
			var url = {
				href: win.location.href,
				param: win.location.search,
				referrer: doc.referrer,
				pathname: win.location.pathname,
				hostname: win.location.hostname,
				port: win.location.port
			}, urls = url.href.split(/[\?#]/);
			url.param = url.param.replace("?", "");
			url.url = urls[0];
			if(url.href.search("#") > -1){
				url.hashdata = U.last(urls);
			}
			urls = null;
			url.base_url = U.left(url.href, "?").replace(url.pathname, "");
			return url;
		}

		// jquery 1.10.2 jQuery.support from http://jquery.com
/**
 * 브라우저 API 지원여부
 * @member {Object} ax5.info.support
 * @example
```json
 //ax5.info.support Object JSON
 {
	 appendChecked: true,
	 boxModel: true,
	 changeBubbles: true,
	 checkClone: undefined,
	 checkOn: true, // Make sure that if no value is specified for a checkbox, that it defaults to "on". (WebKit defaults to "" instead)
	 cssFloat: true, // Verify style float existence (IE uses styleFloat instead of cssFloat)
	 deleteExpando: true,
	 focusinBubbles: false,
	 getSetAttribute: true, // Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
	 hrefNormalized: true, // Make sure that URLs aren't manipulated
	 htmlSerialize: true, // Make sure that link elements get serialized correctly by innerHTML
	 inlineBlockNeedsLayout: false,
	 leadingWhitespace: true, // IE strips leading whitespace when .innerHTML is used
	 noCloneChecked: true,
	 noCloneEvent: true,
	 opacity: true, // Make sure that element opacity exists
	 optDisabled: true,
	 optSelected: true,
	 radioValue: true,
	 reliableHiddenOffsets: true,
	 reliableMarginRight: true,
	 shrinkWrapBlocks: false,
	 style: true, // Get the style information from getAttribute
	 submitBubbles: true,
	 tbody: true
 }
```
 */
		var support = (function(){

			var div = document.createElement( "div" ),
				documentElement = document.documentElement,
				all,
				a,
				select,
				opt,
				input,
				marginDiv,
				support,
				fragment,
				body,
				testElementParent,
				testElement,
				testElementStyle,
				tds,
				events,
				eventName,
				i,
				isSupported;

			// Preliminary tests
			div.setAttribute("className", "t");
			div.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>";

			all = div.getElementsByTagName( "*" );
			a = div.getElementsByTagName( "a" )[ 0 ];

			// Can't get basic test support
			if ( !all || !all.length || !a ) {
				return {};
			}

			// First batch of supports tests
			select = document.createElement( "select" );
			opt = select.appendChild( document.createElement("option") );
			input = div.getElementsByTagName( "input" )[ 0 ];

			support = {
				// IE strips leading whitespace when .innerHTML is used
				leadingWhitespace: ( div.firstChild.nodeType === 3 ),

				// Make sure that tbody elements aren't automatically inserted
				// IE will insert them into empty tables
				tbody: !div.getElementsByTagName( "tbody" ).length,

				// Make sure that link elements get serialized correctly by innerHTML
				// This requires a wrapper element in IE
				htmlSerialize: !!div.getElementsByTagName( "link" ).length,

				// Get the style information from getAttribute
				// (IE uses .cssText instead)
				style: /top/.test( a.getAttribute("style") ),

				// Make sure that URLs aren't manipulated
				// (IE normalizes it by default)
				hrefNormalized: ( a.getAttribute( "href" ) === "/a" ),

				// Make sure that element opacity exists
				// (IE uses filter instead)
				// Use a regex to work around a WebKit issue. See #5145
				opacity: /^0.55$/.test( a.style.opacity ),

				// Verify style float existence
				// (IE uses styleFloat instead of cssFloat)
				cssFloat: !!a.style.cssFloat,

				// Make sure that if no value is specified for a checkbox
				// that it defaults to "on".
				// (WebKit defaults to "" instead)
				checkOn: ( input.value === "on" ),

				// Make sure that a selected-by-default option has a working selected property.
				// (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
				optSelected: opt.selected,

				// Test setAttribute on camelCase class. If it works, we need attrFixes when doing get/setAttribute (ie6/7)
				getSetAttribute: div.className !== "t",

				// Will be defined later
				submitBubbles: true,
				changeBubbles: true,
				focusinBubbles: false,
				deleteExpando: true,
				noCloneEvent: true,
				inlineBlockNeedsLayout: false,
				shrinkWrapBlocks: false,
				reliableMarginRight: true
			};

			// Make sure checked status is properly cloned
			input.checked = true;
			support.noCloneChecked = input.cloneNode( true ).checked;

			// Make sure that the options inside disabled selects aren't marked as disabled
			// (WebKit marks them as disabled)
			select.disabled = true;
			support.optDisabled = !opt.disabled;

			// Test to see if it's possible to delete an expando from an element
			// Fails in Internet Explorer
			try {
				delete div.test;
			} catch( e ) {
				support.deleteExpando = false;
			}

			if ( !div.addEventListener && div.attachEvent && div.fireEvent ) {
				div.attachEvent( "onclick", function() {
					// Cloning a node shouldn't copy over any
					// bound event handlers (IE does this)
					support.noCloneEvent = false;
				});
				div.cloneNode( true ).fireEvent( "onclick" );
			}

			// Check if a radio maintains it's value
			// after being appended to the DOM
			input = document.createElement("input");
			input.value = "t";
			input.setAttribute("type", "radio");
			support.radioValue = input.value === "t";

			input.setAttribute("checked", "checked");
			div.appendChild( input );
			fragment = document.createDocumentFragment();
			fragment.appendChild( div.firstChild );

			// WebKit doesn't clone checked state correctly in fragments
			support.checkClone = fragment.cloneNode( true ).cloneNode( true ).lastChild.checked;

			div.innerHTML = "";

			// Figure out if the W3C box model works as expected
			div.style.width = div.style.paddingLeft = "1px";

			body = document.getElementsByTagName( "body" )[ 0 ];
			// We use our own, invisible, body unless the body is already present
			// in which case we use a div (#9239)
			testElement = document.createElement( body ? "div" : "body" );
			testElementStyle = {
				visibility: "hidden",
				width: 0,
				height: 0,
				border: 0,
				margin: 0
			};
			if ( body ) {
				jQuery.extend( testElementStyle, {
					position: "absolute",
					left: -1000,
					top: -1000
				});
			}
			for ( i in testElementStyle ) {
				testElement.style[ i ] = testElementStyle[ i ];
			}
			testElement.appendChild( div );
			testElementParent = body || documentElement;
			testElementParent.insertBefore( testElement, testElementParent.firstChild );

			// Check if a disconnected checkbox will retain its checked
			// value of true after appended to the DOM (IE6/7)
			support.appendChecked = input.checked;

			support.boxModel = div.offsetWidth === 2;

			if ( "zoom" in div.style ) {
				// Check if natively block-level elements act like inline-block
				// elements when setting their display to 'inline' and giving
				// them layout
				// (IE < 8 does this)
				div.style.display = "inline";
				div.style.zoom = 1;
				support.inlineBlockNeedsLayout = ( div.offsetWidth === 2 );

				// Check if elements with layout shrink-wrap their children
				// (IE 6 does this)
				div.style.display = "";
				div.innerHTML = "<div style='width:4px;'></div>";
				support.shrinkWrapBlocks = ( div.offsetWidth !== 2 );
			}

			div.innerHTML = "<table><tr><td style='padding:0;border:0;display:none'></td><td>t</td></tr></table>";
			tds = div.getElementsByTagName( "td" );

			// Check if table cells still have offsetWidth/Height when they are set
			// to display:none and there are still other visible table cells in a
			// table row; if so, offsetWidth/Height are not reliable for use when
			// determining if an element has been hidden directly using
			// display:none (it is still safe to use offsets if a parent element is
			// hidden; don safety goggles and see bug #4512 for more information).
			// (only IE 8 fails this test)
			isSupported = ( tds[ 0 ].offsetHeight === 0 );

			tds[ 0 ].style.display = "";
			tds[ 1 ].style.display = "none";

			// Check if empty table cells still have offsetWidth/Height
			// (IE < 8 fail this test)
			support.reliableHiddenOffsets = isSupported && ( tds[ 0 ].offsetHeight === 0 );
			div.innerHTML = "";

			// Check if div with explicit width and no margin-right incorrectly
			// gets computed margin-right based on width of container. For more
			// info see bug #3333
			// Fails in WebKit before Feb 2011 nightlies
			// WebKit Bug 13343 - getComputedStyle returns wrong value for margin-right
			if ( document.defaultView && document.defaultView.getComputedStyle ) {
				marginDiv = document.createElement( "div" );
				marginDiv.style.width = "0";
				marginDiv.style.marginRight = "0";
				div.appendChild( marginDiv );
				support.reliableMarginRight =
					( parseInt( ( document.defaultView.getComputedStyle( marginDiv, null ) || { marginRight: 0 } ).marginRight, 10 ) || 0 ) === 0;
			}

			// Remove the body element we added
			testElement.innerHTML = "";
			testElementParent.removeChild( testElement );

			// Technique from Juriy Zaytsev
			// http://thinkweb2.com/projects/prototype/detecting-event-support-without-browser-sniffing/
			// We only care about the case where non-standard event systems
			// are used, namely in IE. Short-circuiting here helps us to
			// avoid an eval call (in setAttribute) which can cause CSP
			// to go haywire. See: https://developer.mozilla.org/en/Security/CSP
			if ( div.attachEvent ) {
				for( i in {
					submit: 1,
					change: 1,
					focusin: 1
				} ) {
					eventName = "on" + i;
					isSupported = ( eventName in div );
					if ( !isSupported ) {
						div.setAttribute( eventName, "return;" );
						isSupported = ( typeof div[ eventName ] === "function" );
					}
					support[ i + "Bubbles" ] = isSupported;
				}
			}

			// Null connected elements to avoid leaks in IE
			testElement = fragment = select = opt = body = marginDiv = div = input = null;

			return support;

		})();

		var info = {
			version: version,
			base_url: base_url,
			event_keys: event_keys,
			browser: browser,
			is_browser: is_browser,
			mousewheelevt: mousewheelevt,
			url_util: url_util,
			support: support
		};

		return info;
	})();


/**
 * Refer to this by {@link ax5}.
 * @namespace ax5.util
 */
	ax5['util'] = U = (function(){
		var _toString = Object.prototype.toString;
/**
 * Object나 Array의 아이템으로 사용자 함수를 호출합니다.
 * @method ax5.util.each
 * @param {Object|Array} O
 * @param {Function} _fn
 * @example
```js
 var axf = ax5.util;
 axf.each([0,1,2], function(){
	// with this
 });
 axf.each({a:1, b:2}, function(){
	// with this
 });
```
 */
		function each(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				return O;
			}
			var key, i = 0, l = O.length,
				isObj = l === undefined || typeof O === "function";
			if(isObj){
				for(key in O){
					if(typeof O[key] != "undefined")
					if(_fn.call(O[key], key, O[key]) === false) break;
				}
			}else{
				for( ; i < l; ){
					if( typeof O[ i ] != "undefined" )
					if (_fn.call(O[ i ], i, O[ i++ ]) === false) break;
				}
			}
			return O;
		}
		// In addition to using the http://underscorejs.org : map, reduce, reduce_right, find
/**
 * 원본 아이템들을 이용하여 사용자 함수의 리턴값으로 이루어진 새로운 배열을 만듭니다.
 * @method ax5.util.map
 * @param {Object|Array} O
 * @param {Function} _fn
 * @returns {Array}
 * @example
```js
 var myArray = [0,1,2,3,4];
 var myObject = {a:1, b:"2", c:{axj:"what", arrs:[0,2,"3"]},
    fn: function(abcdd){
        return abcdd;
    }
 };

 var _arr = ax5.util.map( myArray,  function(index, I){
    return index+1;
 });
 console.log(_arr);
 // [1, 2, 3, 4, 5]

 var _arr = ax5.util.map( myObject,  function(k, v){
    return v * 2;
 });
 console.log(_arr);
 // [2, 4, NaN, NaN]
```
 */
		function map(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				console.error("argument error : ax5.util.map");
				return [];
			}
			var key, i = 0, l = O.length, results = [], fn_result;
			if (is_object(O)){
				for (key in O) {
					if(typeof O[key] != "undefined"){
						fn_result = undefined;
						if ( (fn_result = _fn.call(O[key], key, O[key])) === false ) break;
						else results.push( fn_result );
					}
				}
			} else {
				for ( ; i < l; ) {
					if(typeof O[i] != "undefined") {
						fn_result = undefined;
						if ( (fn_result = _fn.call(O[ i ], i, O[ i++ ])) === false ) break;
						else results.push( fn_result );
					}
				}
			}
			return results;
		}
/**
 * 원본 아이템들을 이용하여 사용자 함수의 리턴값이 참인 아이템의 위치나 키값을 반환합니다.
 * @method ax5.util.search
 * @param {Object|Array} O
 * @param {Function|String|Number} _fn - 함수 또는 값
 * @returns {Number|String}
 * @example
 ```js
 var myArray = [0,1,2,3,4,5,6];
 var myObject = {a:"123","b":"123",c:123};

 ax5.util.search(myArray,  function(){
    return this > 3;
 });
 // 4
 ax5.util.search(myObject,  function(k, v){
    return v === 123;
 });
 // "c"
 ax5.util.search([1,2,3,4], 3);
 // 2
 ax5.util.search([1,2], 4);
 // -1
 ax5.util.search(["name","value"], "value");
 // 1
 ax5.util.search(["name","value"], "values");
 // -1
 ax5.util.search({k1:"name",k2:"value"}, "value2");
 // -1
 ax5.util.search({k1:"name",k2:"value"}, "value");
 // "k2"
 ```
 */
		function search(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				console.error("argument error : ax5.util.find");
				return -1;
			}
			var key, i = 0, l = O.length;
			if (is_object(O)){
				for (key in O) {
					if(typeof O[key] != "undefined" && is_function(_fn) && _fn.call(O[key], key, O[key])){
						return key;
						break;
					}
					else if(O[key] == _fn){
						return key;
						break;
					}
				}
			} else {
				for ( ; i < l; ) {
					if(typeof O[i] != "undefined" && is_function(_fn) && _fn.call(O[ i ], i, O[ i ])) {
						return i;
						break;
					}
					else if(O[i] == _fn){
						return i;
						break;
					}
					i++;
				}
			}
			return -1;
		}
/**
 * 배열의 왼쪽에서 오른쪽으로 연산을 진행하는데 수행한 결과가 왼쪽 값으로 반영되어 최종 왼쪽 값을 반환합니다.
 * @method ax5.util.reduce
 * @param {Array|Object} O
 * @param {Function} _fn
 * @returns {Alltypes}
 * @example
```js
 var aarray = [5,4,3,2,1];
 result = ax5.util.reduce( aarray, function(p, n){
       return p * n;
    });
 console.log(result, aarray);
 // 120 [5, 4, 3, 2, 1]

 ax5.util.reduce({a:1, b:2}, function(p, n){
    return parseInt(p|0) + parseInt(n);
 });
 // 3
```
 */
		function reduce(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				console.error("argument error : ax5.util.reduce");
				return [];
			}
			if (is_array(O)){
				var i = 0, l = O.length, token_item = O[i];
				for ( ; i < l-1; ) {
					if(typeof O[i] != "undefined") {
						if ( ( token_item = _fn.call(root, token_item, O[ ++i ]) ) === false ) break;
					}
				}
				return token_item;
			}
			else
			if (is_object(O)){
				var i = 0, token_item;
				for(i in O){
					if(typeof O[i] != "undefined") {
						if ( ( token_item = _fn.call(root, token_item, O[i]) ) === false ) break;
					}
				}
				return token_item;
			}
			else
			{
				console.error("argument error : ax5.util.reduce - use Array or Object");
				return null;
			}
		}
/**
 * 배열의 오른쪽에서 왼쪽으로 연산을 진행하는데 수행한 결과가 오른쪽 값으로 반영되어 최종 오른쪽 값을 반환합니다.
 * @method ax5.util.reduce_right
 * @param {Array} O
 * @param {Function} _fn
 * @returns {Alltypes}
 * @example
 ```js
 var aarray = [5,4,3,2,1];
 result = ax5.util.reduce_right( aarray, function(p, n){
    console.log( n );
    return p * n;
 });
 console.log(result, aarray);
 120 [5, 4, 3, 2, 1]
 ```
 */
		function reduce_right(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				console.error("argument error : ax5.util.reduce_right - use Array");
				return [];
			}
			if (!is_array(O)){
				console.error("argument error : ax5.util.reduce_right - use Array");
				return []
			}
			var i = O.length-1, token_item = O[i];
			for ( ; i > 0; ) {
				if(typeof O[i] != "undefined") {
					if ( ( token_item = _fn.call(root, token_item, O[ --i ]) ) === false ) break;
				}
			}
			return token_item;
		}
/**
 * 배열또는 오브젝트의 각 아이템을 인자로 하는 사용자 함수의 결과가 참인 아이템들의 배열을 반환합니다.
 * @method ax5.util.filter
 * @param {Object|Array} O
 * @param {Function} _fn
 * @returns {Array}
 * @example
```js
 var aarray = [5,4,3,2,1];
 result = ax5.util.filter( aarray, function(){
        return this % 2;
 });
 console.log(result);
 // [5, 3, 1]

 var filObject = {a:1, s:"string", oa:{pickup:true, name:"AXISJ"}, os:{pickup:true, name:"AX5"}};
 result = ax5.util.filter( filObject, function(){
	return this.pickup;
 });
 console.log( ax5.util.to_json(result) );
 // [{"pickup": , "name": "AXISJ"}, {"pickup": , "name": "AX5"}]
```
 */
		function filter(O, _fn){
			if (O == null || typeof O === "undeinfed"){
				console.error("argument error : ax5.util.map");
				return [];
			}
			var k, i = 0, l = O.length, results = [], fn_result;
			if (is_object(O)){
				for (k in O) {
					if(typeof O[k] != "undefined"){
						if( fn_result = _fn.call(O[k], k, O[k]) ) results.push( O[k] );
					}
				}
			} else {
				for ( ; i < l; ) {
					if(typeof O[i] != "undefined") {
						if ( fn_result = _fn.call(O[ i ], i, O[ i ]) ) results.push( O[ i ] );
						i++;
					}
				}
			}
			return results;
		}
/**
 * 에러를 발생시킵니다.
 * @method ax5.util.error
 * @param {String} msg
 * @example
 ```js
 ax5.util.error( "에러가 발생되었습니다." );
 ```
 */
		function error( msg ){
			throw new Error( msg );
		}
/**
 * Object를 JSONString 으로 반환합니다.
 * @method ax5.util.to_json
 * @param {Object|Array} O
 * @returns {String} JSON
 * @example
```js
 var ax = ax5.util;
 var myObject = {a:1, b:"2", c:{axj:"what", arrs:[0,2,"3"]},
        fn: function(abcdd){
            return abcdd;
        }
    };
 console.log( ax.to_json(myObject) );
```
 */
		function to_json(O){
			var json_string = "";
			if(ax5.util.is_array(O)){
				var i = 0, l = O.length;
				json_string += "[";
				for(;i<l;i++){
					if(i > 0) json_string += ",";
					json_string += to_json(O[i]);
				}
				json_string += "]";
			}
			else
			if(ax5.util.is_object(O)){
				json_string += "{";
				var json_object_body = [];
				each(O, function(key, value) {
					json_object_body.push( '"' + key + '": ' + to_json(value) );
				});
				json_string += json_object_body.join(", ");
				json_string += "}";
			}
			else
			if(ax5.util.is_string(O)){
				json_string = '"' + O + '"';
			}
			else
			if(ax5.util.is_number(O)){
				json_string = O;
			}
			else
			if(ax5.util.is_undefined(O)){
				json_string = "undefined";
			}
			else
			if(ax5.util.is_function(O)){
				json_string = '"{Function}"';
			}
			return json_string;
		}
/**
 * 타겟 오브젝트의 키를 대상 오브젝트의 키만큼 확장합니다.
 * @method ax5.util.extend
 * @param {Object} O - 타겟 오브젝트
 * @param {Object} _O - 대상 오브젝트
 * @param {Boolean} overwrite - 덮어쓰기 여부
 * @returns {Object} extened Object
 * @example
 ```js
 var axf = ax5.util;
 var obja = {a:1};
 axf.extend(obja, {b:2});
 axf.extend(obja, {a:2});
 axf.extend(obja, {a:2}, true);
 ```
 */
		function extend(O, _O, overwrite) {
			if ( typeof O !== "object" && typeof O !== "function" ) O = {};
			if(typeof _O === "string") O = _O;
			else {
				if(overwrite === true) {
					for(var k in _O) O[k] = _O[k];
				}
				else
				{
					for(var k in _O) if(typeof O[k] === "undefined") O[k] = _O[k];
				}
			}
			return O;
		}
/**
 * 타겟 오브젝트를 복제하여 참조를 다르게 합니다.
 * @method ax5.util.clone
 * @param {Object} O - 타겟 오브젝트
 * @returns {Object} clone Object
 * @example
 ```js
 var axf = ax5.util;
 var obja = {a:1};
 var objb = axf.clone( obja );
 obja.a = 3; // 원본 오브젝트 수정
 console.log(obja, objb);
 // Object {a: 3} Object {a: 1}
 ```
 */
		function clone(O){
			return extend({}, O);
		}
/**
 * 인자의 타입을 반환합니다.
 * @method ax5.util.get_type
 * @param {Object|Array|String|Number|Element|Etc} O
 * @returns {String} element|object|array|function|string|number|undefined|nodelist
 * @example
 ```js
 var axf = ax5.util;
 var a = 11;
 var b = "11";
 console.log( axf.get_type(a) );
 console.log( axf.get_type(b) );
 ```
 */
		function get_type(O){
			var typeName;
			if( !!(O && O.nodeType == 1) ){
				typeName = "element";
			}
			else
			if(typeof O === "undefined") {
				typeName = "undefined";
			}
			else
			if(_toString.call(O) == "[object Object]") {
				typeName = "object";
			}
			else
			if(_toString.call(O) == "[object Array]") {
				typeName = "array";
			}
			else
			if(_toString.call(O) == "[object String]") {
				typeName = "string";
			}
			else
			if(_toString.call(O) == "[object Number]") {
				typeName = "number";
			}
			else
			if(_toString.call(O) == "[object NodeList]") {
				typeName = "nodelist";
			}
			else
			if(typeof O === "function") {
				typeName = "function";
			}
			return typeName;
		}
/**
 * 오브젝트가 window 인지 판단합니다.
 * @method ax5.util.is_window
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_window(O){ return O != null && O == O.window; }
/**
 * 오브젝트가 HTML 엘리먼트여부인지 판단합니다.
 * @method ax5.util.is_element
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_element(O) { return !!(O && O.nodeType == 1); }
/**
 * 오브젝트가 Object인지 판단합니다.
 * @method ax5.util.is_object
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_object(O) { return _toString.call(O) == "[object Object]"; }
/**
 * 오브젝트가 Array인지 판단합니다.
 * @method ax5.util.is_array
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_array(O) { return _toString.call(O) == "[object Array]"; }
/**
 * 오브젝트가 Function인지 판단합니다.
 * @method ax5.util.is_function
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_function(O) { return typeof O === "function"; }
/**
 * 오브젝트가 String인지 판단합니다.
 * @method ax5.util.is_string
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_string(O) { return _toString.call(O) == "[object String]"; }
/**
 * 오브젝트가 Number인지 판단합니다.
 * @method ax5.util.is_number
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_number(O) { return _toString.call(O) == "[object Number]"; }
/**
 * 오브젝트가 NodeList인지 판단합니다.
 * @method ax5.util.is_nodelist
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_nodelist(O) { return (_toString.call(O) == "[object NodeList]" || (O && O[0] && O[0].nodeType == 1)); }
/**
 * 오브젝트가 undefined인지 판단합니다.
 * @method ax5.util.is_undefined
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_undefined(O) { return typeof O === "undefined"; }
/**
 * 오브젝트가 undefined이거나 null이거나 빈값인지 판단합니다.
 * @method ax5.util.is_nothing
 * @param {Object} O
 * @returns {Boolean}
 */
		function is_nothing(O) { return (typeof O === "undefined" || O === null || O === ""); }
/**
 * 오브젝트의 첫번째 아이템을 반환합니다.
 * @method ax5.util.first
 * @param {Object|Array} O
 * @returns {Object}
 * @example
 ```js
 ax5.util.first({a:1, b:2});
 // Object {a: 1}
 ```
 */
		function first(O){
			if( is_object(O) ) {
				var keys = Object.keys(O);
				var item = {}; item[keys[0]] = O[keys[0]];
				return item;
			}
			else
			if( is_array(O) ) {
				return O[0];
			}
			else
			{
				console.error("ax5.util.object.first", "argument type error");
				return undefined;
			}
		}
/**
 * 오브젝트의 마지막 아이템을 반환합니다.
 * @method ax5.util.last
 * @param {Object|Array} O
 * @returns {Object}
 * @example
 ```js
 ax5.util.last({a:1, b:2});
 // Object {b: 2}
 ```
 */
		function last(O){
			if( is_object(O) ) {
				var keys = Object.keys(O);
				var item = {}; item[keys[keys.length-1]] = O[keys[keys.length-1]];
				return item;
			}
			else
			if( is_array(O) ) {
				return O[O.length-1];
			}
			else
			{
				console.error("ax5.util.object.last", "argument type error");
				return undefined;
			}
		}
/**
 * 쿠키를 설정합니다.
 * @method ax5.util.set_cookie
 * @param {String} cname - 쿠키이름
 * @param {String} cvalue - 쿠키값
 * @param {Number} [exdays] - 쿠키 유지일수
 * @example
```js
 ax5.util.set_cookie("jslib", "AX5");
 ax5.util.set_cookie("jslib", "AX5", 3);
```
 */
		function set_cookie(cname, cvalue, exdays){
			doc.cookie = cname + "=" + escape(cvalue) + "; path=/;" + (function(){
				if(typeof exdays != "undefined"){
					var d = new Date();
					d.setTime(d.getTime() + (exdays*24*60*60*1000));
					return "expires=" + d.toUTCString();
				}else{
					return "";
				}
			})();
		}
/**
 * 쿠키를 가져옵니다.
 * @method ax5.util.get_cookie
 * @param {String} cname
 * @returns {String} cookie value
 * @example
```js
 ax5.util.get_cookie("jslib");
```
 */
		function get_cookie(cname){
			var name = cname + "=";
			var ca = doc.cookie.split(';'), i= 0, l=ca.length;
			for(; i<l; i++) {
				var c = ca[i];
				while (c.charAt(0)==' ') c = c.substring(1);
				if (c.indexOf(name) != -1) return unescape(c.substring(name.length, c.length));
			}
			return "";
		}
/**
 * jsonString 으로 alert 합니다.
 * @method ax5.util.alert
 * @param {Object|Array|String|Number} O
 * @returns {Object|Array|String|Number} O
 * @example
```js
 ax5.util.alert({a:1,b:2});
 ax5.util.alert("정말?");
```
 */
		function alert(O){
			win.alert( to_json(O) );
			return O;
		}

/**
 * ax5 require
 * @method ax5.util.require
 * @param {Array} mods - load modules
 * @param {Function} callBack - 로드 성공시 호출함수
 * @param {Function} [errorBack] - 로드 실패시 호출함수
 * @example
```js
 ax5.info.base_url = "../src/";
 ax5.util.require(["ax5_class_sample.js"], function(){
	alert("ok");
 });
```
 */
		// RequireJS 2.1.15 소스코드 참고
		function require(mods, callBack, errorBack){
			var
			head = doc.head || doc.getElementsByTagName("head")[0],
			readyRegExp = info.is_browser && navigator.platform === 'PLAYSTATION 3' ? /^complete$/ : /^(complete|loaded)$/,
			loadCount = mods.length, loadErrors = [], onloadTimer, onerrorTimer, returned = false,
			scripts = dom.get("script[src]"), styles = dom.get("style[href]"),
			onload = function(){
				if(loadCount < 1 && loadErrors.length == 0 && !returned){
					if(callBack) callBack({});
					returned = true;
				}
			},
			onerror = function(){
				if(loadCount < 1 && loadErrors.length > 0 && !returned){
					console.error(loadErrors);
					if(errorBack) errorBack({
						type:"loadFail",
						list:loadErrors
					});
					returned = true;
				}
			};

			// 로드해야 할 모듈들을 doc.head에 삽입하고 로드가 성공여부를 리턴합니다.
			for(var i=0;i<mods.length;i++){
				var src = mods[i], type = right(src, "."), hasPlugin = false,
					plugin, plugin_src = info.base_url + src, attr_nm = (type === "js") ? "src" : "href";
					for (var s = 0; s < scripts.length; s++) {
						if (scripts[s].getAttribute(attr_nm) === plugin_src) {
							hasPlugin = true;
							break;
						}
					}

				if(hasPlugin) {
					loadCount--;
					onload();
				} else {

					plugin = (type === "js") ?
						dom.create("script", {type:"text/javascript", src:plugin_src}) :
						dom.create("link", {rel:"stylesheet", type:"text/css", href:plugin_src});

					var
						plugin_onload = function(e){
							if (e.type === 'load' || (readyRegExp.test((e.currentTarget || e.srcElement).readyState))) {
								loadCount--;
								if(onloadTimer) clearTimeout(onloadTimer);
								onloadTimer = setTimeout(onload, 1);
							}
						},
						plugin_onerror = function(e){
							loadCount--;
							loadErrors.push({
								src : info.base_url + src
							});
							if(onerrorTimer) clearTimeout(onerrorTimer);
							onerrorTimer = setTimeout(onerror, 1);
						};

					if (plugin.addEventListener){
						plugin.addEventListener('load', plugin_onload, false);
						plugin.addEventListener('error', plugin_onerror, false);
						head.appendChild(plugin);
					}else{
						var oReq = new XMLHttpRequest();
						oReq.open("GET", plugin_src, false);
						oReq.onreadystatechange = function(){
							if (oReq.readyState == 4 /* complete */) {
								if (oReq.status == 200 || oReq.status == 304) {
									head.appendChild(plugin);
									plugin_onload({type:"load"});
								}
								else {
									// error occurred
									plugin_onerror();
								}
							}
						};
						oReq.send();
					}
				}
			}
		}
/**
 * 문자열의 특정 문자열까지 잘라주거나 원하는 포지션까지 잘라줍니다.
 * @method ax5.util.left
 * @param {String} str - 문자열
 * @param {String|Number} pos - 찾을 문자열 또는 포지션
 * @returns {String}
 * @example
```js
 ax5.util.left("abcd.efd", 3);
 // abc
 ax5.util.left("abcd.efd", ".");
 // abcd
```
 */
		function left(str, pos){
			if(typeof str === "undefined" || typeof pos === "undefined") return "";
			if(is_string(pos)){
				return (str.indexOf(pos) > -1) ? str.substr(0, str.indexOf(pos)) : str ;
			}else if(is_number(pos)){
				return str.substr(0, pos);
			}else{
				return "";
			}
		}
/**
 * 문자열의 특정 문자열까지 잘라주거나 원하는 포지션까지 잘라줍니다.
 * @method ax5.util.right
 * @param {String} str - 문자열
 * @param {String|Number} pos - 찾을 문자열 또는 포지션
 * @returns {String}
 * @example
 ```js
 ax5.util.right("abcd.efd", 3);
 // efd
 ax5.util.right("abcd.efd", ".");
 // efd
 ```
 */
		function right(str, pos){
			if(typeof str === "undefined" || typeof pos === "undefined") return "";
			if(is_string(pos)){
				return (str.lastIndexOf(pos) > -1) ? str.substr(str.lastIndexOf(pos)+1) : str ;
			}else if(is_number(pos)){
				return str.substr(str.length-pos);
			}else{
				return "";
			}
		}
/**
 * css형 문자열이나 특수문자가 포함된 문자열을 카멜케이스로 바꾸어 반환합니다.
 * @method ax5.util.camel_case
 * @param {String} str
 * @returns {String}
 * @example
```js
 ax5.util.camel_case("inner-width");
 ax5.util.camel_case("inner_width");
 // innerWidth
```
 */
		function camel_case(str){
			return str.replace( /^-ms-/, "ms-" ).replace( /[\-_]([\da-z])/gi, function( all, letter ) {
				return letter.toUpperCase();
			} );
		}
/**
 * css형 문자열이나 카멜케이스문자열을 스네이크 케이스 문자열로 바꾸어 반환합니다.
 * @method ax5.util.snake_case
 * @param {String} str
 * @returns {String}
 * @example
 ```js
 ax5.util.snake_case("innerWidth");
 ax5.util.snake_case("inner-Width");
 ax5.util.snake_case("inner_width");
 // inner-width
 ```
 */
		function snake_case(str){
			return camel_case(str).replace( /([A-Z])/g, function( all, letter ) {
				return "-" + letter.toLowerCase();
			});
		}
/**
 * 문자열에서 -. 을 제외한 모든 문자열을 제거하고 숫자로 반환합니다. 옵션에 따라 원하는 형식의 숫자로 변환 할 수 도 있습니다.
 * @method ax5.util.number
 * @param {String|Number} str
 * @param {Object} cond - 옵션
 * @returns {String|Number}
 * @example
```js
var cond = {
	round: {Number|Boolean} - 반올림할 자릿수,
	money: {Boolean} - 통화,
	abs: {Boolean} - 절대값,
	byte: {Boolean} - 바이트
}

 console.log(ax5.util.number(123456789.678, {round:1}));
 console.log(ax5.util.number(123456789.678, {round:1, money:true}));
 console.log(ax5.util.number(123456789.678, {round:2, byte:true}));
 console.log(ax5.util.number(-123456789.8888, {abs:true, round:2, money:true}));
 console.log(ax5.util.number("A-1234~~56789.8~888PX", {abs:true, round:2, money:true}));

 //123456789.7
 //123,456,789.7
 //117.7MB
 //123,456,789.89
 //123,456,789.89
```
 */
		function number(str, cond){
			var result, pair = (''+str).split(/\./), isMinus = (parseFloat(pair[0]) < 0 || pair[0] == "-0"), returnValue = 0.0;
			pair[0] = pair[0].replace(/[-|+]?[\D]/gi, "");
			if (pair[1]) {
				pair[1] = pair[1].replace(/\D/gi, "");
				returnValue = parseFloat(pair[0] + "." + pair[1]) || 0;
			} else {
				returnValue = parseFloat(pair[0]) || 0;
			}
			result = (isMinus) ? -returnValue : returnValue;

			each(cond, function(k, c){
				if (k == "round") {
					result = (is_number(c)) ? +(Math.round(result + "e+" + c) + "e-" + c) : Math.round(result);
				}
				else
				if (k == "money") {
					result = (function (val) {
						var txtNumber = '' + val;
						if (isNaN(txtNumber) || txtNumber == "") {
							return "";
						}
						else {
							var rxSplit = new RegExp('([0-9])([0-9][0-9][0-9][,.])');
							var arrNumber = txtNumber.split('.');
							arrNumber[0] += '.';
							do {
								arrNumber[0] = arrNumber[0].replace(rxSplit, '$1,$2');
							} while (rxSplit.test(arrNumber[0]));
							if (arrNumber.length > 1) {
								return arrNumber.join('');
							} else {
								return arrNumber[0].split('.')[0];
							}
						}
					})(result);
				}
				else
				if (k == "abs") {
					result = Math.abs(parseFloat(result));
				}
				else
				if (k == "byte") {
					result = (function (val) {
						val = parseFloat(result);
						var n_unit = "KB";
						var myByte = val / 1024;
						if (myByte / 1024 > 1) {
							n_unit = "MB";
							myByte = myByte / 1024;
						}
						if (myByte / 1024 > 1) {
							n_unit = "GB";
							myByte = myByte / 1024;
						}
						return number(myByte, {round: 1}) + n_unit;
					})(result);
				}
			});

			return result;
		}
/**
 * 배열 비슷한 오브젝트를 배열로 변환해줍니다.
 * @method ax5.util.to_array
 * @param {Object|Elements|Arguments} O
 * @returns {Array}
 * @example
```js
 ax5.util.to_array(arguments);
 //
```
 */
		function to_array(O){
			if(typeof O.length != "undefined") return Array.prototype.slice.call(O);
			return [];
		}
		return {
			alert       : alert,
			each        : each,
			map         : map,
			search      : search,
			reduce      : reduce,
			reduce_right: reduce_right,
			filter      : filter,
			error       : error,
			to_json     : to_json,
			extend      : extend,
			clone       : clone,
			first       : first,
			last        : last,
			left        : left,
			right       : right,
			get_type    : get_type,
			is_window   : is_window,
			is_element  : is_element,
			is_object   : is_object,
			is_array    : is_array,
			is_function : is_function,
			is_string   : is_string,
			is_number   : is_number,
			is_nodelist : is_nodelist,
			is_undefined: is_undefined,
			is_nothing  : is_nothing,
			set_cookie  : set_cookie,
			get_cookie  : get_cookie,
			require     : require,
			camel_case  : camel_case,
			snake_case  : snake_case,
			number      : number,
			to_array    : to_array
		}
	})();

	/**
	 * Refer to this by {@link ax5}. <br/>
	 * dom0는 dom(query)를 줄여서 칭하는 말 입니다. ax5.dom 에 있는 함수들과는 다른 개념입니다. ax5.dom0는 query에 의해 만들어진 인스턴스 입니다.
	 * @namespace ax5.dom0
	 * @param {String} query
	 * @example
```
ax5.dom("#elementid");
var ax = ax5.dom;
ax("#elementid");
// 처러 사용할 수 있습니다.
```
	 */
	/**
	 * Refer to this by {@link ax5}.
	 * @namespace ax5.dom
	 */
	// dom class instance
	ax5.dom = dom = function(query){
		var axdom = (function(){
			function ax(query){
				this.toString = function(){
					return "[object ax5.dom]";
				};
/**
 * query selected elements
 * @member {Array} ax5.dom0.elements
 * @example
 ```
 ax5.dom("[data-ax-grid").elements
 ```
 */
				this.elements = dom.get(query);
/**
 * query selected elements length
 * @member {Number} ax5.dom0.length
 * @example
 ```
 ax5.dom("[data-ax-grid").length
 ```
 */
				this.length = this.elements.length;
/**
 * elements에 css 값을 적용또는 반환합니다.
 * @method ax5.dom0.css
 * @param {Object|Array|String} O
 * @returns {ax5.dom0|String|Object}
 * @example
```js
 ax5.dom("[data-ax-grid]").css({"color":"#ff3300", border:"1px solid #000"});
 console.log( ax5.dom("[data-ax-grid]").css("color") );
 // rgb(255, 51, 0)
 console.log( ax5.dom("[data-ax-grid]").css(["border","color"]) );
 // {border: "1px solid rgb(0, 0, 0)", color: "rgb(255, 51, 0)"}
```
 */
				this.css = function(O){
					var rs = dom.css(this.elements, O);
					return (rs === this.elements) ? this : rs;
				};
/**
 * elements에 className 를 추가, 제거, 확인, 토글합니다.
 * @method ax5.dom0.clazz
 * @param {String} [command=has] - add,remove,toggle,has
 * @param {String} O - 클래스명
 * @returns {ax5.dom0|String} return - ax5.dom 또는 클래스이름
 * @example
```js
 console.log(
	 ax5.dom("[data-ax-grid=A]").clazz("A"),
	 ax5.dom("[data-ax-grid='A']").clazz("has","A")
 );
 ax5.dom("[data-ax-grid=A]").clazz("add", "adclass").class("remove", "adclass").class("remove", "A");

 ax5.dom("[data-ax-grid=A]").clazz("toggle", "red");
 ax5.dom("[data-ax-grid=\"9B\"]").clazz("toggle", "red");
```
 */
				this.clazz = function(command, O){
					var rs = dom.clazz(this.elements, command, O);
					return (rs === this.elements) ? this : rs;
				};
/**
 * elements에 이벤트를 바인드 합니다.
 * @method ax5.dom0.on
 * @param {String} type - 이벤트 타입
 * @param {Function} _fn - 이벤트 콜백함수
 * @returns {ax5.dom0}
 * @example
```js
 var axd = ax5.dom;
 var mydom = axd("[data-event-test=text-box]"),
	 remove_dom = axd("[data-event-test=remove]");

	 mydom.on("click", window.fna);
	 mydom.on("click", window.fnb);
	 mydom.on("click", window.fnc);

 remove_dom.on("click", function(){
    mydom.off("click", window.fna);
    remove_dom.off("click");
    alert("이벤트 제거");
 });

 // 핸들방식
 axd("[data-event-test=text-box]").on("click.fna", window.fna);
 axd("[data-event-test=text-box]").on("click.fnb", window.fnb);
 axd("[data-event-test=text-box]").on("click.fnc", window.fnc);
```
 */
				// todo: event type 모두 체크
				this.on = function(typ, _fn) {
					dom.on(this.elements, typ,  _fn);
					return this;
				};
/**
 * elements에 이벤트를 언바인드 합니다.
 * @method ax5.dom0.off
 * @param {String} type - 이벤트 타입
 * @param {Function} [_fn] - 이벤트 콜백함수
 * @returns {ax5.dom0}
 * @example
 ```js
 var axd = ax5.dom;
 axd("[data-event-test=text-box]").off("click");
 axd("[data-event-test=text-box]").off("click.fnb").off("click.fnc");
 ```
 */
				this.off = function(typ, _fn) {
					dom.off(this.elements, typ,  _fn);
					return this;
				};
				// todo : setAttributeNS, setAttribute 차이 찾아보기
/**
 * element의 attribute를 추가 삭제 가져오기 합니다.
 * @method ax5.dom0.attr
 * @param {String|Object} [command=get] - 명령어
 * @param {Object|String} O - json타입또는 문자열
 * @returns {ax5.dom0|String}
 * @example
```js
 ax5.dom("[data-ax-grid=A]").attr("set", {"data-ax-spt":"ABCD"}); // set attribute
 ax5.dom("[data-ax-grid=A]").attr({"data-ax-spt":"9999", "data-next":"next"}); // set attribute

 console.log( ax5.dom("[data-ax-grid=A]").attr("data-ax-spt") ); // get or read
 console.log( ax5.dom("[data-ax-grid=A]").attr("get", "data-next") ); // get or read

 ax5.dom("[data-ax-grid=A]").attr("remove", "data-next");
 ax5.dom("[data-ax-grid=A]").attr("remove", "data-next2");
```
 */
				this.attr = function(command, O){
					var rs = dom.attr(this.elements, command, O);
					return (rs === this.elements) ? this : rs;
				};
/**
 * element의 attribute를 추가 삭제 가져오기 합니다.
 * @method ax5.dom0.find
 * @param {String} query - selector query
 * @returns {ax5.dom0} ax5.dom0
 * @example
```

```
 */
				this.find = function(query){
					return new axdom( dom.get(this.elements[0], query) );
				};

/**
 * 형제 엘리먼트중에 다음에 위치한 엘리먼트를 반환합니다.
 * @method ax5.dom0.next
 * @param {Number} [times=0] - 횟수
 * @returns {ax5.dom0} ax5.dom0
 * @example
 ```
 <div>
	 <ul id="list-container">
		 <li data-list-item="0" id="li0">
		    <div>child>child</div>
		 </li>
		 <li data-list-item="1" id="li1"></li>
		 <li data-list-item="2" id="li2"></li>
		 <li data-list-item="3" id="li3"></li>
		 <li data-list-item="4" id="li4"></li>
		 <li data-list-item="5" id="li5"></li>
	 </ul>
 </div>
 <script>
 var el = ax5.dom("#list-container");
 var li = el.child(el);

 console.log(
	 (c_li = li.next(2)).elements[0].id,
	 (c_li = c_li.prev()).elements[0].id
 );
 </script>
 ```
 */
				this.prev = function(times){
					return new axdom( dom.prev(this.elements, times) );
				};
/**
 * 형제 엘리먼트중에 이전에 위치한 엘리먼트를 반환합니다.
 * @method ax5.dom0.prev
 * @param {Number} [times=0] - 횟수
 * @returns {ax5.dom0} ax5.dom0
 * @example
 ```
 <div>
	 <ul id="list-container">
		 <li data-list-item="0" id="li0">
		    <div>child>child</div>
		 </li>
		 <li data-list-item="1" id="li1"></li>
		 <li data-list-item="2" id="li2"></li>
		 <li data-list-item="3" id="li3"></li>
		 <li data-list-item="4" id="li4"></li>
		 <li data-list-item="5" id="li5"></li>
	 </ul>
 </div>
 <script>
 var el = ax5.dom("#list-container");
 var li = el.child(el);

 console.log(
	 (c_li = li.next(2)).elements[0].id,
	 (c_li = c_li.prev()).elements[0].id
 );
 </script>
 ```
 */
				this.next = function(times){
					return new axdom( dom.next(this.elements, times) );
				};

/**
 * 타겟엘리먼트의 부모 엘리멘트 트리에서 원하는 조건의 엘리먼트를 얻습니다.
 * @method ax5.dom0.parent
 * @param {Object} cond - 원하는 element를 찾을 조건
 * @returns {ax5.dom0} ax5.dom0 - 부모엘리먼트로 만들어진 새로운 ax5.dom0
 * @example
 ```
 var dom_child = ax5.dom("#list-container").child();
 console.log(
    dom_child.parent({tagname:"div", clazz:"ax5-sample-view"}).elements[0]
 );
 console.log(
    ax5.dom(dom_child).parent({tagname:"div", clazz:"ax5-sample-view"}).elements[0]
 );
 // 같은 결과
 ```
 */
				this.parent = function(cond){
					return new axdom( dom.parent(this.elements, cond) );
				};
/**
 * 타겟 엘리먼트의 자식들을 반환합니다.
 * @method ax5.dom0.child
 * @returns {ax5.dom0} ax5.dom0 - 자식엘리먼트로 만들어진 새로운 ax5.dom0
 * @example
```
 var dom_child = ax5.dom("#list-container").child();
 ax5.dom(dom_child).child();
 dom_child.child();
 // 원하는 대로~
```
 */
				this.child = function(){
					return new axdom( dom.child(this.elements) );
				};
/**
 * 타겟 엘리먼트의 너비를 반환합니다.
 * @method ax5.dom0.width
 * @returns {Number}
 * @example
 ```
 console.log(
    ax5.dom("#list-container").css({"width":"400px", "box-sizing":"border-box",
    "border":"2px solid", "padding":"50px"}).css({"background":"#ccc"}).width()
 );
 console.log(
    ax5.dom("#list-container").css({"width":"400px", "box-sizing":"content-box",
    "border":"2px solid", "padding":"50px"}).css({"background":"#ccc"}).width()
 );
 ```
 */
				this.width = function(){
					return dom.width(this.elements);
				};
/**
 * 타겟 엘리먼트의 높이를 반환합니다.
 * @method ax5.dom0.height
 * @returns {Number}
 * @example
 ```
 // width 와 동일
 ```
 */
				this.height = function(){
					return dom.height(this.elements);
				};
/**
 * 타겟 엘리먼트안에 HTML코드를 바꿔치기 합니다.
 * @method ax5.dom0.html
 * @returns {ax5.dom0|String}
 * @example
 ```
 console.log( ax5.dom("#list-container").html() );
 ax5.dom("#list-container").html("<a href='#1234'>링크");
 ```
 */
				this.html = function(val){
					var rs = dom.html(this.elements, val);
					return (rs === this.elements) ? this : rs;
				};
			}
			return ax;
		})();
		return new axdom(query);
	};

	// dom functions
	(function(){
		/* 내장함수 시작 ~~~*/
		// 이벤트 바인딩
		function eventBind(elem, type, eventHandle){
			type = U.left(type, ".");
			if ( elem.addEventListener ) {
				elem.addEventListener( type, eventHandle, false );
			} else if ( elem.attachEvent ) {
				elem.attachEvent( "on" + type, eventHandle );
			}
		}
		// 이벤트 언바인딩
		function eventUnBind(elem, type, eventHandle){
			type = U.left(type, ".");
			if ( elem.removeEventListener ) {
				if(eventHandle) elem.removeEventListener( type, eventHandle );
				else{
					elem.removeEventListener( type );
				}
			} else if ( elem.detachEvent ) {
				if(eventHandle) elem.detachEvent( "on" + type, eventHandle );
				else elem.detachEvent( "on" + type );
			}
		}
		// 엘리먼트 인자 체크
		function validate_elements(elem, fn_name){
			if(U.is_array(elem) && U.is_element(elem[0])){
				return elem;
			}
			else
			if(U.is_element(elem)) return [elem];
			else
			if(elem && elem.nodeType === 9 ) {
				return [elem.documentElement];
			}
			else
			if(elem && elem.toString() == "[object ax5.dom]"){
				return elem.elements;
			}
			else
			if(!U.is_array(elem) && !U.is_nodelist(elem)) {
				console.error("ax5.dom."+fn_name+" : elements parameter incorrect");
				return [];
			}
			return elem;
		}
		// 엘리먼트 순서이동
		function sibling(elements, forward, times){
			elements = validate_elements(elements, forward);
			var prop = (forward == "prev") ? "previousSibling" : "nextSibling", el = elements[0];
			times = (typeof times == "undefined" || times < 1) ? 1 : times;
			do{
				el = el[prop];
			}
			while(
				(function(){
					if(!el) return false;
					if(el.nodeType == 1) times--;
					return (times > 0)
				})()
				);
			return el;
		}
		// 엘리먼트 스타일 값 가져오기
		function style(el, key, fn_nm){
			if(U.is_string(key)) {
				return get_style(key);
			}else if(U.is_array(key)){
				var css = {}, i = 0, l = key.length;
				for(;i<l;i++){
					css[key[i]] = get_style(key[i]);
				}
				return css;
			}

			function get_style(k){
				if(window.getComputedStyle){
					return window.getComputedStyle(el).getPropertyValue(k);
				}
				else
				if(el.currentStyle){
					var val = el.currentStyle[k];
					if(val == "auto"){
						if(U.search(["width", "height"], k) > -1){
							val = el[ U.camel_case("offset-" + k) ];
						}
					}
					return val;
				}
			}
			return null;
		}
		// 박스사이즈 구하기
		function box_size(elements, fn_nm, opts){
			var d = -1, tag_nm = "";
			if(U.is_window(elements)){
				return elements.document.documentElement[ U.camel_case("client-" + fn_nm) ];
			}
			else
			{
				elements = validate_elements(elements, fn_nm);
				var el = elements[0], _sbs = U.camel_case("scroll-" + fn_nm), _obs = U.camel_case("offset-" + fn_nm), _cbs = U.camel_case("client-" + fn_nm);
				if(el){
					tag_nm = el.tagName.toLowerCase();
					if(tag_nm == "html"){
						d = Math.max( doc.body[ _sbs ], el[ _sbs ], doc.body[ _obs ], el[ _obs ], el[ _cbs ] );
					}
					else
					{
						if(el.getBoundingClientRect){
							d = el.getBoundingClientRect()[fn_nm];
						}

						if(typeof d == "undefined"){
							d = style(el, fn_nm, fn_nm);
							var box_cond = (fn_nm == "width") ?
								style(el, ["box-sizing", "padding-left","padding-right","border-left-width","border-right-width"], fn_nm):
								style(el, ["box-sizing", "padding-top","padding-bottom","border-top-width","border-bottom-width"], fn_nm);

							if(box_cond["box-sizing"] == "content-box"){
								d = parseInt(d) + (ax5.util.reduce(box_cond, function(p, n){
									return U.number(p|0) + U.number(n);
								}));
							}
						}
					}
				}
			}
			return U.number(d);
		}
		// nodeName check
		function node_name(el, node_nm){
			return el.nodeName && el.nodeName.toLowerCase() === node_nm.toLowerCase();
		}
		/* 내장함수 끝 ~~~*/

		// jQuery.ready.promise jquery 1.10.2
		/**
		 * document 로드 완료를 체크 합니다.
		 * @method ax5.dom.ready
		 * @param {Function} _fn - 로드완료시 호출함수
		 * @example
```js
 var a = 1;
 setTimeout(function(){
    ax5.dom.ready(function(){
        console.log("test" + a);
        console.log(ax5.util.left("axisj-ax5", "-"));
    });
 }, 1000);
```
		 */
		function ready( _fn ){
			if(ax5.dom.is_ready || ax5.dom.is_reading) return;
			ax5.dom.is_reading = true;
			promise(function(){
				if(ax5.dom.is_ready) return;
				ax5.dom.is_ready = true;
				_fn();
			});
		}
		function promise(_fn){
			if ( doc.readyState === "complete" ) {
				setTimeout( _fn );
			} else if ( doc.addEventListener ) {
				doc.addEventListener( "DOMContentLoaded", _fn, false );
				win.addEventListener( "load", _fn, false );
			} else {
				doc.attachEvent( "onreadystatechange", _fn );
				win.attachEvent( "onload", _fn );

				// If IE and not a frame
				var top = false;
				try {
					top = win.frameElement == null && doc.documentElement;
				} catch(e) {}

				if ( top && top.doScroll ) {
					(function doScrollCheck() {
						if ( !ax5.dom.is_ready  ) {
							try {
								// Use the trick by Diego Perini
								// http://javascript.nwbox.com/IEContentLoaded/
								top.doScroll("left");
							} catch(e) {
								return setTimeout( doScrollCheck, 50 );
							}
							// and execute any waiting functions
							_fn();
						}
					})();
				}
			}
		}
/**
 * 브라우저 resize 이벤트를 캐치합니다.
 * @method ax5.dom.resize
 * @param {Function} _fn - 캐치후 호출될 함수
 * @example
```js
 ax5.dom.resize(function(){
    console.log( 1, document.body.clientWidth );
 });
```
 */
		function resize( _fn ){
			eventBind(window, "resize", _fn);
		}
		/**
		 * CSS Selector를 이용하여 HTML Elements를 찾습니다.
		 * @method ax5.dom.get
		 * @param {String|Element|ax5.dom0} query - CSS Selector | Element
		 * @param {String} sub_query - CSS Selector
		 * @returns {Array} elements
		 * @example
 ```js
 ax5.dom.get("#element01");
 ax5.dom.get("input[type='text']");
 ax5.dom.get( ax5.dom.get("input[type='text']") );
 ```
		 */
		function get(query, sub_query){
			var elements, return_elements = [], parent_element;
			var i= 0,l=query.length;
			if(query.toString() == "[object ax5.dom]"){
				return_elements = query.elements;
			}
			else
			if(U.is_element(query))
			{
				return_elements.push( query );
			}
			else
			if(U.is_array(query) || U.is_nodelist(query)){
				for(;i<l;i++) {
					if(U.is_element(query[i])) return_elements.push( query[i] );
				}
			}
			else
			if(U.is_string(query) && query.substr(0,1) === "#")
			{
				return_elements.push( doc.getElementById(query.substr(1)) );
			}
			else
			{
				elements = doc.querySelectorAll(query), l = elements.length;
				for(;i<l;i++) {
					return_elements.push( elements[i] );
				}
			}

			if(typeof sub_query != "undefined") {
				parent_element = (info.browser.name == "ie" && info.browser.version < 8) ? doc : return_elements[0];
				return_elements = [];
				elements = parent_element.querySelectorAll(sub_query), l = elements.length;
				for(;i<l;i++) {
					return_elements.push( elements[i] );
				}
			}

			return return_elements;
		}
		/**
		 * CSS Selector를 이용하여 HTML Element를 찾습니다.
		 * @method ax5.dom.get_one
		 * @param {String|Element} query - CSS Selector | Element
		 * @param {String} sub_query - CSS Selector
		 * @returns {Element} element
		 * @example
 ```js
 ax5.dom.get_one("#element01");
 ax5.dom.get_one("input[type='text']");
 ```
		 */
		function get_one(query, sub_query){
			return get(query, sub_query)[0];
		}
		/**
		 * createElement 구문을 효과적으로 수행합니다.
		 * @method ax5.dom.create
		 * @param {String} node_nm - 엘리먼트 이름
		 * @param {Object} attr - 엘리먼트 속성정보
		 * @returns {Element}
		 * @example
 ```js
 ax5.dom.create("script", {type:"text/javascript", src:"../ax5.js"});
 ```
		 */
		function create(node_nm, attr, val){
			/*
			 HTML - Use http://www.w3.org/1999/xhtml
			 SVG - Use http://www.w3.org/2000/svg
			 XBL - Use http://www.mozilla.org/xbl
			 XUL - Use http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul
			 document.createElementNS("http://www.w3.org/1999/xhtml","div");
			 document.createElement("div")
			 document.createTextNode(text)
			 */

			var element = doc.createElement(node_nm);
			for(var k in attr){
				element[k] = attr[k];
			}
			return element;
		}
		/**
		 * Elements에 CSS속성을 읽고 씁니다.
		 * @method ax5.dom.css
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {Object|Array|String} CSS
		 * @returns {String|Object|Elements}
		 * @example
 ```js
 ax5.dom.css(ax5.dom.get("#abcd"), {"color":"#ff3300"});
 ```
		 */
		// todo : css 값 검증 함수 추가 width, height, left, top 등에 px를 전달하지 않아도 기본단위가 설정 되도록 기본단위 설정 오브젝트 필요
		function css(elements, O){
			elements = validate_elements(elements, "css");
			if(U.is_string(O) || U.is_array(O)) {
				return style(elements[0], O, "css");
			}
			else
			{
				var i = 0, l = elements.length, k;
				for(;i<l;i++) {
					for (k in O) {
						elements[i].style[k] = O[k]; // todo apply_css 재 개발
					}
				}
			}
			return elements;
		}
		/**
		 * elements에 className 를 추가, 제거, 확인, 토글합니다.
		 * @method ax5.dom.clazz
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {String} [command=has] - add,remove,toggle,has
		 * @param {String} O - 클래스명
		 * @returns {String|Elements} return - elements 또는 클래스이름
		 * @example
 ```js
 ax5.dom.clazz(ax5.dom.get("#abcd"), "class-text"); // has 와 동일
 ax5.dom.clazz(ax5.dom.get("#abcd"), "add", "class-text");
 ax5.dom.clazz(ax5.dom.get("#abcd"), "remove", "class-text");
 ax5.dom.clazz(ax5.dom.get("#abcd"), "has", "class-text");
 ax5.dom.clazz(ax5.dom.get("#abcd"), "toggle", "class-text");
 ```
		 */
		function clazz(elements, command, O){
			var classNames;
			elements = validate_elements(elements, "clazz");
			if(command === "add" || command === "remove" || command === "toggle") {
				for(var di=0;di<elements.length;di++) {
					classNames = elements[di]["className"].split(/ /g);
					if(command === "add"){
						if(U.search(classNames, function(){
								return O.trim() == this;
							}) == -1) {
							classNames.push(O.trim());
						}
					}else if(command === "remove"){
						classNames = U.filter(classNames, function(){
							return O.trim() != this;
						});
					}else if(command === "toggle"){
						var class_count = classNames.length;
						classNames = U.filter(classNames, function(){
							return O.trim() != this;
						});
						if(class_count === classNames.length) classNames.push(O.trim());
					}
					elements[di]["className"] = classNames.join(" ");
				}
				return elements;
			}
			else
			{ // has
				if(typeof O === "undefined") O = command;
				classNames = elements[0]["className"].trim().split(/ /g);
				//if(U.is_string(classNames)) classNames = [classNames];
				if (U.is_string(O)) { // hasClass
					// get Class Name
					return (U.search(classNames, function () { return this.trim() === O }) > -1);
				}else{
					console.error("set_class argument error");
				}
				return elements;
			}
		}
		/**
		 * elements에 attribute를 추가, 제거, 확인 합니다.
		 * @method ax5.dom.attr
		 * @param {Array} elements - 대상의 엘리먼트 리스트 혹은 엘리먼트
		 * @param {String|Object} [command=get] - 명령어
		 * @param {Object|String} O - json타입또는 문자열
		 * @returns {String|Elements} return - elements 또는 속성값
		 * @example
 ```js
 ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), "set", {"data-ax-spt":"ABCD"}); // set attribute
 ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), {"data-ax-spt":"9999", "data-next":"next"}); // set attribute
 ax5.dom.attr(ax5.dom.get("[data-ax-grid=A]"), "remove", "data-next");
 ```
		 */
		function attr(elements, command, O){
			elements = validate_elements(elements, "attr");
			var i = 0, l = elements.length, k;
			if( command === "set" || (typeof O === "undefined" && U.is_object(command)) ){
				if(typeof O === "undefined") O = command;
				for(;i<l;i++) {
					for (k in O) {
						elements[i].setAttribute(k, O[k]);
					}
				}
			}
			else
			if( command === "get" || command === "read" || (typeof O === "undefined" && U.is_string(command)) ){
				if(typeof O === "undefined") O = command;
				if(!U.is_string(O)) return this;
				return elements[0].getAttribute(O);
			}
			else
			if( command === "remove" ){
				if(U.is_string(O)) {
					for (;i < l;i++) {
						elements[i].removeAttribute(O);
					}
				}else{
					for (;i < l;i++) {
						each(O, function(){
							elements[i].removeAttribute(this);
						});
					}
				}
			}
			return elements;
		}
		/**
		 * elements에 이벤트를 바인드 합니다.
		 * @method ax5.dom.on
		 * @param {Array} elements
		 * @param {String} type - 이벤트 타입
		 * @param {Function} _fn - 이벤트 콜백함수
		 * @example
 ```js
 var fna = function(){console.log("fna")};
 var fnb = function(){console.log("fnb")};
 var fnc = function(){console.log("fnc")};

 var mydom = ax5.dom.get("[data-event-test=text-box]"), remove_dom = ax5.dom.get("[data-event-test=remove]");

 ax5.dom.on(mydom, "click", window.fna);
 ax5.dom.on(mydom, "click", window.fnb);
 ax5.dom.on(mydom, "click", window.fnc);

 ax5.dom.on(remove_dom, "click", function(){
    ax5.dom.off(mydom, "click", window.fna);
    ax5.dom.off(remove_dom, "click");
    alert("이벤트 제거");
 });

 // 핸들방식
 ax5.dom.on(mydom, "click.fna", window.fna);
 ax5.dom.on(mydom, "click.fnb", window.fnb);
 ax5.dom.on(mydom, "click.fnc", window.fnc);
 ```
		 */
		function on(elements, typ, _fn){
			elements = validate_elements(elements, "on");
			for(var i=0;i<elements.length;i++) {
				var __fn, _d = elements[i];
				if(!_d.e_hd) _d.e_hd = {};
				if(typeof _d.e_hd[typ] === "undefined"){
					__fn = _d.e_hd[typ] = _fn;
				}else{
					if(!U.is_array( _d.e_hd[typ])) _d.e_hd[typ] = [_d.e_hd[typ]];
					_d.e_hd[typ].push(_fn);
					__fn = _d.e_hd[typ][_d.e_hd[typ].length-1];
				}
				eventBind(_d, typ, __fn);
			}
		}
		/**
		 * elements에 이벤트를 언바인드 합니다.
		 * @method ax5.dom.off
		 * @param {Array} elements
		 * @param {String} type - 이벤트 타입
		 * @param {Function} [_fn] - 이벤트 콜백함수
		 * @example
 ```js
 var mydom = ax5.dom.get("[data-event-test=text-box]")
 ax5.dom.off(mydom, "click");
 ax5.dom.off(mydom, "click.fnb");
 ```
		 */
		function off(elements, typ, _fn){
			elements = validate_elements(elements, "off");
			for(var i=0;i<elements.length;i++) {
				var _d = elements[i];
				if (U.is_array(_d.e_hd[typ])) {
					var _na = [];
					for (var i = 0; i < _d.e_hd[typ].length; i++) {
						if(_d.e_hd[typ][i] == _fn || typeof _fn === "undefined") eventUnBind(_d, typ, _d.e_hd[typ][i]);
						else _na.push(_d.e_hd[typ][i]);
					}
					_d.e_hd[typ] = _na;
				} else {
					if(_d.e_hd[typ] == _fn || typeof _fn === "undefined") {
						eventUnBind(_d, typ, _d.e_hd[typ]);
						delete _d.e_hd[typ]; // 함수 제거
					}
				}
			}
		}
		/**
		 * 타겟 엘리먼트의 자식을 반환합니다.
		 * @method ax5.dom.child
		 * @param {Element|Elements} elements
		 * @returns {Elements} elements
		 * @example
```
 <ul id="list-container">
	 <li data-list-item="0">
	    <div>child>child</div>
	 </li>
	 <li data-list-item="1"></li>
	 <li data-list-item="2"></li>
	 <li data-list-item="3"></li>
	 <li data-list-item="4"></li>
	 <li data-list-item="5"></li>
 </ul>
 <script>
 var el = ax5.dom.get("#list-container");
 console.log(
	 ax5.dom.child(el)[1].tagName,
	 ax5.dom.attr(ax5.dom.child(el)[1], "data-list-item")
 );
 // LI 1
 </script>
```
		 */
		// todo : child depth 파라미터 개발
		function child(elements){
			elements = validate_elements(elements, "child");
			var return_elems = [], i= 0, l;
			if(elements[0]) {
				l = elements[0].children.length;
				for (; i < l; i++) {
					return_elems.push(elements[0].children[i]);
				}
			}
			return return_elems;
		}
		/**
		 * 타겟엘리먼트의 부모 엘리멘트 트리에서 원하는 조건의 엘리먼트를 얻습니다.
		 * @method ax5.dom.parent
		 * @param {Element} elements - target element
		 * @param {Object} cond - 원하는 element를 찾을 조건
		 * @returns {Element}
		 * @example
 ```
 // cond 속성정의
 var cond = {
    tagname: {String} - 태그명 (ex. a, div, span..),
    clazz: {String} - 클래스명
    [, 그 외 찾고 싶은 attribute명들]
 };
 console.log(
 ax5.dom.parent(e.target, {tagname:"a", clazz:"ax-menu-handel", "data-custom-attr":"attr_value"})
 );
 ```
		 */
		function parent(elements, cond){
			elements = validate_elements(elements, "child");
			var _target = elements[0];
			if (_target) {
				while ((function(){
					var result = true;
					for(var k in cond){
						if(k === "tagname"){
							if(_target.tagName.toLocaleLowerCase() != cond[k]) {
								result = false;
								break;
							}
						}
						else
						if(k === "clazz"){
							var klasss = _target.className.split(/ /g);
							var hasClass = false;
							for(var a=0;a<klasss.length;a++){
								if(klasss[a] == cond[k]){
									hasClass = true;
									break;
								}
							}
							result = hasClass;
						}
						else
						{ // 그외 속성값들.
							if(_target.getAttribute(k) != cond[k]) {
								result = false;
								break;
							}
						}
					}
					return !result;
				})()) {
					if (_target.parentNode) {
						_target = _target.parentNode;
					} else {
						_target = false; break;
					}
				}
			}
			return _target;
		}
/**
 * 형제 엘리먼트중에 앞서 위치한 엘리먼트를 반환합니다.
 * @method ax5.dom.prev
 * @param {Elements|Element} elements
 * @param {Number} [times=1] - 횟수
 * @returns {Element|null} element - 원하는 위치에 아이템이 없으면 null 을 반환합니다.
 * @example
```
 <div>
	 <ul id="list-container">
		 <li data-list-item="0" id="li0">
		    <div>child>child</div>
		 </li>
		 <li data-list-item="1" id="li1"></li>
		 <li data-list-item="2" id="li2"></li>
		 <li data-list-item="3" id="li3"></li>
		 <li data-list-item="4" id="li4"></li>
		 <li data-list-item="5" id="li5"></li>
	 </ul>
 </div>
 <script>
 var el = ax5.dom.get("#list-container");
 var li = ax5.dom.child(el)[0];
 var c_li;

 console.log(
	 (c_li = ax5.dom.next(li, 2)).id,
	 (c_li = ax5.dom.prev(c_li)).id
 );
 </script>
```
 */
		function prev(elements, times){
			return sibling(elements, "prev", times);
		}
/**
 * 형제 엘리먼트중에 다음에 위치한 엘리먼트를 반환합니다.
 * @method ax5.dom.next
 * @param {Elements|Element} elements
 * @param {Number} [times=1] - 횟수
 * @returns {Element|null} element - 원하는 위치에 아이템이 없으면 null 을 반환합니다.
 * @example
 ```
 <div>
	 <ul id="list-container">
		 <li data-list-item="0" id="li0">
		 <div>child>child</div>
		 </li>
		 <li data-list-item="1" id="li1"></li>
		 <li data-list-item="2" id="li2"></li>
		 <li data-list-item="3" id="li3"></li>
		 <li data-list-item="4" id="li4"></li>
		 <li data-list-item="5" id="li5"></li>
	 </ul>
 </div>
 <script>
 var el = ax5.dom.get("#list-container");
 var li = ax5.dom.child(el)[0];
 var c_li;

 console.log(
	 (c_li = ax5.dom.next(li, 2)).id,
	 (c_li = ax5.dom.prev(c_li)).id
 );
 </script>
 ```
 */
		function next(elements, times){
			return sibling(elements, "next", times);
		}
/**
 * 엘리먼트의 너비를 반환합니다.
 * @method ax5.dom.width
 * @param {Elements|Element} elements
 * @returns {Number} width
 * @example
```js
 var el = ax5.dom.get("#list-container")
 ax5.dom.width(el);
```
 */
		function width(elements){
			return box_size(elements, "width");
		}
/**
 * 엘리먼트의 너비를 반환합니다.
 * @method ax5.dom.height
 * @param {Elements|Element} elements
 * @returns {Number} width
 * @example
 ```js
 var el = ax5.dom.get("#list-container")
 ax5.dom.height(el);
 ```
 */
		function height(elements){
			return box_size(elements, "height");
		}
/**
 * 엘리먼트의 자식을 모두 지워줍니다. 내용을 깨긋히 비워 냅니다.
 * @method ax5.dom.empty
 * @param {Elements|Element} elements
 * @returns {Elements}
 * @example
```js
 var el = ax5.dom.get("#list-container");
 ax5.dom.empty(el);
```
 */
		function empty(elements){
			elements = validate_elements(elements, "empty");
			var i = 0, l = elements.length, el;
			for (; i < l; i++) {
				el = elements[i];
				while ( el.firstChild ) {
					el.removeChild( el.firstChild );
				}
				if ( el.options && node_name( el, "select" ) ) {
					el.options.length = 0;
				}
			}
			return elements;
		}
/**
 * 엘리먼트안에 HTML코드를 바꿔치기 합니다.
 * @method ax5.dom.html
 * @param {Elements|Element} elements
 * @param {String} [htmlcode]
 * @returns {Elements|String}
 * @example
 ```js
 var el = ax5.dom.get("#list-container");
 console.log( ax5.dom.html(el) );
 ax5.dom.html(el, "<a href='#1234'>링크");
 ```
 */
		function html(elements, val){
			elements = validate_elements(elements, "html");
			if(typeof val == "undefined"){
				return elements[0].innerHTML;
			}else{
				if(
					U.is_string(val) &&
					!rnoInnerhtml.test(val) &&
					(info.support.leadingWhitespace || !rleadingWhitespace.test(val))
				){
					val = val.replace( rxhtmlTag, "<$1></$2>" );
					var i = 0, l = elements.length;
					try {
						for (; i < l; i++) {
							elements[i].innerHTML = val;
						}
					}catch(e){}
				}
				else
				if(U.is_element(val) || U.is_nodelist(val)){
					append(empty(elements), val);
				}
				return elements;
			}
		}
		// todo : append 개발중
		function append(elements, val){

		}
		function prepend(){

		}
		function before(){

		}
		function after(){

		}

		U.extend(ax5.dom, {
			ready  : ready,
			resize : resize,
			get    : get,
			get_one: get_one,
			create : create,
			css    : css,
			clazz  : clazz,
			attr   : attr,
			on     : on,
			off    : off,
			child  : child,
			parent : parent,
			prev   : prev,
			next   : next,
			html   : html,
			append : append,
			prepend: prepend,
			before : before,
			after  : after,
			width  : width,
			height : height
		});
	})();


/**
 * Refer to this by {@link ax5}.
 * @namespace ax5.xhr
 */
	ax5.xhr = xhr = (function(){

	})();

/**
 * Refer to this by {@link ax5}.
 * @namespace ax5.ui
 */
	ax5.ui = (function(){
/**
 * @class ax5.ui.ax_ui
 * @classdesc ax5 ui class 코어 클래스 모든 클래스의 공통 함수를 가지고 있습니다.
 * @version v0.0.1
 * @author tom@axisj.com
 * @logs
 * 2014-12-12 tom : 시작
 * @example
 ```
 var myui = new ax5.ui.ax_ui();
 ```
 */
		function ax_ui(){
			this.config = {};
			this.name = "ax_ui";
/**
 * 클래스의 속성 정의 메소드 속성 확장후에 내부에 init 함수를 호출합니다.
 * @method ax5.ui.ax_ui.set_config
 * @param {Object} config - 클래스 속성값
 * @param {Boolean} [call_init=true] - init 함수 호출 여부
 * @returns {ax5.ui.ax_ui}
 * @example
```js
 var myui = new ax5.ui.ax_ui();
 myui.set_config({
    id:"abcd"
 });
```
 */
			this.set_config = function(cfg, call_init){
				U.extend(this.config, cfg, true);
				if(typeof call_init == "undefined" || call_init === true){
					this.init();
				}
				return this;
			};
			this.init = function(){
				console.log(this.config);
			};
		}
		return {
			ax_ui: ax_ui
		}
	})();

	if ( typeof module === "object" && module && typeof module.exports === "object" ){
		module.exports = ax5; // commonJS
	}else{
		root.ax5 = ax5;
		if ( typeof define === "function" && define.amd ) define("_ax5", [], function () { return ax5; }); // requireJS
	}

}.call(this));