var express = require('express');
var router = express.Router();
var projects = require('../../components/projects_store');
var storage = require('node-persist');
var sha1 = require('sha1');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

router.post('/save', function(req, res, next) {

    //  input variables
    var name = req.body.name;
    var workspacePath = req.body.workspace;

    var duplicateError = false;
    projects.forEach(function (item, i) {
        if(item.name == name || item.workspacePath == workspacePath) {
            duplicateError = true;
        }
    });
    if (duplicateError) {
        res.send({error: "Project with the same name or path already exists."});
        return;
    }

    projects.push({
        id: sha1(name),
        name: name,
        workspacePath: workspacePath
    });

    storage.setItemSync("projects", projects);
    res.send({result: true});
});

router.get('/list', function (req, res) {
    res.send(projects);
});

module.exports = router;
