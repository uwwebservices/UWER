#! /bin/bash
# Deploy only if it's not a pull request
if [ -z "$TRAVIS_PULL_REQUEST" ] || [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
# Deploy only if we're testing the master branch
if [ "$TRAVIS_BRANCH" == "master" ]; then
echo "Deploying $TRAVIS_BRANCH on $TASK_DEFINITION"
./bin/ecs-deploy -c $TASK_DEFINITION -n $SERVICE -i $REMOTE_IMAGE_URL:$TRAVIS_BRANCH
else
echo "Skipping deploy because it's not an allowed branch"
fi
else
echo "Skipping deploy because it's a PR"
fi