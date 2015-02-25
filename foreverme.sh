#!/bin/bash

APPLICATION_PATH="/home/bcdevteam/apps/bcdevexchange/server.js"
WORKING_DIR="/home/bcdevteam/apps/bcdevexchange"
PIDFILE="/var/run/bcdevexchange.pid"
LOG="/var/log/bcdevexchange-forever.log"
STDOUT="/var/log/bcdevexchange-stdout.log"
STDERR="/var/log/bcdevexchange-stderr.log"
MIN_UPTIME="5000"
SPIN_SLEEP_TIME="2000"

export NODE_ENV=production
export NODE_CONFIG_DIR="/home/bcdevteam/apps/bcdevexchange/config"

forever \
      --pidFile $PIDFILE \
      -a \
	  -v \
      -l $LOG \
	  -o $STDOUT \
	  -e $STDERR \
      --minUptime $MIN_UPTIME \
      --spinSleepTime $SPIN_SLEEP_TIME \
      start $APPLICATION_PATH