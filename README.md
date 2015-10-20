[![Stories in Ready](https://badge.waffle.io/BCDevExchange/BCDevExchange-app.png?label=ready&title=Ready)](https://waffle.io/BCDevExchange/BCDevExchange-app)
[![Build Status](https://sandbox1.apis.gov.bc.ca/cis/job/uat-BCDevExchange-app/badge/icon)](https://sandbox1.apis.gov.bc.ca/cis/job/uat-BCDevExchange-app/)
# BCDevExchange Organization Web Site #

[![Join the chat at https://gitter.im/BCDevExchange/BCDevExchange-app](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/BCDevExchange/BCDevExchange-app?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
<a rel="Exploration" href="https://github.com/BCDevExchange/docs/blob/master/discussion/projectstates.md"><img alt="Being designed and built, but in the lab. May change, disappear, or be buggy." style="border-width:0" src="http://bcdevexchange.org/badge/2.svg" title="Being designed and built, but in the lab. May change, disappear, or be buggy." /></a>

The [BCDevExchange website](http://bcdevexchange.org/) is the public facing site for the BC Developers' Exchange - an experiment in tech innovation and collaboration.

*We are open to pull requests!  See our [contributing guide](https://github.com/BCDevExchange/BCDevExchange-app/blob/master/CONTRIBUTING.md) for the details.*

## MEAN Stack##
This web app is built on the MEAN stack:

-  AngularJS
-  Bootstrap
-  NodeJS
-  MongoDB
-  nginx

The app has been retrofitted with [Yeoman](http://yeoman.io/) [angular-fullstack generator](https://github.com/DaftMonk/generator-angular-fullstack).

## Getting Started ##

You'll need [MongoDB](http://www.mongodb.org/), [NodeJS](http://nodejs.org/), and [Git](http://git-scm.com/downloads). Clone this repo from GitHub, change directory to the repo root.

1. Run `npm install`.
2. Install [Grunt](http://gruntjs.com) for the command line via `npm install -g grunt-cli`.
3. Run `grunt serve` to start a Node server.  Defaults to [localhost:9000](http://localhost:000).

### Grunt
We also use [Grunt](http://gruntjs.com) to automate some of the development process.  Some notable tasks:

```
grunt serve
```
Launches site in development environment. No client-side optimization (js uglification etc) is performed to facilitate debugging.

```
grunt serve:debug
```

Enables Node debugger and launches node-inspector for server-side debugging. Node-inspector has been configured to disable source code discovery by default to speedup loading. Only executed code is available to Node-inspector. Therefore in order to set a breakpoint in a source file, you have to hit some web page that requires the source file first, then reload node-inspector in browser.

```
grunt serve:dist
```
Builds and launches site in production environment. Client-side optimization is performed as part of the build process.

```
grunt serve:dist-nobuild
```
Launches in production environment without build. 

```
grunt build
```
Builds production environment without launching the site. 

### Gulp

We use [Gulp](http://gulpjs.com) to ensure that each appropriate file in the repo has a license file attached to it.  These appear in the header of each appropriate file.  To check if the license is on every appropriate file, run

```
gulp
```

To automatically update/insert license, use:

```
gulp --update
```

## Running Tests ##

BCDevExchange currently uses [Protractor](https://angular.github.io/protractor/) for end-to-end testing.  To run the tests:

1. Start the `webdriver-manager` with `webdriver-manager start`.
2. Change to the `test/` directory from the repo root.
3. Run `protractor` to execute the tests.  You may need to install Protractor globally with `npm install -g protractor`.

## Server Deployment ##

You'll need a Linux server with:

- [nginx](http://nginx.org/)
- [NodeJS via N](https://github.com/tj/n) Use version 0.12.x
- [MongoDB](http://www.mongodb.org/)
- [Bind as a local DNS cache](https://www.digitalocean.com/community/tutorials/how-to-configure-bind-as-a-caching-or-forwarding-dns-server-on-ubuntu-14-04)

### First time setup

Install [forever](https://www.npmjs.com/package/forever) globally using

```
sudo npm install -g forever
```
Next, set up the repo

```
git clone --branch <master or discovery> git://github.com/BCDevExchange/BCDevExchange-app.git
cd BCDevExchange
npm install --production
chmod +x foreverme.sh
```
You'll want to create a local configuration file in config called:

`./config/local.json`

Starting the NodeJS server in forever mode on bootup the rc.local way:

```
sudo -e /etc/rc.local
```

then add to the bottom:

```
sudo -u bitnami /bin/bash /home/bitnami/apps/lab/BCDevExchange-app/foreverme.sh
```

Stdout, stderr and forever logs are here:

```
<path to app root>/log/
```

Following regular nginx installation and feel free to use the sample configs are provided in under:

`/config/nginx`

Following regular MongoDB installation and create new DBs and user accounts.  These names, usernames and passwords must be configured in your:

`/config/local.conf`

### Updating a deployment

Navigate to the app root (e.g. `/home/bitnami/apps/lab/BCDevExchange-app/`), then

```
git pull
npm install --production
forever list
forever restart <pid>
```

Where `<pid>` is the process ID of the environment you want to restart.

### Installing or Upgrading NodeJS via N

First you'll need N installed:

```
sudo npm cache clean -f
sudo npm install -g n
sudo n stable
```

Typically, you'll upgrade to latest stable:

```
sudo n stable
```

Test you have the right version now:

```
node -v
```

Then restart forever processes, post-install:

```
forever list
forever restart <pid>
```

Where `<pid>` is the process ID of the environment you want to restart.

## Optional Server Setup

### Google Analytics API

This is for setting up access to the Google Analytics API.  Those who do not have access to BCDevExchange's Google Analytics account can skip this step.  The site will function without Google Analytics set up.

1. Log into the Google account that has access to BCDevExchange's Google Analytics.

2. In the [Developers Console](https://console.developers.google.com), create a new project.

3. Under "APIs & auth", go to "APIs".  Search for the "Analytics API" and enable it.

4. Next go to "Credentials".  Create a new Client ID.  Make sure to select "Service Account" and for the key type select "P12 Key".  This will automatically download a `.p12` file to your computer, and the Developers Console will provide you with a password to access it (by default it should be "notasecret").

5. Make a note of the "Email address" field under your new "Service account".  It should look like `XXXX@developer.gserviceaccount.com`.

6. The `.p12` file needs to be converted to a `.pem` file.  Run the following command where your `.p12` file is located:

    ```
    openssl pkcs12 -in XXXXX.p12 -nocerts -nodes -out XXXXX.pem
    ```

    You will be prompted for a password.  By default it should be "notasecret".

7. Add your `developer.gserviceaccount.com` email to the Google Analytics account with "Read & Analyze" access.

8. Get the View ID from Google Analytics.  This is found in the "Admin" section at the top, under the "View" category in "View Settings".

9. Lastly the configuration files need to be updated.  Update `local.json` inside `/config`.  An example is provided below:

```
"google_analytics": {
    "api_email": "your-developer-gservice-email@developer.gserviceaccount.com",
    "analytics_view_id": "your-view-id",
    "key_file": "/path/to/the/pem/file/key.pem"
}
```

## Server Sizing ##
We've benchmarked performance for this site as it was running on a Microsoft Azure Standard D1 (One Core) 4 GB RAM VM using a [Bitnami packaged Ubuntu VM](https://bitnami.com/stack/mean).

Static file serving (all Ngnix): [4000 req/sec](http://loader.io/reports/7940cbcd4747e7eb202861f55e277839/results/90215bf18a137874d9fbc7cf9ca272ea)

Dynamic resource serving (Nginx + NodeJS): [100 req/sec < 500ms](http://ldr.io/19D41CW)

## License


```
     Copyright 2015 Province of British Columbia

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
```

----------
###### BCDevExchange Search Tags ######
BCDevExchange-Project
