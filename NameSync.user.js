// ==UserScript==
// @name           4chan X Name Sync
// @version        4.0.0
// @namespace      milky
// @description    Shares names with other posters on 4chan's forced anon boards. Requires 4chan X v3.
// @author         milkytiptoe
// @author         ihavenoface
// @run-at         document-idle
// @include        *://boards.4chan.org/b/*
// @include        *://boards.4chan.org/q/*
// @include        *://boards.4chan.org/soc/*
// @updateURL      https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js
// @downloadURL    https://github.com/milkytiptoe/Name-Sync/raw/master/NameSync.user.js
// @homepage       http://milkytiptoe.github.com/Name-Sync/
// @icon           data:image/gif;base64,R0lGODlhIAAgAMQQABAQEM/Pz9/f3zAwMH9/f+/v7yAgIGBgYJ+fn6+vr4+Pj1BQUHBwcL+/v0BAQAAAAP///wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAEAABAALAAAAAAgACAAAAXNICSOZGmeaKqubOu6QvC+DSDPopAQfFOMjYdthhg8jsiHowEJKmGOpPToUFBbAcB0i3SwBNqkYUE4GLbeVRRpQJQaxmQ6lUgOfqKDYx/vqpEAeCJZXHMnAkkEJoRThiYISYIkAg2Vlg03OJqbnC8MDgcEbikBew5hQpkjBUkMKk5TQyQESaomsLECQHYruA8DTCUIqA/BKb4PBgpMAghrSAcsyFxIAy1OBsRcB5LHVAIH1AYJLwJGaQIEDmdKB+Q4BQMLnSkF7/T4+fr4IQA7
// ==/UserScript==

// Contributers: https://github.com/milkytiptoe/Name-Sync/graphs/contributors

(function() {
  var CSS, Main, Menus, Names, Set, Settings, Sync, Updater, d, g;

  Set = {};

  d = document;

  g = {
    namespace: "NameSync.",
    version: "4.0.0",
    threads: [],
    board: null
  };

  CSS = {
    init: function() {}
  };

  Main = {
    init: function() {}
  };

  Menus = {
    init: function() {}
  };

  Names = {
    init: function() {}
  };

  Settings = {
    main: {
      "Sync on /b/": ["Enable sync on /b/", true],
      "Sync on /q/": ["Enable sync on /q/", true],
      "Sync on /soc/": ["Enable sync on /soc/", true],
      "Hide IDs": ["Hide Unique IDs next to names", false],
      "Automatic Updates": ["Check for updates automatically", true],
      "Persona Fields": ["Share persona fields instead of the 4chan X quick reply fields", false]
    },
    init: function() {},
    open: function() {},
    get: function() {},
    set: function() {}
  };

  Sync = {
    init: function() {}
  };

  Updater = {
    init: function() {},
    update: function() {}
  };

  Main.init();

}).call(this);
