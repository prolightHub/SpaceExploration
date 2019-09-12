# SpaceExploration

**Setting up...**

Create a new Node Js Cordova application and clone this repository into that.
Just follow these commands to do that:

Setup:
```
Cordova create SpaceExploration
cd SpaceExploration
rmdir /S /Q .\www
mkdir www
git clone https://github.com/prolightHub/SpaceExploration.git .\www
git clone --recurse-submodules https://github.com/prolightHub/CartesianSystemLite .\www\node_modules\cartesian-system-lite
```

Running:
```
cordova platform add browser
cordova run browser
```









A windows .bat script to do it for you!

```
@echo off

call echo ================================================
call echo Creating...
call echo ================================================

call rmdir /s /q SpaceExploration
call Cordova create SpaceExploration
call cd SpaceExploration

call rmdir /S /Q .\www
call mkdir www
call git clone https://github.com/prolightHub/SpaceExploration.git .\www
call echo Getting submodules
call git clone --recurse-submodules https://github.com/prolightHub/CartesianSystemLite .\www\node_modules\cartesian-system-lite

call echo ================================================
call echo Running...
call echo ================================================

call cordova platform add browser
call cordova run browser
call cd ..
```