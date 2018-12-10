#!/bin/bash

#check if node is installed
if which node > /dev/null
then
    #check if a parameter was passed
    if [ -z $1 ] 
    then
    echo "You need pass a url as parameter"
    exit 1
    fi

    #check if artillery is installed, if not, install
    if ! which artillery > /dev/null
    then
        echo "installing artillery..."
        npm install artillery -g
    fi

    artillery quick --count 900 -n 100 $1
else
    echo "You need node.js installed to run this script."
    exit 1
fi
