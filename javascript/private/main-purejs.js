/*
 * main-purejs.js
 */

"use strict";

var PAGESCTS = (function () {
    return {
        CONTENT: 0,
        NAVIGATION: 1,
        FOOTER: 2,
        ARTICLE: 3,
        MORECONTENT: 4
    };
})();

var allPages = null;


function Query(location, root) {
    this.location = location;
    this.root = root;
    this.pageName = null;
    this.url = null;
    if (!utils.isUndefined(location) && !utils.isUndefined(root)) {
        this.root = root;
        this.pageName = location;
    } else {
        if (utils.isUndefined(location) && utils.isUndefined(root)) {
            this.url = window.location.href;
        } else if (!utils.isUndefined(location)) {
            this.url = location;
        } else {
            this.url = window.location.href;
        }
        this.root = this.urlParam('root', config.DEFAULT_ROOT);
        this.pageName = this.urlParam('page', config.DEFAULT_PAGE);
    }
}
if (typeof Query.initialized == "undefined") {
    Query.prototype.urlParam = function (name, default_value) {
        return utils.urlParam(name, this.url, default_value);
    };
    Query.prototype.getRoot = function () {
        return this.root;
    };
    Query.prototype.getPageName = function () {
        return this.pageName;
    };
    Query.initialized = true;
}


function BasePage(place) {
    this.isItLoaded = false;
    this.place = place;
}

if (typeof BasePage.initialized == "undefined") {
    BasePage.prototype.getPlace = function () {
        return this.place;
    }

    BasePage.prototype.setHTMLByClassName = function (className, html) {
        var nodes = document.getElementsByClassName(className);
        for (var i = 0, nl = nodes.length; i < nl; i++) {
            nodes[i].innerHTML = html;
        }
    };
    BasePage.prototype.set = function () {
        this.isItLoaded = true;
    };
    BasePage.prototype.reset = function () {
        this.isItLoaded = false;
    };
    BasePage.prototype.amILoaded = function () {
        return this.isItLoaded;
    };
    BasePage.prototype.forEachElementById = function (id, onElement) {
        var elements = utils.getElementById(this.getPlace()).getElementsByTagName(id);
        for (var i = 0, el = elements.length; i < el; i++) {
            onElement(elements[i]);
        }
    };
    BasePage.initialized = true;
}

function Page(query, place, session, hasCopyright) {
    // this.__proto__.__proto__.constructor.apply(this, [place]);
    BasePage.call(this, place);
    this.query = query;
    this.session = session;
    this.hasCopyright = hasCopyright;
}
if (typeof Page.initialized == "undefined") {
    Page.prototype.__proto__ = BasePage.prototype;

    Page.prototype.getSession = function () {
        return this.session;
    }

    Page.prototype.getPageName = function () {
        return this.query.getPageName();
    };
    Page.prototype.fileName = function () {
        if (!this.file_name) {
            this.file_name = config.SITE_BASE + '/' +
                this.query.getRoot() + '/' + this.getPageName() + '.html';
        }
        return this.file_name;
    };
    Page.prototype.copyright = function () {
        this.setHTMLByClassName('copyright', config.COPYRIGHT);
    };
    Page.prototype.authors = function () {
        this.setHTMLByClassName('authors', config.AUTHORS);
    };
    Page.prototype.supressMetaTags = function (str) {
        var metaPattern = /<meta.+\/?>/g;
        return str.replace(metaPattern, '');
    };
    Page.prototype.before_on_success = function (result) {
        try {
            var place = this.getPlace();
            utils.getElementById(place).innerHTML = this.supressMetaTags(result);
        } catch (e) {
            console.log('ERROR: ' + e);
        }
    };
    Page.prototype.main_on_sucess = function (result) {

    };
    Page.prototype.after_on_success = function () {
        if (this.hasCopyright) {
            this.copyright();
            this.authors();
        }
        utils.app_string();
    };
    Page.prototype.on_failure = function (result) {
        var place = this.getPlace();
        utils.getElementById(place).style.display = 'none';
    };
    Page.prototype.on_success = function (result) {
        var place = this.getPlace();
        // TODO = put this 'inline-block' in a constant
        try {
            utils.getElementById(place).style.display = 'inline-block';
        } catch (e) {
            console.log('ERROR : ' + e);
        }
        this.before_on_success(result);
        if (result === null) {
            console.log('DEBUG (168): result=' + result);
            console.trace();
        }
        this.main_on_sucess(result);
        this.after_on_success();
        this.set();
    };
    Page.initialized = true;
}

function AjaxGetPage(page) {
    AjaxGet.call(this, page.fileName());
    this.page = page;
}
if (typeof AjaxGetPage.initialized == "undefined") {
    AjaxGetPage.prototype.__proto__ = AjaxGet.prototype;

    AjaxGetPage.prototype.on_receive = function (data) {
        this.page.on_success(data);
    };
    AjaxGetPage.prototype.on_failure = function (data) {
        this.page.on_failure(data);
    };
    AjaxGetPage.initialized = true;
}

function PagesCollection(content, navigation, footer, article, morecontent) {
    this.pages = null;
    this.reloadAll(content, navigation, footer, article, morecontent);
}
if (typeof PagesCollection.initialized == "undefined") {
    PagesCollection.prototype.doload = function () {
        this.pages.map(function (page) {
            if (!page.amILoaded()) {
                return new AjaxGetPage(page);
            } else {
                return null;
            }
        }).forEach(function (req) {
            if (req) {
                req.send();
            }
        });
    };
    PagesCollection.prototype.reloadAll = function (content, navigation, footer, article, morecontent) {
        this.pages = [content, navigation, footer, article, morecontent];
        this.doload();
    };
    PagesCollection.prototype.reloadArticle = function (article) {
        article.reset();
        this.pages[PAGESCTS.ARTICLE] = article;
        this.doload();
    };
    PagesCollection.initialized = true;
}

function PageArticle(query, place, session, hasCopyright) {
    // this.__proto__.__proto__.constructor.call(this, query, place, session, hasCopyright);
    Page.call(this, query, place, session, hasCopyright);
    window.article = this;
}
if (typeof PageArticle.initialized == "undefined") {
    PageArticle.prototype.__proto__ = Page.prototype;
    // PageArticle.prototype.mysuper = new Page();

    PageArticle.prototype.resizeSVG = function () {
        var maxWidth = utils.getElementById(this.getPlace()).clientWidth;
        console.log('resize SVG in');

        this.forEachElementById('svg',
            function (element) {
                var width = element.clientWidth;
                var height = element.clientHeight;
                var newHeight = height * maxWidth / width;
                element.style.width = maxWidth + 'px';
                element.style.height = newHeight + 'px';
                console.log('resize ' + width + ' -> ' + maxWidth);
            });
        console.log('resize SVG out');
    };

    PageArticle.prototype.after_on_success = function () {
        this.resizeSVG();
        this.__proto__.__proto__.after_on_success.call(this);
    };
    PageArticle.initialized = true;
}

function PageContent(query, place, session, mainQuery, hasTitle) {
    // this.__proto__.__proto__.constructor.call(this, query, place, session);
    Page.call(this, query, place, session);
    this.mainQuery = mainQuery;
    this.hasTitle = hasTitle;
}
var clickdEventListener = function (e) {
    // cf http://www.sitepoint.com/javascript-this-event-handlers/
    e = e || window.event;
    var myself = e.target || e.srcElement;
    var href = myself.href;
    var query = new Query(href);
    var lroot = query.getRoot();

    // prevents <a> executing the default behavior
    // which is to load the page
    e.preventDefault();
    console.log('begin clickdEventListener');
    myself.self.query = query;
    myself.self.mainQuery = query;
    if (lroot !== myself.currentRoot) {
        console.log('reloadAll !!');
        allPages.reloadAll(
            new PageContent(new Query('content', lroot), 'toc', myself.session, query, true),
            new PageContent(new Query('navigation', lroot), 'navigation', myself.session, query),
            new Page(new Query('footer', lroot), 'footer', myself.session, true),
            new PageArticle(query, 'article', myself.session),
            new Page(new Query('morecontent', lroot), 'morecontent', myself.session, true)
        );
    } else {
        console.log('reloadArticle !!');
        allPages.reloadArticle(new PageArticle(query, 'article', myself.session));
    }
    myself.self.toc_presentation(query);
    console.log('end clickdEventListener');
    return false;
};

if (typeof PageContent.initialized == "undefined") {
    PageContent.prototype.__proto__ = Page.prototype;

    PageContent.prototype.toc_presentation = function (query) {
        if (query === null) {
            console.log('ERROR: query === null');
            console.trace();
        }
        var currentPage = query.getPageName();
        var currentRoot = query.getRoot();
        var url = query.url;

        this.forEachElementById('a',
            function (element) {
                var href = element.getAttribute('href');
                var query = new Query(href);

                element.className = 'normal-node';
                if (query.getPageName() === currentPage &&
                    query.getRoot() === currentRoot) {
                    var title = element.innerHTML;
                    utils.getElementById('main_title').innerHTML = title;
                    utils.setUrlInBrowser(url);
                    document.title = title;
                    element.className = 'current-node';
                }
            });
    };
    PageContent.prototype.main_on_sucess = function (result) {
        var session = this.getSession();
        var currentRoot = this.query.getRoot();
        var self = this;

        self.forEachElementById('a',
            function (element) {
                console.log('add clickdEventListener');
                element.self = self;
                element.href = element.getAttribute('href');
                element.currentRoot = currentRoot;
                element.session = session;
                purejsLib.addEvent(element, 'click', clickdEventListener);
            });
        self.toc_presentation(self.mainQuery);
    };

    PageContent.prototype.after_on_success = function () {
        this.toc_presentation(this.mainQuery);
        this.__proto__.__proto__.after_on_success.call(this);
    };
    PageContent.prototype.before_on_success = function (result) {
        if (this.hasTitle && config.TOC_TITLE) {
            result = '<h2>' + config.TOC_TITLE + '</h2>' + result;
        }
        this.__proto__.__proto__.before_on_success.call(this, result);
    };
    PageContent.prototype.on_success = function (result) {
        if (!jprint.isInPrint()) {
            this.__proto__.__proto__.on_success.call(this, result);
        } else {
            var place = this.getPlace();
            utils.getElementById(place).style.display = 'none';
        }
    };
    PageContent.initialized = true;
}

function Session() {
    this.query = new Query();
}
Session.prototype.load = function () {
    console.log('Session.load !!');
    var broot = this.query.getRoot();
    allPages =
        new PagesCollection(
            new PageContent(new Query('content', broot), 'toc', this, this.query, true),
            new PageContent(new Query('navigation', broot), 'navigation', this, this.query),
            new Page(new Query('footer', broot), 'footer', this, true),
            new PageArticle(this.query, 'article', this),
            new Page(new Query('morecontent', broot), 'morecontent', this, true)
        );

    utils.getElementById('site-name').innerHTML = config.SITE_NAME;
    utils.getElementById('site-description').innerHTML = config.SITE_DESCRIPTION;
    return this;
};

var resizeEventListener = function (e) {
    if (allPages && allPages[PAGESCTS.ARTICLE]) {
        allPages[PAGESCTS.ARTICLE].resizeSVG();
    }
};

function start() {
    var session;

    window.article = null;
    purejsLib.addEvent(window, 'resize', function (e) {
        var article = window.article;
        if (article) {
            article.resizeSVG();
        }
    });
    session = new Session();
    session.load();
}

docReady(start);
