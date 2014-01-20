To get this running:

1. Install Haraka
```
npm install -g Haraka
```

2. Clone this repo
```
git clone https://github.com/pauljohncleary/oatmail-server.git
```

3. Run Haraka 
```
haraka -c oatmail-server/haraka
```

This directory contains two key directories for how Haraka will function:

 - config
           This directory contains configuration files for Haraka. The
           directory contains the default configuration. You probably want
           to modify some files in here, particularly `smtp.ini`.
 - plugins
           This directory contains custom plugins which you write to run in
           Haraka. The plugins which ship with Haraka are still available
           to use.
 - docs/plugins
           This directory contains documentation for your plugins.

Documentation for Haraka is available via `haraka -h <name> where the name
is either the name of a plugin (without the .js extension) or the name of
a core Haraka module, such as `Connection` or `Transaction`.

To get documentation on writing a plugin type `haraka -h Plugins`.
