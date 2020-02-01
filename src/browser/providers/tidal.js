/**
 *
 * This file adds support for the Tidal web player
 *
 * by extending and overriding the classes {@link Page},
 * {@link Playback}, and {@link Player}.
 * we can define how we'll interact with tidal's site
 *
 */

class TidalPlayer extends Player {
    getTitle() {
        const elm = this.page.elements.title;
        return elm ? elm.textContent : super.getTitle();
    }

    getArtists() {
        const elm = this.page.elements.artist;
        return elm ? [elm.textContent] : super.getArtists();
    }

    getCover() {
        const elm = this.page.elements.cover;
        return elm ? elm.src : super.getCover();
    }

    isPlaying() {
        const elm = this.page.playback.controls.play;
        return elm ? elm.title === 'Pause' : super.isPlaying();
    }

    getLength() {
        const duration = this.page.elements.duration;
        if (duration) {
            const [min, sec] = duration.textContent.split(':');
            return (parseInt(min) * 60 + parseInt(sec)) * 1e6;
        }
        return super.getLength();
    }

    getPosition() {
        const currentTime = this.page.elements.currentTime;
        if (currentTime) {
            const [min, sec] = currentTime.textContent.split(':');
            return (parseInt(min) * 60 + parseInt(sec)) * 1e6;
        }
        return super.getLength();
    }

    getUrl() {
        const link = this.page.elements.url;
        return link ? link.href : super.getUrl();
    }
}

Player = TidalPlayer;

class TidalPlayback extends Playback {
    canGoNext() {
        return !!this.controls.next;
    }

    next() {
        const elm = this.controls.next;
        (elm && elm.click()) || super.next();
    }

    canGoPrevious() {
        return !!this.controls.prev;
    }

    previous() {
        (this.controls.prev && this.controls.prev.click()) || super.previous();
    }

    play() {
        (!this.activePlayer.isPlaying() &&
            this.controls.play &&
            this.controls.play.click()) ||
        super.play();
    }

    pause() {
        (this.activePlayer.isPlaying() &&
            this.controls.play &&
            this.controls.play.click()) ||
        super.pause();
    }

    playPause() {
        (this.controls.play && this.controls.play.click()) || super.playPause();
    }

    setShuffle(isShuffle) {
        if (this.controls.shuffle) {
            if (
                (!this.isShuffle() && isShuffle) ||
                (this.isShuffle() && !isShuffle)
            ) {
                this.controls.shuffle.click();
            }
        }
    }

    isShuffle() {
        if (this.controls.shuffle) {
            const classes = Array.from(this.controls.shuffle.classList);
            return classes.some(c => c.startsWith('active'));
        } else {
            return super.isShuffle();
        }
    }

    getLoopStatus() {
        if (this.controls.repeat) {
            const classes = Array.from(this.controls.repeat.classList);
            if (classes.some(c => c.startsWith('once'))) {
                return LoopStatus.TRACK;
            } else if (classes.some(c => c.startsWith('all'))) {
                return LoopStatus.PLAYLIST;
            } else {
                return LoopStatus.NONE;
            }
        } else {
            return super.getLoopStatus();
        }
    }

    setLoopStatus(status) {
        if (this.controls.repeat) this.controls.repeat.click();
        else super.setLoopStatus(status);
    }

    setVolume(volume) {
        super.setVolume(volume);
        if (this.controls.volumeProgress) {
            this.controls.volumeProgress.value = volume * 100;
            this.controls.volumeProgress.style =
                '--val:' + volume * 100 + '; --max:100; --min:0;';
        }
    }

    getVolume() {
        if (this.controls.volumeProgress) {
            return parseInt(this.controls.volumeProgress.value, 10) / 100;
        }
        return super.getVolume();
    }

    setRate() {
        // disabled
    }
}

Playback = TidalPlayback;

window.addEventListener('mpris2-setup', function () {
    /*
     * Since tidal is loaded dynamically, we need to wait until the playback controls are added
     * to the DOM before we can get the elements.
     *
     * We create an observer to monitor the added nodes, and set the playback controls when the
     * player is loaded.
     *
     */
    const playerObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(n => {
                if (n.className && n.className.startsWith('footerPlayer')) {
                    initPage();
                    playerObserver.disconnect();
                }
            });
        });
    });

    const initPage = () => {
        const BUTTONS_CONTAINER = 'div[class*="playbackControls"]';

        page.playback.controls = {
            shuffle: document.querySelector(
                BUTTONS_CONTAINER + ' button:nth-child(1)'
            ),
            prev: document.querySelector(
                BUTTONS_CONTAINER + ' button:nth-child(2)'
            ),
            play: document.querySelector(
                BUTTONS_CONTAINER + ' button:nth-child(3)'
            ),
            next: document.querySelector(
                BUTTONS_CONTAINER + ' button:nth-child(4)'
            ),
            volumeProgress: document.querySelector(
                'div[class*="volumeSlider"] input'
            )
        };

        // We also reset the repeat button, since this might change
        const setRepeatElement = () => {
            page.playback.controls.repeat = document.querySelector(
                BUTTONS_CONTAINER + ' button:nth-child(5)'
            );
            // We might not be playing from a playlist, in this case the repeat button is
            // replaced with a block button, which we dont want do click.
            if (
                page.playback.controls.repeat.className.startsWith(
                    'blockButton'
                )
            ) {
                page.playback.controls.repeat = null;
            }
        };

        const setPageElements = () => {
            page.elements = {
                title: document.querySelector(
                    'span[class*="mediaItemTitle"]'
                ),
                artist: document.querySelector(
                    'div[class*="mediaArtists"]'
                ),
                cover: document.querySelector(
                    'figure[class*="mediaImagery"] img'
                ),
                duration: document.querySelector('time[class*="duration"]'),
                currentTime: document.querySelector(
                    'time[class*="currentTime"]'
                ),
                url: document.querySelector('div[class*="playingFrom"] a')
            };
        };

        setPageElements();
        setRepeatElement();

        const observer = new MutationObserver(() => {
            setPageElements();
            setRepeatElement();
            page.host.change();
        });

        // We observe all relevant elements to see if we need to update.
        [
            ...Object.values(page.playback.controls),
            ...Object.values(page.elements)
        ].forEach(control => {
            observer.observe(control, {
                attributes: true,
                childList: true,
                subtree: true
            });
        });

        page.playback.controls.shuffle.addEventListener('click', () =>
            page.host.change()
        );
        page.playback.controls.repeat.addEventListener('click', () =>
            page.host.change()
        );
    };

    playerObserver.observe(document, {
        childList: true,
        subtree: true
    });
});
