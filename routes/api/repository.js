var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

const fs = require('fs');
var projects = require('../../components/projects_store');
const git = require('../../components/git');


/**
 * TODO: replace similar logic (checks, gets) into single functions/methods; move "add repo" into model
 */

/* GET home page. */
router.post('/add', function(req, res, next) {
  var repoUrl = req.body.url;
  var projectId = req.body.projectId;

  /**
   * TODO: validate git url with ls-remote
   */

  var matches = repoUrl.match(/\/([a-zA-Z0-9_-]+)\.git/i)

  if(!matches) {
    return res.send({error: "Не удалось определить название репозитория."});
  }

  var repoName = matches[1];

  var project = projects.getById(projectId);

  if(project.repositories == undefined) {
    project.repositories = [];
  }

  var duplicate = false;
  project.repositories.forEach(function (item) {
    if(item.url == repoUrl || item.name == repoName) {
      duplicate = true;
    }
  });

  if(duplicate) {
    return res.send({error: "Репозиторий уже добавлен."});
  }

  var cwd = project.workspacePath;
  var cmd = 'git';

  const proc = spawn(cmd, ['clone', repoUrl, repoName], {
    cwd: cwd
  });
  var result = '';

  proc.stdout.on('data', function (data) {
      console.info(data);
      result += data;
  });

  proc.stderr.on('data', function (data) {
    result += data;
  });

  proc.on('exit', function(code) {
    if(code == 0) {
      res.send({result: true});

      project.repositories.push({
        name: repoName,
        url: repoUrl,
        path: cwd + '\\' + repoName
      });

      projects.persist();
    } else {
      res.send({error: result});
    }
  });
});

router.get('/log', function (req, res) {
    res.send(git.getLogger().getEntries());
});

router.get('/fetch-all', function(req, res, next) {
    var projectId = req.query.projectId;
    var project = projects.getById(projectId);

    if(!project) {
        return res.status(404).send("Project not found");
    }

    project.repositories.forEach(function (repo) {
        git.fetch(repo, function (result, response) {
            console.info("Fetch result: " + result);
        });
    });

    res.send({result: true});

});

router.get('/pull-all', function(req, res, next) {
    var projectId = req.query.projectId;
    var project = projects.getById(projectId);

    if(!project) {
        return res.status(404).send("Project not found");
    }

    project.repositories.forEach(function (repo) {
        git.pull(repo, {branch: "master"}, function (result, response) {
            console.info("Pull result: " + result);
        });
    });

    res.send({result: true});
});

router.get('/info', function(req, res, next) {
    var projectId = req.query.projectId;
    var project = projects.getById(projectId);

    if(!project) {
        return res.status(404).send("Project not found");
    }

    var repoisotryName = req.query.repositoryName;
    var repo = null;
    project.repositories.forEach(function (item) {
        if(item.name == repoisotryName) {
            repo = item;
        }
    });

    if(!repo) {
        return res.status(404).send("Repository not found");
    }

    git.info(repo, {}, function (result, info) {
        res.send(info);
    });
});

router.get('/switch', function(req, res, next) {
    var projectId = req.query.projectId;
    var project = projects.getById(projectId);

    if(!project) {
        return res.status(404).send("Project not found");
    }

    var repoisotryName = req.query.repositoryName;
    var branch = req.query.branch;

    var repo = null;
    project.repositories.forEach(function (item) {
        if(item.name == repoisotryName) {
            repo = item;
        }
    });

    if(!repo) {
        return res.status(404).send("Repository not found");
    }

    git.switch(repo, {branch: branch}, function(result){
        res.send(result);
    });
});


module.exports = router;
