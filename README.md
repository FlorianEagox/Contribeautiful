
# ![Logo](./src/assets/contribeautiful.svg) Contribeautiful

A vue & express webapp to generate custom GitHub contribution history!

![Project Status: Done](https://img.shields.io/badge/Project%20Status-Done-limegreen)
## Running live at
https://sethpainter.com/contribeautiful
# TODO

## Definitely
- ~~REDO THAT GOD AWFUL DESIGN~~
- ~~User prompts of completed, error etc~~
- ~~Storing the last commit in the DB so we don't clone a repo with things the app didn't create~~
- ~~Revoke authorization and delete data~~
- Tooltip of the date you're drawing on
- ~~Calendar stops at Dec 31st~~
- Switch to ES6 modules for the backend instead of CommonJS
## Possible
- ~~Edit none-destructively: check for commits already made that day and not commit if we don't need to~~
- ~~Mobile friendly UI? (Meh, probably not cause who would use this on mobile???)~~
- Automatically Delete the repo from the Github (NO FOR NOW FOR SECURITY REASONS)
- Import an image as a 52x7 github contribution history image
- graph of current year starts with the current date of last year and goes to current date
- Delete individual years of history (impossible for now)
- ~~Better click detection / drawing tools~~
- A fill bucket?
## Project setup
```
npm i
```

## Debugging the Frontend
```
npm run serve
```

## Building the Frontend
```
npm run build
```

## Running the server
```
npm run server
```
