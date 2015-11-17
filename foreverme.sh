#!/bin/bash
cwd=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
APPLICATION_PATH=$cwd"/dist/server/app.js"
LOG=$cwd"/log/forever.log"
STDOUT=$cwd"/log/stdout.log"
STDERR=$cwd"/log/stderr.log"
MIN_UPTIME="5000"
SPIN_SLEEP_TIME="2000"
UNAME="$1"

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
      start --uid $UNAME $APPLICATION_PATH
