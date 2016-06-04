#!/bin/bash

#ast_pid=`cat /var/run/asterisk/asterisk.pid`
#fess_pid=`cat /home/fri/fessbox/backend-node/run/fessbox.pid`
ast_port=5038
fess_port=19998
is_working=false

/usr/local/bin/gpio -g mode 17 output

while true
do
	if ! $is_working; then
		/usr/local/bin/gpio -g write 17 1
		is_working=true
		echo 1 >> /tmp/led
		sleep 0.2
	fi

	if ! /usr/bin/lsof -Pi :$ast_port -sTCP:LISTEN -t >/dev/null; then
		/usr/local/bin/gpio -g write 17 0
		is_working=false
		echo ast 0 >> /tmp/led
	fi

	if ! /usr/bin/lsof -Pi :$fess_port -sTCP:LISTEN -t >/dev/null; then
		/usr/local/bin/gpio -g write 17 0
		is_working=false
		echo fess 0 >> /tmp/led
	fi
	sleep 1
done

