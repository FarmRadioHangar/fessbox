#!/bin/bash

PIDFILE=run/fessbox.pid
NODEPATH=run/node_fessbox
echo kill `cat $PIDFILE`
kill `cat $PIDFILE`
#$NODEPATH index.js >> log/application.log 2>> log/debug.log &
$NODEPATH index.js >> log/debug.log 2>> log/debug.log &
echo $! > $PIDFILE
