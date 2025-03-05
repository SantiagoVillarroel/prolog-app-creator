// Preload modules and sources
var Ciao;
if (typeof Ciao === 'undefined') Ciao = eval('(function() { try { return Ciao || {} } catch(e) { return {} } })()');
if (!Ciao.depends) Ciao.depends = [];
Ciao.depends.push('website');
(function () {
  var wksp = '/home/poo/ciao';
  var bundle = {};
  Ciao.bundle['website'] = bundle;
  bundle.wksp = wksp;
  bundle.preload = function () {
Module = Ciao.module;
LZ4 = Module.getLZ4();
importScripts(Ciao.ciao_root_URL + 'build/dist/website.mods.js');
  };
})();
