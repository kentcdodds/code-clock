var fs = require('fs');
var path = require('path');
var csv = require('csv');

module.exports = function(options) {
  options = options || {};
  options.file = path.normalize(options.file || (process.cwd() + '/' + 'code-clock.csv'));
  var linesAffected = [];
  var now = new Date();
  var col = {
    user: 0,
    'in': 1,
    out: 2,
    total: 3,
    message: 4
  };
  options.user = options.user || process.env.USER || process.env.USERNAME;
  options.message = options.message || '';
  options.messageSeparator = options.messageSeparator || '; ';

  if (!fs.existsSync(options.file) && !options.in && !options.out) {
    console.warn('Cannot add a message with an empty log file');
    return;
  }

  fs.open(options.file, 'a', [], function(err, fd) {
    if (err) {
      console.error('There was an error opening the file: ' + options.file, err);
      process.exit(1);
      return;
    }


    csv().from.path(options.file).to.array(function(data) {
      if (!data[0].length) {
        data[0] = ['User', 'In', 'Out', 'Total Seconds', 'Messages'];
      }

      if (options.in) {
        log('clocking in');
        clockIn(data);
      } else if (options.out) {
        log('clocking out');
        clockOut(data);
      }
      if (options.message) {
        log('adding message');
        addMessage(data);
      } else if (data.length <= 1) {
        console.warn('Cannot add a message with an empty log file');
        closeFile(false);
        return;
      }
      log('saving file');
      csv().from(data.concat([[]])).to(options.file);
      closeFile();
    });
    function clockIn(data) {
      var lastLine = getUsersLastLine(options.user, data);
      if (lastLine && !lastLine[col.out]) {
        console.warn('The user ' + options.user + ' did not clock out last time (starting at '
          + lastLine[col.in] +  '). Clocking out and clocking in.');
        lastLine[col.out] = formatDate(now);
        var inDate = new Date(lastLine[col.in]);
        lastLine[col.total] = formatDuration(inDate, now);
        linesAffected.push(lastLine);
      }
      data.push([ options.user, formatDate(now), '', '', '' ]);
      linesAffected.push(data[data.length - 1]);
    }

    function clockOut(data) {
      var lastLine = getUsersLastLine(options.user, data);
      if (!lastLine) {
        data.push([]);
        lastLine = data[data.length - 1];
        lastLine[col.user] = options.user;
      }
      var alreadyClockedOut = lastLine[col.out].length !== 0;

      var notClockedIn = lastLine[col.in].length === 0;
      if (alreadyClockedOut || notClockedIn) {
        clockIn(data);
        lastLine = data[data.length - 1];
        lastLine[col.total] = 0;
        if (notClockedIn) {
          console.warn(options.user + ' was not clocked in.');
        } else if (alreadyClockedOut) {
          console.warn(options.user + ' was already clocked out.');
        }
        console.warn('Clocking in and then out immediately...');
      } else {
        var inDate = new Date(lastLine[col.in]);
        lastLine[col.total] = formatDuration(inDate, now);
      }
      lastLine[col.out] = formatDate(now);
      linesAffected.push(lastLine);
    }

    function addZero(num) {
      return (num < 10 ? '0' + num : num);
    }

    function formatDuration(start, end) {
      var diffInSeconds = Math.round((end - start) / 1000);
      var hours = Math.floor(diffInSeconds / 3600);
      var minutes = Math.floor((diffInSeconds - (hours * 3600)) / 60);
      var seconds = diffInSeconds - (hours * 3600) - (minutes * 60);

      return addZero(hours) + ':' + addZero(minutes) + ':' + addZero(seconds);
    }

    function formatDate(d) {
      var month = d.getMonth() + 1;
      var day = d.getDate();
      var year = d.getFullYear();
      var hour = d.getHours();
      var minute = d.getMinutes();
      var second = d.getSeconds();

      var date = month + '/' + day + '/' + year;
      var time = addZero(hour) + ':' + addZero(minute) + ':' + addZero(second);

      return date + ' ' + time;
    }

    function getUsersLastLine(user, data) {
      for (var i = data.length; i > 0; i--) {
        if (data[i] && data[i].length > col.user && data[i][col.user] === user) {
          return data[i];
        }
      }
      return null;
    }

    function addMessage(data) {
      var lastLine = getUsersLastLine(options.user, data);
      if (lastLine) {
        var previousMessage = lastLine[col.message];
        lastLine[col.message] = (previousMessage ? previousMessage + options.messageSeparator + options.message : options.message);
        if (linesAffected.indexOf(lastLine) === -1) {
          linesAffected.push(lastLine);
        }
      } else {
        console.warn('The user "' + options.user + '" has not clocked in.');
        // If this is the case, then we have no need to save the file.
        closeFile(false);
      }
    }

    function log() {
      if (options.debug) {
        console.log.apply(console, arguments);
      }
    }

    function getLinesAffected() {
      for (var i = 0; i < linesAffected.length; i++) {
        linesAffected[i] = linesAffected[i].join(',');
      }
      return linesAffected.join('\n');
    }

    function closeFile(data, dontPrintChanged) {
      fs.close(fd, function(err) {
        if (err) {
          console.error('There was an error saving the file: ' + options.file, err);
          process.exit(1);
          return;
        }
        if (!dontPrintChanged) {
          console.log('File: ', options.file);
          var affected = 'Line affected: ';
          if (linesAffected.length > 1) {
            affected = 'Lines affected:\n';
          }
          console.log(affected + getLinesAffected());
        }
      });
    }
  });
};
