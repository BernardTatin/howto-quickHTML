"use strict";
var utils = (function() {
    var env = null;
    var vername = null;

    var urlParam = function(name, url, default_value) {
        var results = new RegExp('[\\?&]' + name + '=([^&#]*)').exec(url);
        if (!results) {
            return default_value;
        } else {
            return results[1] || default_value;
        }
    };
    var setUrlInBrowser = function(url) {
        if (window.history && window.history.pushState) {
            window.history.pushState(document.title, document.title, url);
        }
    };
    var getElementById = function(id) {
        if (document.getElementById) {
            return document.getElementById(id);
        } else if (document.all) {
            return document.all[id];
        } else {
            console.log('getElementById does not exist!');
            return null;
        }
    };
    /**
     Populates the <code>env</code> variable with user agent and feature test
     information.

     @method getEnv
     @private
     */
    var getEnv = function() {
        var ua = navigator.userAgent;
        if (!env) {
            env = {};

            (env.webkit = /AppleWebKit\//.test(ua)) || (env.ie = /MSIE|Trident/.test(ua)) || (env.opera = /Opera/.test(ua)) || (env.gecko = /Gecko\//.test(ua)) || (env.unknown = true);
            if (env.webkit) {
                env.name = 'Webkit';
            } else if (env.ie) {
                env.name = 'MSIE';
            } else if (env.gecko) {
                env.name = 'Gecko';
            } else {
                env.name = 'unknown';
            }
        }
        return env;
    };
    var app_string = function() {
        var element = this.getElementById('appname');
        if (element) {
            if (!vername) {
                vername = 'using ' + _kernel.app_type() + ' on ' + this.getEnv().name + ' engine';
            }
            element.innerHTML = vername;
        }
    };
    var isUndefined = function(v) {
        var undefined;
        return v === undefined;
    };
    return {
        urlParam: urlParam,
        setUrlInBrowser: setUrlInBrowser,
        getElementById: getElementById,
        getEnv: getEnv,
        app_string: app_string,
        isUndefined: isUndefined
    };
})();
