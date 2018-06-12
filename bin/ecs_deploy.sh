#! /bin/bash
# Deploy only if it's not a pull request
echo "DEPLOYING TO ECS!"
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  # Deploy only if we're testing the master branch
  if [ "$TRAVIS_BRANCH" == "master" ]; then
    echo "Deploying..."
    echo "Branch: $TRAVIS_BRANCH, TASK: $TASK_DEFINITION, Cluster: $CLUSTER, Service: $SERVICE, Image: $REMOTE_IMAGE_URL:latest"
    
    bash ./bin/ecs-deploy.sh -c $CLUSTER -n $SERVICE -i $REMOTE_IMAGE_URL:latest --max-definitions 5 -v
  else
    echo "Skipping deploy because it's not an allowed branch"
  fi
else
  echo "Skipping deploy because it's a PR"
fi