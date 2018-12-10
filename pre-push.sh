#!/bin/bash
SCRIPT_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)
docker build -t wellfelix/satellite $SCRIPT_PATH/satellite
docker push wellfelix/satellite
docker build -t wellfelix/simple-haproxy $SCRIPT_PATH/haproxy
docker push wellfelix/simple-haproxy