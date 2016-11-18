var express = require('express');
var router = express.Router();
const spawn = require('child_process').spawn;

const fs = require('fs-extra');
var projects = require('../../components/projects_store');
const git = require('../../components/git');


/** TODO: move "add repo" into model */
/** TODO: rewrite this controller (it is wrong to use exec/spawn in controller) */
router.post('/add', function(req, res, next) {
  var repoUrl = req.body.url;
  var projectId = req.body.projectId;

  /**
   * TODO: validate git url with ls-remote
   */

  var matches = repoUrl.match(/\/([a-zA-Z0-9_-]+)\.git/i)

  if (!matches) {
    return res.send({error: "Cannot detect git repository name. May be URL is wrong."});
  }

  var repoName = matches[1];

  var project = projects.getById(projectId);

  if (project.repositories == undefined) {
    project.repositories = [];
  }

  var duplicate = false;
  project.repositories.forEach(function (item) {
    if(item.url == repoUrl || item.name == repoName) {
      duplicate = true;
    }
  });

  if (duplicate) {
    return res.send({error: "Repository already added."});
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
    if (code == 0) {
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

/**
 * Get git console logger data
 */
router.get('/log', function (req, res) {
    res.send(git.getLogger().getEntries());
});

/**
 * Sync local copy of repository with remote
 */
router.get('/fetch-all', function(req, res, next) {
    try {
        var objects = objectInitializer(['project'], req);
    } catch (e) {
        return res.status(404).send(e);
    }

    var project = objects.project;

    project.repositories.forEach(function (repo) {
        git.fetch(repo, function (result, response) {
            console.info("Fetch result: " + result);
        });
    });

    res.send({result: true});

});

/**
 * Pull changes from remote branch
 */
router.get('/pull-all', function(req, res, next) {
    try {
        var objects = objectInitializer(['project'], req);
    } catch (e) {
        return res.status(404).send(e);
    }

    var project = objects.project;

    project.repositories.forEach(function (repo) {
        git.pull(repo, null,function (result, response) {
            console.info("Pull result: " + result);
        });
    });

    res.send({result: true});
});

/**
 * Fetch info about repository
 */
router.get('/info', function(req, res, next) {
    try {
        var objects = objectInitializer(['project', 'repository'], req);
    } catch (e) {
        return res.status(404).send(e);
    }

    git.info(objects.repository, {}, function (result, info) {
        res.send(info);
    });
});

/**
 * Remove repository work copy
 */
router.get('/remove', function(req, res, next) {
    try {
        var objects = objectInitializer(['project', 'repository'], req);
    } catch (e) {
        return res.status(404).send(e);
    }

    fs.remove(objects.repository.path, (err) => {
        if (err) {
            return res.status(500).send(err);
        }

        var index = objects.project.repositories.indexOf(objects.repository);
        objects.project.repositories.splice(index, 1);
        projects.persist();

        res.send({result: true});
    });
});

/**
 * Switch branch of repository
 */
router.get('/switch', function(req, res, next) {
    try {
        var objects = objectInitializer(['project', 'repository'], req);
    } catch (e) {
        return res.status(404).send(e);
    }
    var branch = req.query.branch;

    git.switch(objects.repository, {branch: branch}, function(result){
        res.send(result);
    });
});

/**
 * Object initializer and error handling
 * Can be used for initialize object from query params
 *
 * @param objects_aliases
 * @param request
 */
function objectInitializer(objects_aliases, request)
{
    if(request == undefined) {
        throw "Request object is undefined";
    }

    var objects = {};

    objects_aliases.forEach(function(alias){
        switch (alias) {
            case 'project':
                var project = projects.getById(request.query.projectId);
                if (!project) { throw "Project not found" }
                objects.project = project;
                break;
            case 'repository':
                var name = request.query.repositoryName;
                var repo = null;
                var project = objects.project;

                project.repositories.forEach(function (item) {
                    if(item.name == name) {
                        repo = item;
                    }
                });
                if(!repo) { throw "Repository not found" }
                objects.repository = repo;
                break;
            default:
                break;
        }
    });

    return objects;
}

module.exports = router;
