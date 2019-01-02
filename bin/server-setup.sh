#!/bin/sh
# make the config directory if it doesn't exist
mkdir -p config

if [ ! -e config/cert.pfx ]
then
  echo "Copying dummy cert.pfx"
  cp config_base/cert.pfx config/cert.pfx
fi
if [ ! -e config/passphrase.key ]
then
  echo "Copying dummy passphrase.key"
  cp config_base/passphrase.key config/passphrase.key 
fi
if [ ! -e config/incommon.pem ]
then
  echo "Coping Incommon Cert"
  cp config_base/incommon.pem config/incommon.pem
fi
if [ ! -e config/spkey.pem ]
then
  echo "Coping SP Key"
  cp config_base/incommon.pem config/spkey.pem
fi