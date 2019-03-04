/**
 * A class in charge of detecting new {@link HTMLMediaElement}s in current page
 *
 * @class
 */
class Page {
    constructor (port) {
        this.playback = new Playback(this);
        this.host = new Host(this.playback, port);
        /**
         * An array holding all {@link Player}s present in the page
         *
         * @type {Array.<Player>}
         */
        this.players = [];

        this._observer = new MutationObserver(m => this.onMutate(m));
    }

    registerPlayer (element) {
        // Ignore short sounds, they are most likely a chat notification sound
        // but still allow when undetermined (e.g. video stream)
        if (isNaN(element.duration) || (element.duration > 0 && element.duration < 5)) {
            return;
        }

        if (this.players.find(player => player.element === element)) {
            return;
        }

        let player = new Player(this.playback, this.host, element);

        this.players.push(player);

        if (!player.paused) {
            this.setActivePlayer(player);
        }
    }

    observeForMedia (document) {
        this._observer.observe(document, {
            childList: true,
            subtree: true
        });
    }

    onMutate (mutations) {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (typeof node.matches !== 'function' || typeof node.querySelectorAll !== 'function') {
                    return;
                }

                // first check whether the node itself is audio/video
                if (node.matches('video,audio')) {
                    this.registerPlayer(node);
                    return;
                }

                // if not, check whether any of its children are
                node.querySelectorAll('video,audio')
                  .forEach(player => this.registerPlayer(player));
            });
        });
    }

    /**
     *
     * @param {Player} player
     */
    setActivePlayer (player) {
        this.playback.setActivePlayer(player);
    }

    /**
     *
     * @returns {Player}
     */
    getActivePlayer () {
        return this.playback.activePlayer;
    }

}