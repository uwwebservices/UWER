#!/bin/sh
if [ "$HEROKU_ENV" = "staging" ]; then
  echo "setting up heroku environment"
  cp config/config.json.example config/config.json
  touch config/cert.pfx # make a dummy file for testing
fi
