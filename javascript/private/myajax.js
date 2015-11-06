/*
 * myajax.js
 *
 * classes for ajax request, using classic Javascript, before version 6
 */
"use strict";

var AjaxStates = (function() {
    return {
        IDLE: 0,
        OPENED: 1,
        HEADERS_RECEIVED: 2,
        LOADING: 3,
        DONE: 4
    };
})();

var HttpStatus = (function() {
    return {
        OK: 200,
        NOTFOUND: 404
    };
})();

function Ajax(url, http_request) {
    this.url = url;
    this.http_request = http_request;
    this.request = null;
}

Ajax.prototype.createRequest = function() {
    var req = new XMLHttpRequest();
    req.self = this;
    if (req.timeout) {
        req.timeout = 9000;
    }
    req.lastState = AjaxStates.IDLE;
    req.open(this.http_request, this.url, true);
    req.onreadystatechange = function(aEvt) {
        if (this.readyState == AjaxStates.DONE) {
            if (this.status == HttpStatus.OK) {
                this.self.on_receive(this.responseText);
            } else {
                this.self.on_failure("<h1>ERREUR!!!!</h1><h2>Cette page n'existe pas!</h2><p>Vérifiez l'URL!</p>");
            }
        }
    };
    this.request = req;
};
Ajax.prototype.send = function(data) {
    this.createRequest();
    if (utils.isUndefined(data)) {
        this.request.send(null);
    }
    else {
        this.request.send(data);
    }
};

function AjaxGet(url) {
    Ajax.call(this, url, 'GET');
}

AjaxGet.prototype.__proto__ = Ajax.prototype;
