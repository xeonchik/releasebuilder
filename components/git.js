
'use strict';

const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const fs = require('fs');

/**
 * Logger for git operations
 * @type {{_buffer: Array, log: Function, getEntries: Function, toString: Function}}
 */
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

/**
 * Git API
 * @type {{fetch: Function, pull: Function, info: Function, getLogger: Function, _executeCmd: Function}}
 */
var git = {

    /**
     * Fetch from origin
     * @param repo
     * @param resultCallback
     */
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

    /**
     * Pull changes to remote
     * @param repo
     * @param options
     * @param callback
     * @returns {*}
     */
    pull: function (repo, options, callback) {
        var cmd = 'git pull';

        if(options.branch) {
            cmd += ' origin ' + options.branch + ' --progress';
        }

        logger.log(cmd, repo.name);
        return this._executeCmd(cmd, {cwd: repo.path}, callback);
    },

    switch: function(repo, options, callback) {
        var cmd = 'git checkout ' + options.branch;
        logger.log(cmd, repo.name);
        return this._executeCmd(cmd, {cwd: repo.path}, callback);
    },

    /**
     * Get info about repository
     * @param repo
     * @param options
     * @param callback
     */
    info: function (repo, options, callback) {

        /* Get info about all branches */
        var promise = new Promise((resolve, reject) => {
            git._executeCmd('git branch -a', {cwd: repo.path}, function(result, output) {
                if(!result) {
                    reject(output);
                }

                var re = /remotes\/origin\/(.*)$/gm;
                var match;
                var branches = [];

                while (match = re.exec(output)) {
                    if(match[1].match(/^HEAD ->.*$/i) != null) {
                        continue;
                    }
                    branches.push(match[1]);
                }

                resolve(branches);
            });
        });

        // Then get info about active branch
        promise.then( branches => {
            git._executeCmd('git branch -v', {cwd: repo.path}, function (result, output) {
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
                    message: matches[3],
                    remote_branches: branches
                };

                callback(true, info);
            });
        });
    },

    /**
     * Return Logger object
     * @returns {{_buffer: Array, log: Function, getEntries: Function, toString: Function}}
     */
    getLogger: function() {
        return logger;
    },

    /**
     * Execute git command
     *
     * @param cmd
     * @param options
     * @param callback
     * @private
     */
    _executeCmd: function(cmd, options, callback) {
        exec(cmd, options, function (error, stdout, stderr) {
            if (error) {
                callback(false, error);
                return;
            }
            callback(true, stdout);
        });
    }
};

module.exports = git;