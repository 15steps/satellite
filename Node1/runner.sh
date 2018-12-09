#!/bin/bash

stack_name='devops'

case "$1"
in
    start)
        echo 'Deploying stack...'
        docker stack deploy --compose-file docker-compose.yml "$stack_name"
        ;;
    stop)
        echo 'Removing stack...'
        docker stack rm "$stack_name"
        ;;
    **)
        echo 'INVALID OPTION'
esac