# About
Out of the box this project has support for `video` and `audio` tags in all sites with the following features.
 - Play/Pause: play and pause it's playback.
 - Stop: pause the playback and go back to the start.
 - Seek: advance/go back 10 seconds.
 - Set position: indicate the desired position of playback.
 - Volume: control the medias pertinent volume.
 - Raise: show the tab that is playing the media.
 - Quit: close the tab that is playing the media.
 - Cover art: we use the sites domain to search for it's logo.
 - Looping: toggle between default playback or looping the current track.

## Providers

By extending this projects base classes it is possible to modify the default interaction with each site for specific sites. We call them providers. 

If you would like to contribute with a provider see the [how to](manual/how_to.html) manual.

## Support

| Support   | default     | YouTube           | YouTube Music | SoundCloud    | Netflix          | Spotify       | Tidal         |
|-----------|-------------|-------------------|---------------|---------------|------------------|---------------|---------------|
| Cover Art | domain logo | video's thumbnail | song's cover  | song's cover  | netflix logo     | song's cover  | song's cover  |
| Title     | page title  | video's title     | song's title  | song's title  | movie/show title | song's title  | song's title  |
| Artists   | page host   | video's owner     | song's artist | song's artist | movie/show       | song's artist | song's artist |
| PlayPause | yes         | yes               | yes           | yes           | yes              | yes           | yes           |
| Stop      | yes         | yes               | yes           | yes           | yes              | yes           | yes           |
| Next      | no          | yes               | yes           | yes           | yes              | yes           | yes           |
| Previous  | no          | yes               | yes           | yes           | yes              | yes           | yes           |
| Rate      | no          | yes               | no            | no            | no               | no            | no            |
| Volume    | yes(no UI)  | yes               | yes           | yes           | yes              | yes           | yes           |
| Shuffle   | no          | yes (if present)  | yes           | yes           | no               | yes           | yes           |
| Loop      | TRACK/NONE  | full              | full          | full          | no               | full          | full          |

### Loop
Full loop supports cycling between Playlist Loop, Track Loop, and None


