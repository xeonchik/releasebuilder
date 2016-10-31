var storage = require('node-persist');

storage.initSync({
    dir: './data/storage',
    stringify: JSON.stringify,
    parse: JSON.parse,
    encoding: 'utf8',
    logging: false,  // can also be custom logging function
    continuous: true,
    interval: false, // milliseconds
    ttl: false // ttl* [NEW], can be true for 24h default or a number in MILLISECONDS
});

var projects = [];
var storedProject = storage.getItemSync("projects");
if(storedProject != undefined) {
    projects = storedProject;
}

projects.getById = function(projectId) {
  var result = undefined;
  projects.forEach(function(value, key){
    if(projectId == value.id) {
      result = value;
    }
  });
  return result;
};

projects.persist = function () {
  return storage.setItemSync("projects", projects);
};

module.exports = projects;