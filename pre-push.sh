#!/bin/bash
PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)
/usr/local/bin/docker build -t wellfelix/satellite $PATH/satellite
/usr/local/bin/docker push wellfelix/satellite
/usr/local/bin/docker build -t wellfelix/simple-haproxy $PATH/haproxy
/usr/local/bin/docker push wellfelix/simple-haproxy