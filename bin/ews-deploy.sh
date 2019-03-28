#! /bin/bash
# Deploy only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Deploy only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "master" ] || [ "$TRAVIS_BRANCH" == "develop" ]; then
    
    case "$TRAVIS_BRANCH" in
      "master") TAG="latest";TASK_DEF=$TASK_DEFINITION;SERVICE=$SERVICE ;;
      "develop") TAG="develop";TASK_DEF=$EVAL_TASK_DEFINITION;SERVICE=$EVAL_SERVICE ;;
    esac

    echo "Branch: $TRAVIS_BRANCH, TASK: $TASK_DEF, Cluster: $CLUSTER, Service: $SERVICE, Image: $REMOTE_IMAGE_URL:$TAG"

    # Use this for deploying to a service - max-definitions only works with a service
    bash ./bin/ecs-deploy.sh -c $CLUSTER -n $SERVICE -i $REMOTE_IMAGE_URL:$TAG --max-definitions 5 -v

    # use this to just update the task definition (manual deploy)
    #bash ./bin/ecs-deploy.sh -c $CLUSTER -d $TASK_DEF -i $REMOTE_IMAGE_URL:$TAG 

  else
    echo "Skipping deploy because it's not an allowed branch"
  fi
else
  echo "Skipping deploy because it's a PR"
fi