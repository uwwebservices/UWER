#! /bin/bash
# Deploy only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Deploy only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "Deploying..."
    echo "Branch: $TRAVIS_BRANCH, TASK: $TASK_DEFINITION, Cluster: $CLUSTER, Service: $SERVICE, Image: $REMOTE_IMAGE_URL:latest"

    # Use this for deploying to a service
    #bash ./bin/ecs-deploy.sh -c $CLUSTER -n $SERVICE -i $REMOTE_IMAGE_URL:latest --max-definitions 5 -v
    
    # use this to just update the task definition (manual deploy)
    bash ./bin/ecs-deploy.sh -c $CLUSTER -d $TASK_DEFINITION -i $REMOTE_IMAGE_URL:latest --max-definitions 5
    
  else
    echo "Skipping deploy because it's not an allowed branch"
  fi
else
  echo "Skipping deploy because it's a PR"
fi