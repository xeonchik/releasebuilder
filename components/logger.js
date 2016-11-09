
'use strict';

var logger = {
    _buffer: [],

    log: function (msg) {

        var entry = {
            msg: msg,
            date_time: new Date(),
            level: 'info'
        };

        this._buffer.push(entry);
    },

    toString: function () {
        var output = '';
        this._buffer.forEach(function(item) {
            output += item.date_time.toLocaleTimeString() + '.' + item.date_time.getMilliseconds() + ': ' + item.msg + '<br/>';
        });
        return output;
    }
};


module.exports = logger;