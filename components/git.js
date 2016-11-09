
'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const fs = require('fs');

var logger = {
    _buffer: [],

    log: function (msg, repo) {
        var entry = {
            msg: msg,
            date_time: new Date(),
            level: 'info',
            repo: repo
        };

        this._buffer.push(entry);
    },

    getEntries: function () {
        return this._buffer;
    },

    toString: function () {
        var output = '';
        this._buffer.forEach(function(item) {
            output += item.date_time.toLocaleTimeString() + '.' + item.date_time.getMilliseconds() + ': ' + item.msg + "\n";
        });
        return output;
    }
};

var git = {

    fetch: function (repo, resultCallback) {
        var cwd = repo.path;
        var cmd = 'git fetch';

        logger.log(cmd, repo.name);

        exec(cmd, {cwd: cwd}, function (error, stdout, stderr) {
            if (error) {
                resultCallback(false, error);
                return;
            }
            resultCallback(true, stdout);
        });
    },

    pull: function (repo, options, callback) {
        var cmd = 'git pull';

        if(options.branch) {
            cmd += ' origin ' + options.branch + ' --progress';
        }

        logger.log(cmd, repo.name);
        return this._executeCmd(cmd, {cwd: repo.path}, callback);
    },

    info: function (repo, options, callback) {

        logger.log('git branch -v', repo.name);

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

    getLogger: function() {
        return logger;
    },

    _executeCmd: function(cmd, options, callback) {
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