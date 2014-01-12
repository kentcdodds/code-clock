#code-clock

Clock in and clock out with code-clock. Helps to keep a log of how much time you spend working with a file in your project.

##Install:

`npm install code-clock -g`

Use:

`clock --help`

outputs:

```
Usage: clock [options] [command]

  Commands:

    in                     clock in
    out                    clock out
    r                      run with the given options

  Options:

    -h, --help              output usage information
    -V, --version           output the version number
    -f, --file <path>       The output file (defaults to "<current directory>/code-clock.csv")
    -u, --user <username>   The user to record (defaults to kentcdodds
    -m, --message <string>  Any message to add to the line
    -d, --debug             Show debug messages
```