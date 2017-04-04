# Clicks Not Passwords

- Download or clone
- `cd clicks-not-passwords`
- start with the followin
```
npm start
```

If you want to run in the background, starting from the command line you can use something like this (on Mac and Linux only I think);
```
nohup npm start &
```

Installable versions for Linux, Mac, Win etc to follow... along with more docs.

## Creating an installable app

Installers are created with the [Electron Builder](https://github.com/electron-userland/electron-builder/) project, and at the moment there is only a Linux entry in it. But you can add further for mac/win and then create an installable app with the following.

If you do the above, or make any nice changes then please raise a PR.


```
npm run dist
```

## Deps

- You need to have the SalesforceDX CLI installed
- Any aliases that you configure through the SalesforceDX CLI should appear

## Roadmap

* Alias management (updating, further info)
* Error reporting ([Crash reporting to remote server](https://electron.atom.io/docs/api/crash-reporter/))
* Settings
  * Error reporting on/off
  * Notifications on/off


## Dev

The project is using Ionic (v2) for it's GUI (it's the nuts, thanks all) and this is all in the `src` dir... it's TypeScript, and I'm new to it, so please be gentle. When in the dir you can run `ionic serve` to spin up the webpack tasks for SCSS processing, TS hinting and building etc.