# BCDevX Organization Web Site #
The organization page for BCDevX.  This is a browser only custom web app that uses:

-  AngularJS 
-  Bootstrap

This app does not call any APIs, yet...

## Development ##

You'll need [NodeJS](http://nodejs.org/) and [GIT](http://git-scm.com/downloads). Clone this repo from GitHub, change directory to the repo root and:

`$ npm install `

We use [WebStorm](https://www.jetbrains.com/webstorm/download/) for development.  

## Deployment ##

To deploy you must first have your development environment setup on your workstation.  In addition, the grunt-cli installed globally:

`$ npm install -g grunt-cli`

For each deployment, the /app/* folder is pushed to the BCDevX.github.io repo master branch.  In a shell from the root of the source code, use the command:

`$ grunt`
   
