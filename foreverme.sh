#!/bin/bash
cwd=$(pwd)
APPLICATION_PATH=$cwd"/server.js"
LOG=$cwd"/log/forever.log"
STDOUT=$cwd"/log/stdout.log"
STDERR=$cwd"/log/stderr.log"
MIN_UPTIME="5000"
SPIN_SLEEP_TIME="2000"

export NODE_ENV=production
export NODE_CONFIG_DIR=$cwd"/config"

forever \
      -a \
	  -v \
      -l $LOG \
	  -o $STDOUT \
	  -e $STDERR \
      --minUptime $MIN_UPTIME \
      --spinSleepTime $SPIN_SLEEP_TIME \
      start $APPLICATION_PATH