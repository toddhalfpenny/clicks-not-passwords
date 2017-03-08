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

- Refresh aliases list without restart
- Alias management (addition, updating)
- Error reporting
- Toasts for notifications