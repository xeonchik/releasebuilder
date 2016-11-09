
'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const fs = require('fs');
const logger = require('./logger.js');

var git = {

    fetch: function (repo, resultCallback) {
        var cwd = repo.path;
        var cmd = 'git fetch';

        logger.log(cmd);

        exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                //txt_log.push(error.stack);
                resultCallback(false, error);
                return;
            }

            //txt_log.push(stdout);
            resultCallback(true, stdout);
        });
    },

    pull: function (repo, options, callback) {
        var cmd = 'git pull';

        if(options.branch) {
            cmd += ' origin ' + options.branch + ' --progress';
        }

        return this._executeCmd(cmd, {cwd: repo.path}, callback);
    },

    info: function (repo, options, callback) {
        this._executeCmd('git branch -v', {cwd: repo.path}, function (result, output) {
            if(!result) {
                callback(result, output);
                return;
            }

            var matches = output.match(/^\* (.*)\s+([a-f0-9]+) (.*)$/im);

            if(!matches) {
                callback(false, "Cannot match branch info");
                return;
            }

            var info = {
                branch: matches[1],
                commit: matches[2],
                message: matches[3]
            };

            callback(true, info);
        });
    },

    _executeCmd: function(cmd, options, callback) {
        logger.log(cmd);

        exec(cmd, options, function (error, stdout, stderr) {
            if (error) {
                //txt_log.push(error.stack);
                callback(false, error);
                return;
            }
            //txt_log.push(stdout);
            callback(true, stdout);
        });
    }
};

module.exports = git;