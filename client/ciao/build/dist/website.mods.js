
  var Module = typeof Module !== 'undefined' ? Module : {};

  if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
  }

  Module.expectedDataFileDownloads++;
  (function() {
    // When running as a pthread, FS operations are proxied to the main thread, so we don't need to
    // fetch the .data bundle on the worker
    if (Module['ENVIRONMENT_IS_PTHREAD']) return;
    var loadPackage = function(metadata) {

      var PACKAGE_PATH = '';
      if (typeof window === 'object') {
        PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
      } else if (typeof process === 'undefined' && typeof location !== 'undefined') {
        // web worker
        PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
      }
      var PACKAGE_NAME = '/home/poo/ciao/build/site/ciao/build/dist/website.mods.data';
      var REMOTE_PACKAGE_BASE = 'website.mods.data';
      if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
        Module['locateFile'] = Module['locateFilePackage'];
        err('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
      }
      var REMOTE_PACKAGE_NAME = Module['locateFile'] ? Module['locateFile'](REMOTE_PACKAGE_BASE, '') : REMOTE_PACKAGE_BASE;
var REMOTE_PACKAGE_SIZE = metadata['remote_package_size'];

      function fetchRemotePackage(packageName, packageSize, callback, errback) {
        if (typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string') {
          require('fs').readFile(packageName, function(err, contents) {
            if (err) {
              errback(err);
            } else {
              callback(contents.buffer);
            }
          });
          return;
        }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', packageName, true);
        xhr.responseType = 'arraybuffer';
        xhr.onprogress = function(event) {
          var url = packageName;
          var size = packageSize;
          if (event.total) size = event.total;
          if (event.loaded) {
            if (!xhr.addedTotal) {
              xhr.addedTotal = true;
              if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
              Module.dataFileDownloads[url] = {
                loaded: event.loaded,
                total: size
              };
            } else {
              Module.dataFileDownloads[url].loaded = event.loaded;
            }
            var total = 0;
            var loaded = 0;
            var num = 0;
            for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
              total += data.total;
              loaded += data.loaded;
              num++;
            }
            total = Math.ceil(total * Module.expectedDataFileDownloads/num);
            if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
          } else if (!Module.dataFileDownloads) {
            if (Module['setStatus']) Module['setStatus']('Downloading data...');
          }
        };
        xhr.onerror = function(event) {
          throw new Error("NetworkError for: " + packageName);
        }
        xhr.onload = function(event) {
          if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
            var packageData = xhr.response;
            callback(packageData);
          } else {
            throw new Error(xhr.statusText + " : " + xhr.responseURL);
          }
        };
        xhr.send(null);
      };

      function handleError(error) {
        console.error('package error:', error);
      };

      var fetchedCallback = null;
      var fetched = Module['getPreloadedPackage'] ? Module['getPreloadedPackage'](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;

      if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function(data) {
        if (fetchedCallback) {
          fetchedCallback(data);
          fetchedCallback = null;
        } else {
          fetched = data;
        }
      }, handleError);

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
Module['FS_createPath']("/", "home", true, true);
Module['FS_createPath']("/home", "poo", true, true);
Module['FS_createPath']("/home/poo", "ciao", true, true);
Module['FS_createPath']("/home/poo/ciao", "build", true, true);
Module['FS_createPath']("/home/poo/ciao/build", "bundlereg", true, true);
Module['FS_createPath']("/home/poo/ciao/build", "cache", true, true);
Module['FS_createPath']("/home/poo/ciao", "website", true, true);
Module['FS_createPath']("/home/poo/ciao/website", "catalog_ui", true, true);
Module['FS_createPath']("/home/poo/ciao/website", "skel", true, true);
Module['FS_createPath']("/home/poo/ciao/website/skel", "css", true, true);
Module['FS_createPath']("/home/poo/ciao/website", "src", true, true);

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        var compressedData = {"data":null,"cachedOffset":83368,"cachedIndexes":[-1,-1],"cachedChunks":[null,null],"offsets":[0,1035,1726,2091,2529,3040,3559,4135,4657,5251,6197,7271,8477,9493,10619,11683,12379,13575,14790,15843,17010,17480,18412,19039,19433,19866,20388,20972,21487,22068,23046,24237,25550,26975,28153,29378,30287,31289,32633,33890,35036,35728,36572,37165,37665,38249,39131,40357,41758,42519,43551,44659,45790,46899,48156,49372,50514,51614,53018,54411,55748,57181,58632,59935,61174,62520,63700,65113,66431,67798,69098,70442,71900,73293,74820,76077,77286,78509,79563,80613,81505,82740],"sizes":[1035,691,365,438,511,519,576,522,594,946,1074,1206,1016,1126,1064,696,1196,1215,1053,1167,470,932,627,394,433,522,584,515,581,978,1191,1313,1425,1178,1225,909,1002,1344,1257,1146,692,844,593,500,584,882,1226,1401,761,1032,1108,1131,1109,1257,1216,1142,1100,1404,1393,1337,1433,1451,1303,1239,1346,1180,1413,1318,1367,1300,1344,1458,1393,1527,1257,1209,1223,1054,1050,892,1235,628],"successes":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}
;
            compressedData['data'] = byteArray;
            assert(typeof Module['LZ4'] === 'object', 'LZ4 not present - was your app build with -sLZ4?');
            Module['LZ4'].loadPackage({ 'metadata': metadata, 'compressedData': compressedData }, false);
            Module['removeRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/website.mods.data');
      };
      Module['addRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/website.mods.data');

      if (!Module.preloadResults) Module.preloadResults = {};

      Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
      if (fetched) {
        processPackageData(fetched);
        fetched = null;
      } else {
        fetchedCallback = processPackageData;
      }

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

    }
    loadPackage({"files": [{"filename": "/home/poo/ciao/build/bundlereg/website.bundlecfg", "start": 0, "end": 0}, {"filename": "/home/poo/ciao/build/bundlereg/website.bundlereg", "start": 0, "end": 404}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.bundle_extra_info.itf", "start": 404, "end": 19517}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.bundle_extra_info.po", "start": 19517, "end": 42999}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.bundles_dyn.itf", "start": 42999, "end": 60459}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.bundles_dyn.po", "start": 60459, "end": 83380}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.render_lpdoc.itf", "start": 83380, "end": 93474}, {"filename": "/home/poo/ciao/build/cache/website.catalog_ui.render_lpdoc.po", "start": 93474, "end": 100030}, {"filename": "/home/poo/ciao/website/catalog_ui/bundle_extra_info.pl", "start": 100030, "end": 110252}, {"filename": "/home/poo/ciao/website/catalog_ui/bundles_dyn.pl", "start": 110252, "end": 117372}, {"filename": "/home/poo/ciao/website/catalog_ui/cached_catalog.pl", "start": 117372, "end": 150363}, {"filename": "/home/poo/ciao/website/catalog_ui/render_lpdoc.pl", "start": 150363, "end": 151977}, {"filename": "/home/poo/ciao/website/skel/css/normalize.css", "start": 151977, "end": 159696}, {"filename": "/home/poo/ciao/website/skel/css/website.css", "start": 159696, "end": 164798}, {"filename": "/home/poo/ciao/website/src/SITE.pl", "start": 164798, "end": 166761}, {"filename": "/home/poo/ciao/website/src/website_config_auto.pl", "start": 166761, "end": 166803}], "remote_package_size": 87464});

  })();
