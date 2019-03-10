# browser-mpris2
Implements the MPRIS2 interface for Chrome and Firefox.

Currently, all sites should be supported with reduced capabilities (play, pause, stop, volume, seek, cover art).

And the following sites are supported with almost all of the capabilities MPRIS2 allows:
* [YouTube](https://youtube.com)
* [SoundCloud](https://soundcloud.com)
* [Netflix](https://netflix.com) - Coming Soon

Pull requests are welcome.

### How it looks (linux mint)
![youtube soundcloud and bandcamp players](screenshot.png)


## Installation (for Chrome)
Clone this repo:
```text
git clone https://github.com/Lt-Mayonesa/browser-mpris2
```
Then, in Chrome, go to `Tools > Extensions` (or `chrome://extensions`), enable `Developer mode` and `Load unpacked extension...` with the root of this repo.

Once the extension loaded copy the extension ID (ie: `pbipjpimbmchphdddpkimpegkgnbepdj`).

Next, place [chrome-mpris2](native/chrome-mpris2) somewhere in your `$PATH`.

ie: (from the root of the repo)
```text
ln -s $PWD/native/chrome-mpris2 ~/bin/chrome-mpris2
```

And run [install-chrome.py](native/install-chrome.py) giving it the extension ID and optionally the path (not just the directory) of your just-installed chrome-mpris2 if you installed elsewhere.  This will check that you have all the dependencies and tell Chrome about chrome-mpris2 (so that the plugin can use it).
```text
./install-chrome.py EXTENSION_ID [PATH]
```

Reload the extension from the Extensions page.

Profit

## Powers
If on GNOME or similar you should be able to take advantage of your new powers immediately.  Otherwise, you can use something like [playerctl](https://github.com/acrisci/playerctl), perhaps bind it to a key or `XF86AudioPlay` and the like if your keyboard has them.

## Similar Projects
* [plasma-browser-integration](https://github.com/KDE/plasma-browser-integration)
  Nothing to envy them now
* [shwsh/web-mpris2](https://github.com/shwsh/web-mpris2)
  A port of this extension to Tampermonkey/Greasemonkey (and WebSockets).

## TODO
 - Netflis Provider
 - Tests (i started playing with a custom made testin framework, probably moving them to jest due to time, which is money)
