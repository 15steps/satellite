PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)

docker build -t wellfelix/satellite $PATH/satellite
docker push wellfelix/satellite

docker build -t wellfelix/simple-haproxy $PATH/haproxy
docker push wellfelix/simple-haproxy