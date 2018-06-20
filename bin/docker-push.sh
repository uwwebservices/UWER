#! /bin/bash
# Push only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Push only if we're testing the master or devlop branch
  if [ "$TRAVIS_BRANCH" == "master" ] || [ "$TRAVIS_BRANCH" == "develop" ]; then
    # This is needed to login on AWS and push the image on ECR
    # Change it accordingly to your docker repo
    pip install --user awscli
    export PATH=$PATH:$HOME/.local/bin
    eval $(aws ecr get-login --no-include-email --region $AWS_DEFAULT_REGION)

    case "$TRAVIS_BRANCH" in
      "master") TAG="latest" ;;
      "devlop") TAG="devlop" ;;
    esac

    # Build and push
    docker build -t $IMAGE_NAME .
    echo "Pushing $IMAGE_NAME:$TAG"
    docker tag $IMAGE_NAME:latest "$REMOTE_IMAGE_URL:$TAG"
    docker push "$REMOTE_IMAGE_URL:$TAG"
    echo "Pushed $IMAGE_NAME:$TAG"
  else
    echo "Skipping deploy because branch is not 'master'"
  fi
else
  echo "Skipping deploy because it's a pull request"
fi