#!/bin/bash

PIDFILE=run/fessbox.pid
NODEPATH=run/node_fessbox
echo kill `cat $PIDFILE`
kill `cat $PIDFILE`
#$NODEPATH index.js >> log/app.log 2>> log/debug.log &
$NODEPATH index.js >> log/app.log 2>> log/debug.log &
echo $! > $PIDFILE
