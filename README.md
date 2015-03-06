# BCDevExchange Organization Web Site #
<a rel="discovery" href="https://github.com/BCDevExchange/docs/wiki/Project-States"><img alt="Being designed and built, but in the lab. May change, disappear, or be buggy." style="border-width:0" src="https://img.shields.io/badge/BCDevExchange-Discovery-yellow.svg" title="Being designed and built, but in the lab. May change, disappear, or be buggy." /></a>


The organization page for the BCDevExchange experiment.  This is a browser only custom web app that uses:

-  AngularJS 
-  Bootstrap

This app does not call any APIs, yet...

*We are open to pull requests! 
Just check out our [CONTIBUTING.md](https://github.com/BCDevExchange/BCDevExchange-app/blob/master/CONTRIBUTING.md) for the details.*

## Development ##

You'll need [NodeJS](http://nodejs.org/) and [GIT](http://git-scm.com/downloads). Clone this repo from GitHub, change directory to the repo root and:

`$ npm install `

We use [WebStorm](https://www.jetbrains.com/webstorm/download/) for development.  

## Server Deployment ##

First time setup, you'll need, [nginx](http://nginx.org/) [NodeJS](http://nodejs.org/) and [GIT](http://git-scm.com/downloads).

For the up to date live version:

`$ npm install --save git://github.com/BCDevExchange/BCDevExchange-app.git#master`

Or for the Discovery version:

`$ npm install --save git://github.com/BCDevExchange/BCDevExchange-app.git#discovery`

Or if you needed a special release:

`$ npm install --save git://github.com/BCDevExchange/BCDevExchange-app.git#discovery`

Once setup and looking for new update to latest, use:
`$ npm update`

NGinx sample configs are provided in under 

- /config/nginx

## Server Sizing ##
Performance for a Microsoft Azure Standard D1 (One Core) 4 GB RAM VM using a [Bitnami packaged Ubuntu VM] (https://bitnami.com/stack/mean).

Static file serving (all Ngnix): 4000 req/sec

<div style="width: 600px;">
<iframe width='600' height='300' frameborder='0' src='//share.loader.io/reports/7940cbcd4747e7eb202861f55e277839/widget/results/238a6e401577ce80d5ed7e74e3fee577'></iframe>
<div style="width: 100%; text-align: right;">
<a href="http://loader.io/reports/7940cbcd4747e7eb202861f55e277839/results/238a6e401577ce80d5ed7e74e3fee577" target="_blank" style="padding: 0 10px 10px 0; font-family: Arial, 'Helvetica Neue', Helvetica, sans-serif; font-size: 14px;">View on loader.io</a>
</div></div>


Dynamic resource serving (NodeJS + MongoDB): TODO

## License

Apache 2.0

----------
###### BCDevExchange Search Tags ######
BCDevExchange-Project, BCDevExchange-Resource, BCDevExchange-Discovery
