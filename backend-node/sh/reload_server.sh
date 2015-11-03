#!/bin/bash

PIDFILE=run/fessbox.pid
NODEJS=run/node_fessbox
kill `cat $PIDFILE`
$NODEJS index.js >> log/application.log 2>> log/debug.log &
echo $! > $PIDFILE
