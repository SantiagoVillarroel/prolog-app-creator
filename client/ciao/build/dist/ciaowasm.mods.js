
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
      var PACKAGE_NAME = '/home/poo/ciao/build/site/ciao/build/dist/ciaowasm.mods.data';
      var REMOTE_PACKAGE_BASE = 'ciaowasm.mods.data';
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
Module['FS_createPath']("/home/poo/ciao", "ciaowasm", true, true);
Module['FS_createPath']("/home/poo/ciao/ciaowasm", "js", true, true);
Module['FS_createPath']("/home/poo/ciao/ciaowasm", "lib", true, true);
Module['FS_createPath']("/home/poo/ciao/ciaowasm/lib", "foreign_js", true, true);
Module['FS_createPath']("/home/poo/ciao/ciaowasm", "src", true, true);

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        var compressedData = {"data":null,"cachedOffset":37993,"cachedIndexes":[-1,-1],"cachedChunks":[null,null],"offsets":[0,988,1328,1773,2268,2831,3678,4819,5951,7243,8344,9664,10369,11400,11786,12204,12735,13290,13843,14521,15677,16939,18225,19410,20073,21223,22482,23486,24429,25704,26895,28029,29311,30497,31737,32947,34278,35741,37059],"sizes":[988,340,445,495,563,847,1141,1132,1292,1101,1320,705,1031,386,418,531,555,553,678,1156,1262,1286,1185,663,1150,1259,1004,943,1275,1191,1134,1282,1186,1240,1210,1331,1463,1318,934],"successes":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}
;
            compressedData['data'] = byteArray;
            assert(typeof Module['LZ4'] === 'object', 'LZ4 not present - was your app build with -sLZ4?');
            Module['LZ4'].loadPackage({ 'metadata': metadata, 'compressedData': compressedData }, false);
            Module['removeRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/ciaowasm.mods.data');
      };
      Module['addRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/ciaowasm.mods.data');

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
    loadPackage({"files": [{"filename": "/home/poo/ciao/build/bundlereg/ciaowasm.bundlecfg", "start": 0, "end": 0}, {"filename": "/home/poo/ciao/build/bundlereg/ciaowasm.bundlereg", "start": 0, "end": 352}, {"filename": "/home/poo/ciao/build/cache/ciaowasm.lib.foreign_js.foreign_js_rt.itf", "start": 352, "end": 11714}, {"filename": "/home/poo/ciao/build/cache/ciaowasm.lib.foreign_js.foreign_js_rt.po", "start": 11714, "end": 24664}, {"filename": "/home/poo/ciao/build/cache/ciaowasm.src.ciaowasm.itf", "start": 24664, "end": 38778}, {"filename": "/home/poo/ciao/build/cache/ciaowasm.src.ciaowasm.po", "start": 38778, "end": 48868}, {"filename": "/home/poo/ciao/ciaowasm/js/ciao-async.js", "start": 48868, "end": 59986}, {"filename": "/home/poo/ciao/ciaowasm/js/ciao-eng.js", "start": 59986, "end": 66858}, {"filename": "/home/poo/ciao/ciaowasm/js/ciao-worker.js", "start": 66858, "end": 71053}, {"filename": "/home/poo/ciao/ciaowasm/js/post-js.js", "start": 71053, "end": 71060}, {"filename": "/home/poo/ciao/ciaowasm/js/pre-js.js", "start": 71060, "end": 71488}, {"filename": "/home/poo/ciao/ciaowasm/lib/foreign_js/foreign_js.pl", "start": 71488, "end": 71615}, {"filename": "/home/poo/ciao/ciaowasm/lib/foreign_js/foreign_js_rt.pl", "start": 71615, "end": 74571}, {"filename": "/home/poo/ciao/ciaowasm/src/ciaoengwasm.pl", "start": 74571, "end": 75026}, {"filename": "/home/poo/ciao/ciaowasm/src/ciaowasm.pl", "start": 75026, "end": 79390}], "remote_package_size": 42089});

  })();
