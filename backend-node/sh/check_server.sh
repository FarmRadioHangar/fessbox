#!/bin/bash

#heartbeat
wget -q -O /dev/null --no-check-certificate https://triple-a:test22@thehangar.farmradio.org:669

PIDFILE=run/fessbox.pid
PID=`cat $PIDFILE`
NODEPATH=run/node_fessbox

if ! kill -0 $PID > /dev/null 2>&1; then
  $NODEPATH index.js >> log/application.log 2>> log/debug.log &
  echo $! > $PIDFILE
fi
