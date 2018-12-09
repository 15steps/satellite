DOCKERFILE_PATH=$(cd "$(dirname "${BASH_SOURCE[0]}")" > /dev/null && pwd)
docker build -t wellfelix/satellite $DOCKERFILE_PATH
docker push wellfelix/satellite