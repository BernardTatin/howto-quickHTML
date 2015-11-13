/*
 * app.js
 */

/* global LazyLoad */

"use strict";


var _kernel = (function() {
    var appConstants = {
            jsRoot: 'javascript'
        },
        appVariables = {
            config: 'howto/config.js',
            main_code: 'private/main-purejs.js',
            libs1: ['private/myajax.js'],
            libs2: ['private/jprint.js', 'private/utils.js', 'private/purejs-lib.js'],
            libname: 'pure Javascript 0.2.0',
            navigator: null
        };

    function normalize_libname(libname) {
        return appConstants.jsRoot + '/' + libname;
    }

    function app_type() {
        return appVariables.libname;
    }

    function app_loader() {
        appVariables.navigator = navigator.appName + ' ' +
            navigator.appCodeName + ' ' +
            navigator.appVersion;
        LazyLoad.js(appVariables.config, function() {
            LazyLoad.js(appVariables.libs1.map(normalize_libname), function() {
                LazyLoad.js(appVariables.libs2.map(normalize_libname), function() {
                    LazyLoad.js(normalize_libname(appVariables.main_code), function() {});
                });
            });
        });
    }

    return {
        app_type: app_type,
        app_loader: app_loader
    };
})();

_kernel.app_loader();
