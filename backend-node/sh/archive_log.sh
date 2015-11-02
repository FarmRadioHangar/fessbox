#!/bin/bash

DATE=`date +%Y%m%d`
FILENAME=$1-$DATE

cp $1 $FILENAME
truncate --size=0 $1
