#!/bin/sh
if [ ! -e config/config.json ]
then
  echo "Creating default config.json"
  cp config/config.json.example config/config.json
fi
if [ ! -e config/cert.pfx ]
then
  echo "Creating dummy cert.pfx"
  touch config/cert.pfx
fi