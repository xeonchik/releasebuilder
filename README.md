# ReleaseBuilder

Branch management tool that allows to manage multiple repositories at the same time. It was made for release-branch building, when you need to prepare new version from many many branches for single tasks and when they distributed in multiple repositories.
 
 Key features in development at this moment, such as
 
 * Searching in all project repositories (in commit comments, branch names)
 * Creation release branches in the set of repositories
 * Preparing task list and task branches that's need to merge
 * Code review before merge
 * Auto-tag repositories


## Requirements

It's tested with environment

* Node.js v6.9.1+
* Bower 1.7.9
* Google Chrome 54+
* git binaries

## Installation

```sh
$ npm install
$ bower install
```

## Get it started!

```sh
$ npm start
```

then open http://localhost:3000