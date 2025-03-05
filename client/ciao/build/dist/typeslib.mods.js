
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
      var PACKAGE_NAME = '/home/poo/ciao/build/site/ciao/build/dist/typeslib.mods.data';
      var REMOTE_PACKAGE_BASE = 'typeslib.mods.data';
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
Module['FS_createPath']("/home/poo/ciao", "typeslib", true, true);
Module['FS_createPath']("/home/poo/ciao/typeslib", "src", true, true);
Module['FS_createPath']("/home/poo/ciao/typeslib", "tests", true, true);

      function processPackageData(arrayBuffer) {
        assert(arrayBuffer, 'Loading data file failed.');
        assert(arrayBuffer.constructor.name === ArrayBuffer.name, 'bad input to processPackageData');
        var byteArray = new Uint8Array(arrayBuffer);
        var curr;
        var compressedData = {"data":null,"cachedOffset":471094,"cachedIndexes":[-1,-1],"cachedChunks":[null,null],"offsets":[0,900,1645,2251,2809,3355,3950,4985,5520,6135,6658,7230,7956,9144,9616,10116,11056,11761,12354,12950,13537,14589,15508,16320,17165,17816,18396,19370,20508,21622,22916,23980,25050,26148,27036,27535,28112,28980,30026,31079,32008,32926,33942,34919,35883,36839,37664,38485,39442,40397,41375,42278,43293,44192,44825,45485,46004,46551,47360,48219,49179,49913,50426,51533,52478,53179,54134,54981,55868,56575,56915,57398,57910,58520,58988,59503,59950,60493,61116,61634,62193,62954,63941,64687,65460,66451,67446,68341,69500,70660,71797,72640,73604,74554,75507,76508,77552,78645,79857,80862,81931,83096,84113,85289,86493,87327,88514,89603,90807,91960,93128,94322,95518,96283,97509,98690,99884,101162,102265,103548,104680,106004,107101,108248,109510,110588,111805,113005,114315,115438,116643,117919,119120,120357,121519,122737,123919,125029,126293,127413,128604,129719,130851,132060,133174,134403,135516,136699,137922,139086,140247,141394,142408,143575,144665,145852,147105,148277,149424,150199,151272,152542,153680,154875,156072,157277,158373,159337,160242,161459,162725,163954,165203,166396,167484,168626,169878,171202,172585,173957,175086,176463,177783,179171,180544,181903,183045,184406,185722,187077,188325,189493,190775,192133,193387,194648,195893,197109,198352,199328,200400,201634,202848,203975,205044,206077,207200,208197,209302,210551,211624,212473,213472,214496,215455,216471,217660,218991,220271,220927,221920,222865,223967,225194,226213,227326,228379,229360,230252,231394,232284,233185,234392,235585,236707,237852,239135,240272,241477,242663,243887,245088,246317,247518,248676,249381,250373,251566,252546,253840,255142,256310,257459,258613,259127,259623,260246,260861,261352,261790,262179,262651,263112,263563,264061,264486,264975,265400,265854,266263,266702,267169,267624,268108,268592,269052,269583,270038,270450,270911,271369,271849,272275,272775,273267,273723,274170,274654,275146,275641,276129,276626,277078,277558,278008,278486,278975,279433,279914,280274,280707,281134,281591,282050,282520,282990,283435,283862,284296,284754,285227,285680,286191,286675,287109,287577,288111,289281,290328,291242,292306,293620,294601,295775,296690,297674,298461,299512,300679,301858,302849,304130,304969,306009,307053,307909,308860,309855,311137,312074,312975,314097,315223,316121,317286,318270,319235,320011,321253,322311,323328,324500,325586,326530,327751,328702,329620,330891,331743,332603,333835,334847,335857,336830,337912,339000,339881,341010,342165,343069,343703,344619,345707,346637,347501,348727,349263,349791,350527,351625,352339,352806,353228,354259,355225,356288,357523,358630,359457,360556,361610,362554,363730,364856,366097,367131,367985,369237,370284,371389,372092,373042,374218,375212,376312,377483,378617,379478,380201,381090,382036,383143,384248,385288,386233,387193,388379,389209,390205,391211,392256,393308,394308,395303,396533,397432,398403,399507,400665,401735,403009,404192,405274,406288,407330,408133,409010,410168,411377,412404,413490,414469,415426,416411,417317,418511,419442,420725,421865,422934,423967,424820,426075,427222,428410,429374,430571,431534,432730,433844,434893,435886,437002,438018,439174,440142,441179,442122,443303,444859,445831,446752,447703,448601,449457,450338,451401,452493,453699,454851,455888,457086,458117,459036,460155,461356,462551,463747,464674,465786,466910,467986,468989,470083],"sizes":[900,745,606,558,546,595,1035,535,615,523,572,726,1188,472,500,940,705,593,596,587,1052,919,812,845,651,580,974,1138,1114,1294,1064,1070,1098,888,499,577,868,1046,1053,929,918,1016,977,964,956,825,821,957,955,978,903,1015,899,633,660,519,547,809,859,960,734,513,1107,945,701,955,847,887,707,340,483,512,610,468,515,447,543,623,518,559,761,987,746,773,991,995,895,1159,1160,1137,843,964,950,953,1001,1044,1093,1212,1005,1069,1165,1017,1176,1204,834,1187,1089,1204,1153,1168,1194,1196,765,1226,1181,1194,1278,1103,1283,1132,1324,1097,1147,1262,1078,1217,1200,1310,1123,1205,1276,1201,1237,1162,1218,1182,1110,1264,1120,1191,1115,1132,1209,1114,1229,1113,1183,1223,1164,1161,1147,1014,1167,1090,1187,1253,1172,1147,775,1073,1270,1138,1195,1197,1205,1096,964,905,1217,1266,1229,1249,1193,1088,1142,1252,1324,1383,1372,1129,1377,1320,1388,1373,1359,1142,1361,1316,1355,1248,1168,1282,1358,1254,1261,1245,1216,1243,976,1072,1234,1214,1127,1069,1033,1123,997,1105,1249,1073,849,999,1024,959,1016,1189,1331,1280,656,993,945,1102,1227,1019,1113,1053,981,892,1142,890,901,1207,1193,1122,1145,1283,1137,1205,1186,1224,1201,1229,1201,1158,705,992,1193,980,1294,1302,1168,1149,1154,514,496,623,615,491,438,389,472,461,451,498,425,489,425,454,409,439,467,455,484,484,460,531,455,412,461,458,480,426,500,492,456,447,484,492,495,488,497,452,480,450,478,489,458,481,360,433,427,457,459,470,470,445,427,434,458,473,453,511,484,434,468,534,1170,1047,914,1064,1314,981,1174,915,984,787,1051,1167,1179,991,1281,839,1040,1044,856,951,995,1282,937,901,1122,1126,898,1165,984,965,776,1242,1058,1017,1172,1086,944,1221,951,918,1271,852,860,1232,1012,1010,973,1082,1088,881,1129,1155,904,634,916,1088,930,864,1226,536,528,736,1098,714,467,422,1031,966,1063,1235,1107,827,1099,1054,944,1176,1126,1241,1034,854,1252,1047,1105,703,950,1176,994,1100,1171,1134,861,723,889,946,1107,1105,1040,945,960,1186,830,996,1006,1045,1052,1000,995,1230,899,971,1104,1158,1070,1274,1183,1082,1014,1042,803,877,1158,1209,1027,1086,979,957,985,906,1194,931,1283,1140,1069,1033,853,1255,1147,1188,964,1197,963,1196,1114,1049,993,1116,1016,1156,968,1037,943,1181,1556,972,921,951,898,856,881,1063,1092,1206,1152,1037,1198,1031,919,1119,1201,1195,1196,927,1112,1124,1076,1003,1094,1011],"successes":[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]}
;
            compressedData['data'] = byteArray;
            assert(typeof Module['LZ4'] === 'object', 'LZ4 not present - was your app build with -sLZ4?');
            Module['LZ4'].loadPackage({ 'metadata': metadata, 'compressedData': compressedData }, false);
            Module['removeRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/typeslib.mods.data');
      };
      Module['addRunDependency']('datafile_/home/poo/ciao/build/site/ciao/build/dist/typeslib.mods.data');

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
    loadPackage({"files": [{"filename": "/home/poo/ciao/build/bundlereg/typeslib.bundlecfg", "start": 0, "end": 0}, {"filename": "/home/poo/ciao/build/bundlereg/typeslib.bundlereg", "start": 0, "end": 206}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.regtype_basic_lattice.itf", "start": 206, "end": 12284}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.regtype_basic_lattice.po", "start": 12284, "end": 48314}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.rnd_type_value.itf", "start": 48314, "end": 53977}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.rnd_type_value.po", "start": 53977, "end": 68420}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.type_errors.itf", "start": 68420, "end": 75082}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.type_errors.po", "start": 75082, "end": 107455}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.typedef.itf", "start": 107455, "end": 118395}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.typedef.po", "start": 118395, "end": 132302}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.typeslib.itf", "start": 132302, "end": 165797}, {"filename": "/home/poo/ciao/build/cache/typeslib.src.typeslib.po", "start": 165797, "end": 647023}, {"filename": "/home/poo/ciao/typeslib/src/basic_type_operations.pl", "start": 647023, "end": 690281}, {"filename": "/home/poo/ciao/typeslib/src/basic_type_operations_edz.pl", "start": 690281, "end": 706807}, {"filename": "/home/poo/ciao/typeslib/src/basic_type_operations_vr.pl", "start": 706807, "end": 712081}, {"filename": "/home/poo/ciao/typeslib/src/detunion.pl", "start": 712081, "end": 726014}, {"filename": "/home/poo/ciao/typeslib/src/name_types.pl", "start": 726014, "end": 729052}, {"filename": "/home/poo/ciao/typeslib/src/operations.pl", "start": 729052, "end": 736366}, {"filename": "/home/poo/ciao/typeslib/src/ppoint.pl", "start": 736366, "end": 744330}, {"filename": "/home/poo/ciao/typeslib/src/ppoint_vr.pl", "start": 744330, "end": 745636}, {"filename": "/home/poo/ciao/typeslib/src/pred_to_typedef.pl", "start": 745636, "end": 759871}, {"filename": "/home/poo/ciao/typeslib/src/regtype_basic_lattice.pl", "start": 759871, "end": 787903}, {"filename": "/home/poo/ciao/typeslib/src/regtype_rules.pl", "start": 787903, "end": 806796}, {"filename": "/home/poo/ciao/typeslib/src/rnd_type_value.pl", "start": 806796, "end": 811448}, {"filename": "/home/poo/ciao/typeslib/src/type_errors.pl", "start": 811448, "end": 814986}, {"filename": "/home/poo/ciao/typeslib/src/type_ops.pl", "start": 814986, "end": 815208}, {"filename": "/home/poo/ciao/typeslib/src/type_simplification.pl", "start": 815208, "end": 886853}, {"filename": "/home/poo/ciao/typeslib/src/type_translate.pl", "start": 886853, "end": 909603}, {"filename": "/home/poo/ciao/typeslib/src/type_widen.pl", "start": 909603, "end": 943580}, {"filename": "/home/poo/ciao/typeslib/src/typedef.pl", "start": 943580, "end": 947817}, {"filename": "/home/poo/ciao/typeslib/src/typedef_to_pred.pl", "start": 947817, "end": 956854}, {"filename": "/home/poo/ciao/typeslib/src/typeslib.pl", "start": 956854, "end": 996687}, {"filename": "/home/poo/ciao/typeslib/src/typeslib_deftypes.pl", "start": 996687, "end": 1009630}, {"filename": "/home/poo/ciao/typeslib/src/typeslib_hooks.pl", "start": 1009630, "end": 1010186}, {"filename": "/home/poo/ciao/typeslib/tests/test1.pl", "start": 1010186, "end": 1011640}], "remote_package_size": 475190});

  })();
