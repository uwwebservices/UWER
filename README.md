# UW Event Registration (UWER)

## Build Status

master: [![Build Status](https://dev.azure.com/uwit-ews/WS/_apis/build/status/uwwebservices.idcard-webapp-poc?branchName=master)](https://dev.azure.com/uwit-ews/WS/_build/latest?definitionId=50&branchName=master)

develop: [![Build Status](https://dev.azure.com/uwit-ews/WS/_apis/build/status/uwwebservices.idcard-webapp-poc?branchName=develop)](https://dev.azure.com/uwit-ews/WS/_build/latest?definitionId=50&branchName=develop)

Documentation: [Client Wiki](https://wiki.cac.washington.edu/pages/viewpage.action?pageId=92391281)

## Beta Service Availability

UWIT is expoloring offering UWER as a service to UW departments/groups and is currently in a closed beta. See the [wiki](https://wiki.cac.washington.edu/pages/viewpage.action?pageId=92391281) if you would like to be involved in beta testing the offering, or use this repository to deploy your own instance (no support provided).


## Development

In order to develop with VSCode in containers, you should download the [Remote - Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension.

**To run locally**
1. Clone repo
2. Open repo in container, vscode should notify you asking if you want to open in the container.
3. Once open in the container run `npm install`, then `npm run dev`.

**To debug**
1. Run via Debug tab, use config `Run Script: dev` from `.vscode\launch.json`