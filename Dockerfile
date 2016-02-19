# Building a docker image from this Dockerfile with just the source code in context 
# is not good enough to create a fully functioning site. 
# /config/local.json must be supplied prior to docker build. In addition,
# mongodb data should be imported from an existing web site to reproduce end result.
FROM node:0.12.10
RUN mkdir -p /usr/src/app /data/db
WORKDIR /usr/src/app

# Install MongoDB
RUN apt-key adv --keyserver keyserver.ubuntu.com --recv 7F0CEB10
RUN echo 'deb http://downloads-distro.mongodb.org/repo/debian-sysvinit dist 10gen' | tee /etc/apt/sources.list.d/mongodb.list
RUN apt-get update && apt-get install -y adduser mongodb-org-server mongodb-org-shell
VOLUME /data/db

# Build app
RUN npm upgrade -g npm && npm install -g bower@1.4.1 grunt-cli@0.1.3
COPY . /usr/src/app
RUN npm install && bower install ; grunt build

EXPOSE 8000
CMD mongod & npm start
