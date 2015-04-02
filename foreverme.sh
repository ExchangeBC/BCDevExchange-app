# Copyright 2015 Province of British Columbia

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

# http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and limitations under the License.

#!/bin/bash
cwd=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
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