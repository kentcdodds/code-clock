#code-clock

[![NPM version](https://badge.fury.io/js/code-clock.png)](http://badge.fury.io/js/code-clock)

Clock in and clock out with code-clock. Helps to keep a log of how much time you spend working with a file in your project.

Using git timestamps helps, but you're not working the entire time between timestamps.
code-clock comes in handy when you want to keep track of the time you're actually working.

It's also really useful when you want to see what you did during a specific time of work.
Just look at the commit history on the `.csv` file that code-clock makes for you and you'll
see everything that has changed with the lines that were added to the `.csv`.

##Install:

`npm install code-clock -g`

#Use:

`clock --help`

outputs:

```
  Usage: code-clock [options] [command]

  Commands:

    in                     clock in
    out                    clock out
    add-message            uses the options to add a message to the user's most recent clock in

  Options:

    -h, --help                output usage information
    -V, --version             output the version number
    -f, --file <path>         The output file (defaults to "code-clock.csv")
    -u, --user <username>     The user to record (defaults to kentcdodds
    -m, --message <string>    Any message to add to the line
    -s, --separator <string>  The message separator (defaults to "; ")
    -d, --debug               Show debug messages
```

#Features

Outputs the following fields to a CSV file:

```
User,In,Out,Total Seconds,Messages
```

It will get the user from the currently logged in user or you can specify it with an option.

If you run `code add-message -m "This is a message"` then it will add that message to the most recent
clock in for the user specified (or logged in).

#Issues

Please [report them](http://github.com/kentcdodds/code-clock/issues)
