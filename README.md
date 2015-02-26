# BCDevExchange Organization Web Site #
The organization page for the BCDevExchange experiment.  This is a browser only custom web app that uses:

-  AngularJS 
-  Bootstrap

This app does not call any APIs, yet...

*We are open to pull requests!*

## Development ##

You'll need [NodeJS](http://nodejs.org/) and [GIT](http://git-scm.com/downloads). Clone this repo from GitHub, change directory to the repo root and:

`npm install `

We use [WebStorm](https://www.jetbrains.com/webstorm/download/) for development.  

## Server Deployment ##

First time setup, you'll need [NodeJS](http://nodejs.org/) and [GIT](http://git-scm.com/downloads).
`git clone --branch <master or discovery> git://github.com/BCDevExchange/BCDevExchange-app.git`
`npm install`
`chmod +x foreverme.sh`

You'll want to create a local configuration file in config called:
`./config/local.json`

Starting the NodeJS server in forever mode:
`cd BCDevExchange`
`./foreverme.sh`

Stdout, stderr and forever logs are here:
`log/`

Updating deployment:
`git pull`

Forever will auto restart NodeJS.


