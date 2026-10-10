export class TimeController {

    constructor(options = {}) {

        /*
         * --------------------------------------------------
         * Timeline
         * --------------------------------------------------
         */

        this.frames = [];

        this.currentIndex = 0;

        this.currentTime = null;


        /*
         * --------------------------------------------------
         * Playback
         * --------------------------------------------------
         */

        this.playing = false;

        this.playbackSpeed =
            options.playbackSpeed ?? 1.0;


        /*
         * How many milliseconds pass between
         * visualization frames at 1x speed.
         *
         * ERA5 is normally 6-hourly, but this is only
         * visualization playback speed.
         */

        this.frameInterval =
            options.frameInterval ?? 750;


        this._timer = null;


        /*
         * --------------------------------------------------
         * Callbacks
         * --------------------------------------------------
         *
         * Anything interested in time changes can
         * subscribe here.
         *
         * Earth
         * graphs
         * anomaly visualization
         * UI
         * etc.
         */

        this._listeners = [];
    }


    /*
     * --------------------------------------------------
     * Set Timeline
     * --------------------------------------------------
     *
     * The controller only cares about temporal frames.
     *
     * It does NOT care which variable they represent.
     */

    setFrames(frames) {

        this.stop();


        if (!Array.isArray(frames)) {

            console.warn(
                "TimeController: frames must be an array."
            );

            this.frames = [];

            this.currentIndex = 0;

            this.currentTime = null;

            return;
        }


        this.frames =
            frames;


        this.currentIndex = 0;


        if (
            this.frames.length > 0
        ) {

            this.currentTime =
                this.frames[0].time;

        } else {

            this.currentTime =
                null;
        }


        this._notify();
    }


    /*
     * --------------------------------------------------
     * Get Current Frame
     * --------------------------------------------------
     */

    getCurrentFrame() {

        if (
            this.frames.length === 0
        ) {

            return null;
        }


        return this.frames[
            this.currentIndex
        ];
    }


    /*
     * --------------------------------------------------
     * Get Current Time
     * --------------------------------------------------
     */

    getCurrentTime() {

        return this.currentTime;
    }


    /*
     * --------------------------------------------------
     * Get Current Index
     * --------------------------------------------------
     */

    getCurrentIndex() {

        return this.currentIndex;
    }


    /*
     * --------------------------------------------------
     * Frame Count
     * --------------------------------------------------
     */

    getFrameCount() {

        return this.frames.length;
    }


    /*
     * --------------------------------------------------
     * Set Frame
     * --------------------------------------------------
     */

    setFrame(index) {

        if (
            this.frames.length === 0
        ) {

            return;
        }


        const clampedIndex =
            Math.max(
                0,
                Math.min(
                    index,
                    this.frames.length - 1
                )
            );


        this.currentIndex =
            clampedIndex;


        this.currentTime =
            this.frames[
                this.currentIndex
            ].time;


        this._notify();
    }


    /*
     * --------------------------------------------------
     * Next Frame
     * --------------------------------------------------
     */

    next() {

        if (
            this.frames.length === 0
        ) {

            return;
        }


        if (
            this.currentIndex <
            this.frames.length - 1
        ) {

            this.setFrame(
                this.currentIndex + 1
            );

        } else {

            /*
             * Reached the end.
             *
             * Do not automatically loop yet.
             */

            this.stop();
        }
    }


    /*
     * --------------------------------------------------
     * Previous Frame
     * --------------------------------------------------
     */

    previous() {

        if (
            this.frames.length === 0
        ) {

            return;
        }


        if (
            this.currentIndex > 0
        ) {

            this.setFrame(
                this.currentIndex - 1
            );
        }
    }


    /*
     * --------------------------------------------------
     * First Frame
     * --------------------------------------------------
     */

    first() {

        if (
            this.frames.length === 0
        ) {

            return;
        }


        this.setFrame(0);
    }


    /*
     * --------------------------------------------------
     * Last Frame
     * --------------------------------------------------
     */

    last() {

        if (
            this.frames.length === 0
        ) {

            return;
        }


        this.setFrame(
            this.frames.length - 1
        );
    }


    /*
     * --------------------------------------------------
     * Play
     * --------------------------------------------------
     */

    play() {

        if (
            this.playing
        ) {

            return;
        }


        if (
            this.frames.length <= 1
        ) {

            return;
        }


        /*
         * If we are already at the end,
         * restart from the beginning.
         */

        if (
            this.currentIndex >=
            this.frames.length - 1
        ) {

            this.first();
        }


        this.playing =
            true;


        this._notify();


        this._startTimer();
    }


    /*
     * --------------------------------------------------
     * Pause
     * --------------------------------------------------
     */

    pause() {

        if (
            !this.playing
        ) {

            return;
        }


        this.playing =
            false;


        this._stopTimer();


        this._notify();
    }


    /*
     * --------------------------------------------------
     * Stop
     * --------------------------------------------------
     *
     * Stop playback and return to frame 0.
     */

    stop() {

        this.playing =
            false;


        this._stopTimer();


        /*
         * Do not force frame 0 here.
         *
         * This allows us to pause/stop at the
         * current historical time.
         */

        this._notify();
    }


    /*
     * --------------------------------------------------
     * Toggle Play / Pause
     * --------------------------------------------------
     */

    togglePlayback() {

        if (
            this.playing
        ) {

            this.pause();

        } else {

            this.play();
        }
    }


    /*
     * --------------------------------------------------
     * Playback Speed
     * --------------------------------------------------
     */

    setPlaybackSpeed(speed) {

        const numericSpeed =
            Number(speed);


        if (
            !Number.isFinite(
                numericSpeed
            ) ||
            numericSpeed <= 0
        ) {

            return;
        }


        this.playbackSpeed =
            numericSpeed;


        /*
         * Restart timer so the new speed
         * takes effect immediately.
         */

        if (
            this.playing
        ) {

            this._stopTimer();

            this._startTimer();
        }
    }


    getPlaybackSpeed() {

        return this.playbackSpeed;
    }


    /*
     * --------------------------------------------------
     * Timer
     * --------------------------------------------------
     */

    _startTimer() {

        this._stopTimer();


        const interval =
            this.frameInterval /
            this.playbackSpeed;


        this._timer =
            setInterval(
                () => {

                    if (
                        this.currentIndex >=
                        this.frames.length - 1
                    ) {

                        this.pause();

                        return;
                    }


                    this.next();

                },
                interval
            );
    }


    _stopTimer() {

        if (
            this._timer !== null
        ) {

            clearInterval(
                this._timer
            );

            this._timer =
                null;
        }
    }


    /*
     * --------------------------------------------------
     * Listener System
     * --------------------------------------------------
     */

    addListener(listener) {

        if (
            typeof listener !==
            "function"
        ) {

            return;
        }


        if (
            !this._listeners.includes(
                listener
            )
        ) {

            this._listeners.push(
                listener
            );
        }
    }


    removeListener(listener) {

        this._listeners =
            this._listeners.filter(
                existingListener =>
                    existingListener !==
                    listener
            );
    }


    _notify() {

        const state = {

            index:
                this.currentIndex,

            time:
                this.currentTime,

            frame:
                this.getCurrentFrame(),

            frameCount:
                this.frames.length,

            playing:
                this.playing
        };


        for (
            const listener of this._listeners
        ) {

            listener(state);
        }
    }


    /*
     * --------------------------------------------------
     * State
     * --------------------------------------------------
     */

    isPlaying() {

        return this.playing;
    }


    /*
     * --------------------------------------------------
     * Cleanup
     * --------------------------------------------------
     */

    destroy() {

        this.stop();

        this._listeners = [];

        this.frames = [];

        this.currentIndex = 0;

        this.currentTime = null;
    }
}