var fs = require("fs");
var stateFile = __dirname + "/state/snapshot.json";
function saveSnapshot(exit) {
        //todo
//      if (exit) {
        var myData = {
                mixer: exports.ui.mixer
        };
        fs.writeFile(stateFile, JSON.stringify(myData), "utf8", function (err) {
                if (err) {
                        console.error("ERROR::saveSnapshot - " + JSON.stringify(err));
                } else {
                        console.log("NOTICE::saveSnapshot - data saved to disk");
                }
                if (exit) {
                        exit();
                }
        });
//      }
}

function loadSnapshot() {
        fs.exists(stateFile, function (exists) {
                if (exists) {
                        var myData = require(stateFile);
                        exports.ui.mixer = myData.mixer;
                        console.log("NOTICE::loadSnapshot - data loaded from disk");
                } else {
                        console.log("NOTICE::loadSnapshot - " + stateFile + " not found, starting with empty state");
                }
        });
}

exports.saveSnapshot = saveSnapshot;
exports.loadSnapshot = loadSnapshot;
exports.ui = {};
