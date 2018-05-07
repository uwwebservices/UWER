#!/bin/bash

# scripts used by travisCI to prepare the test bed
cp config/config.json.example config/config.json
touch config/cert.pfx # make a dummy file for testing