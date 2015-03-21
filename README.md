# BCDevExchange Organization Web Site #
<a rel="Exploration" href="https://github.com/BCDevExchange/docs/blob/master/discussion/projectstates.md"><img alt="Being designed and built, but in the lab. May change, disappear, or be buggy." style="border-width:0" src="http://bcdevexchange.org/badge/2.svg" title="Being designed and built, but in the lab. May change, disappear, or be buggy." /></a>

The [BCDevExchange website](http://bcdevexchange.org/) is the public facing site for the BC Developers' Exchange - an experiment in tech innovation and collaboration.

*We are open to pull requests! 
See our [contributing guide](https://github.com/BCDevExchange/BCDevExchange-app/blob/master/CONTRIBUTING.md) for the details.*

## MEAN Stack##
This web app is built on the MEAN stack:

-  AngularJS 
-  Bootstrap
-  NodeJS
-  MongoDB
-  nginx

## Development ##

You'll need [MongoDB](http://www.mongodb.org/), [NodeJS](http://nodejs.org/), and [Git](http://git-scm.com/downloads). Clone this repo from GitHub, change directory to the repo root and:

`$ npm install `

We use [WebStorm](https://www.jetbrains.com/webstorm/download/) for development, but contributors are free to use any editor.  
## Server Deployment ##

First time setup, you'll need a Linux server with:

- [nginx](http://nginx.org/)
- [NodeJS via N](https://github.com/tj/n) Use version 0.12.x
- [MongoDB](http://www.mongodb.org/)
- [BIND9 as a local DNS cache](https://www.digitalocean.com/community/tutorials/how-to-configure-bind-as-a-caching-or-forwarding-dns-server-on-ubuntu-14-04)
```
git clone --branch <master or discovery> git://github.com/BCDevExchange/BCDevExchange-app.git
cd BCDevExchange
npm install
chmod +x foreverme.sh
```
You'll want to create a local configuration file in config called:

`./config/local.json`

Starting the NodeJS server in forever mode:

`./foreverme.sh`

Stdout, stderr and forever logs are here:

`log/`

Following regular nginx installation and feel free to use the sample configs are provided in under:

`/config/nginx`

Following regular MongoDB installation and create new DBs and user accounts.  These names, usernames and passwords must be configured in your:

`/config/local.conf`

Updating deployment:

```
git pull
npm install
forever restart <pid>
```
Use the forever commands to list, stop, restart the service.


## Server Sizing ##
We've benchmarked performance for this site as it was running on a Microsoft Azure Standard D1 (One Core) 4 GB RAM VM using a [Bitnami packaged Ubuntu VM] (https://bitnami.com/stack/mean).

Static file serving (all Ngnix): [4000 req/sec](http://loader.io/reports/7940cbcd4747e7eb202861f55e277839/results/90215bf18a137874d9fbc7cf9ca272ea)

Dynamic resource serving (NodeJS + MongoDB): TODO

## License

Apache 2.0. See our [license](LICENSE) for more details.

----------
###### BCDevExchange Search Tags ######
BCDevExchange-Project
