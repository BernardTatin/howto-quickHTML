/*
 * app.js
 */

"use strict";


var _kernel = (function () {
    var appConstants = {
        jsRoot: 'javascript'
    },
        appVariables = {
            config: 'howto/config.js',
            main_code: 'private/main-purejs.js',
            libs1: ['private/myajax.js'],
            libs2: ['private/jprint.js', 'private/utils.js', 'private/purejs-lib.js'],
            libname: 'pure Javascript 0.1.2',
            navigator: null
        };

    function normalize_libname(libname) {
        return appConstants.jsRoot + '/' + libname;
    }

    return {
        app_type: function () {
            return appVariables.libname;
        },
        app_loader: function () {
            appVariables.navigator = navigator.appName + ' ' + navigator.appCodeName + ' ' + navigator.appVersion;
            LazyLoad.js(appVariables.config, function () {
                LazyLoad.js(appVariables.libs1.map(normalize_libname), function () {
                LazyLoad.js(appVariables.libs2.map(normalize_libname), function () {
                    LazyLoad.js(normalize_libname(appVariables.main_code), function () {
                    });
                });
                });
            });
        }
    };
})();

_kernel.app_loader();
