var fs = require('fs');
var path = require('path');
var csv = require('csv');

module.exports = function(options) {
  options = options || {};
  options.file = path.normalize(options.file || (process.cwd() + '/' + 'code-clock.csv'));
  var now = new Date().getTime();
  var col = {
    user: 0,
    'in': 1,
    out: 2,
    total: 3,
    message: 4
  };
  options.user = options.user || process.env.USER || process.env.USERNAME;
  options.message = options.message || '';

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
      } else if (options.message) {
        console.warn('Cannot add a message with an empty log file');
        closeFile(data, false);
        return;
      }
      log('saving file');
      csv().from(data).to(options.file);
      closeFile(data);
    });

    function clockIn(data) {
      data.push([ options.user, now, '', 0, '' ]);
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
        var inDate = parseFloat(lastLine[col.in]);
        lastLine[col.total] = Math.round((now - inDate) / 1000, 0);
      }
      lastLine[col.out] = now;
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
      var lastLine = data[data.length - 1];
      var previousMessage = lastLine[col.message];
      lastLine[col.message] = (previousMessage ? previousMessage + ' - ' + options.message : options.message);
    }

    function log() {
      if (options.debug) {
        console.log.apply(console, arguments);
      }
    }

    function closeFile(data, printChanged) {
      fs.close(fd, function(err) {
        if (err) {
          console.error('There was an error saving the file: ' + options.file, err);
          process.exit(1);
          return;
        }
        if (printChanged) {
          console.log('File: ', options.file);
          console.log('Line affected: ', data[data.length - 1].join(','));
        }
      });
    }
  });
};
