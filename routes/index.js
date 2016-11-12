var express = require('express');
var router = express.Router();
var projects = require('../components/projects_store.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Release Builder', projects: JSON.stringify(projects) });
});



module.exports = router;
