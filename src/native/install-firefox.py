#!/usr/bin/env python3

import json
import os
import sys

MESSAGE_HOSTS = os.path.expanduser("~/.mozilla/native-messaging-hosts")


def die(msg):
    print(msg, file=sys.stderr)
    sys.exit(1)


def main(args):
    if len(args) < 1:
        die("You must provide at least the extension ID")
    elif len(args) < 2:
        args.append(os.path.expanduser("~/bin/chrome-mpris2"))

    ext_id = args[0]
    prog_path = args[1]

    # Chrome's extension IDs are in hexadecimal but using a-p, referred
    # internally as "mpdecimal".            https://stackoverflow.com/a/2050916
    # if not all(97 <= ord(c) <= 112 for c in ext_id):
    #     die("Not valid extension ID")

    # Check that python-gobject is available.  This is done because it's hard
    # to see if chrome-mpris2 fails with an import error; you'd need to check
    # the X log.  Of course it's possible that any dependencies met during
    # installation are unavailable later but what can you do.
    try:
        from gi.repository import GLib, Gio
    except ImportError:
        die("Required dependency python-gobject not found")

    # Before that, Gio couldn't publish DBus objects (introspection bug)
    if (GLib.MAJOR_VERSION, GLib.MINOR_VERSION) < (2, 46):
        die("Your GLib version is too old")

    manifest = {
        "name": "org.mpris.browser_host.debug",
        "description": "A DBus service",
        "path": prog_path,
        "type": "stdio",
        "allowed_extensions": [
            ext_id,
        ]
    }
    manifest_path = os.path.join(MESSAGE_HOSTS, "org.mpris.browser_host.debug.json")

    os.makedirs(MESSAGE_HOSTS, exist_ok=True)
    with open(manifest_path, "w") as f:
        json.dump(manifest, f)


if __name__ == "__main__":
    main(sys.argv[1:])
