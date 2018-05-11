#!/bin/sh
if [ ! -e config/config.json ]
then
  echo "Creating default config.json"
  cp config_base/config.json config/config.json
fi
if [ ! -e config/cert.pfx ]
then
  echo "Copying dummy cert.pfx"
  cp config_base/cert.pfx config/cert.pfx
fi
if [ ! -e config/uwca.pem ]
then
  echo "Coping UWCA Cert"
  cp config_base/uwca.pem config/uwca.pem
fi