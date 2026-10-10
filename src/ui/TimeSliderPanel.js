export class TimeSliderPanel
{
    constructor(timeController)
    {
        if (!timeController)
        {
            throw new Error(
                "TimeSliderPanel requires a TimeController."
            );
        }

        this.timeController =
            timeController;

        this.panel =
            null;

        this.previousButton =
            null;

        this.playButton =
            null;

        this.nextButton =
            null;

        this.timeSlider =
            null;

        this.currentTimeLabel =
            null;

        this.frameLabel =
            null;

        this.startTimeLabel =
            null;

        this.endTimeLabel =
            null;

        this.speedSelect =
            null;


        this._build();


        this.timeController.addListener(
            state =>
            {
                this._update(state);
            }
        );
    }


    _build()
    {
        /*
         * --------------------------------------------------
         * Main panel
         * --------------------------------------------------
         */

        this.panel =
            document.createElement("div");

        this.panel.style.position =
            "fixed";

        this.panel.style.left =
            "50%";

        this.panel.style.bottom =
            "20px";

        this.panel.style.transform =
            "translateX(-50%)";

        this.panel.style.width =
            "min(900px, calc(100vw - 40px))";

        this.panel.style.padding =
            "14px 18px";

        this.panel.style.background =
            "rgba(8, 12, 20, 0.90)";

        this.panel.style.border =
            "1px solid rgba(255, 255, 255, 0.18)";

        this.panel.style.borderRadius =
            "10px";

        this.panel.style.backdropFilter =
            "blur(10px)";

        this.panel.style.boxShadow =
            "0 8px 30px rgba(0, 0, 0, 0.40)";

        this.panel.style.color =
            "white";

        this.panel.style.fontFamily =
            "Arial, Helvetica, sans-serif";

        this.panel.style.zIndex =
            "10000";

        this.panel.style.userSelect =
            "none";


        /*
         * --------------------------------------------------
         * Top control row
         * --------------------------------------------------
         */

        const controlRow =
            document.createElement("div");

        controlRow.style.display =
            "flex";

        controlRow.style.alignItems =
            "center";

        controlRow.style.gap =
            "8px";

        controlRow.style.marginBottom =
            "12px";


        /*
         * --------------------------------------------------
         * Previous frame button
         * --------------------------------------------------
         */

        this.previousButton =
            document.createElement("button");

        this._styleButton(
            this.previousButton
        );

        this.previousButton.textContent =
            "◀";

        this.previousButton.title =
            "Previous frame";

        this.previousButton.addEventListener(
            "click",
            () =>
            {
                this.timeController.previous();
            }
        );


        /*
         * --------------------------------------------------
         * Play / Pause button
         * --------------------------------------------------
         */

        this.playButton =
            document.createElement("button");

        this._styleButton(
            this.playButton
        );

        this.playButton.textContent =
            "▶";

        this.playButton.title =
            "Play";

        this.playButton.addEventListener(
            "click",
            () =>
            {
                this.timeController
                    .togglePlayback();
            }
        );


        /*
         * --------------------------------------------------
         * Next frame button
         * --------------------------------------------------
         */

        this.nextButton =
            document.createElement("button");

        this._styleButton(
            this.nextButton
        );

        this.nextButton.textContent =
            "▶";

        this.nextButton.title =
            "Next frame";

        this.nextButton.addEventListener(
            "click",
            () =>
            {
                this.timeController.next();
            }
        );


        /*
         * --------------------------------------------------
         * Current timestamp
         * --------------------------------------------------
         */

        this.currentTimeLabel =
            document.createElement("div");

        this.currentTimeLabel.style.marginLeft =
            "10px";

        this.currentTimeLabel.style.fontSize =
            "14px";

        this.currentTimeLabel.style.fontWeight =
            "500";

        this.currentTimeLabel.style.whiteSpace =
            "nowrap";

        this.currentTimeLabel.textContent =
            "No visualization time";


        /*
         * --------------------------------------------------
         * Frame counter
         * --------------------------------------------------
         */

        this.frameLabel =
            document.createElement("div");

        this.frameLabel.style.marginLeft =
            "auto";

        this.frameLabel.style.fontSize =
            "12px";

        this.frameLabel.style.opacity =
            "0.70";

        this.frameLabel.style.whiteSpace =
            "nowrap";

        this.frameLabel.textContent =
            "Frame 0 / 0";


        /*
         * --------------------------------------------------
         * Playback speed
         * --------------------------------------------------
         */

        this.speedSelect =
            document.createElement("select");

        this.speedSelect.style.height =
            "30px";

        this.speedSelect.style.marginLeft =
            "8px";

        this.speedSelect.style.padding =
            "0 6px";

        this.speedSelect.style.border =
            "1px solid rgba(255, 255, 255, 0.20)";

        this.speedSelect.style.borderRadius =
            "5px";

        this.speedSelect.style.background =
            "rgba(255, 255, 255, 0.08)";

        this.speedSelect.style.color =
            "white";

        this.speedSelect.style.cursor =
            "pointer";


        const playbackSpeeds =
            [
                0.25,
                0.5,
                1,
                2,
                4
            ];


        for (
            const speed of playbackSpeeds
        )
        {
            const option =
                document.createElement("option");

            option.value =
                String(speed);

            option.textContent =
                `${speed}×`;

            option.style.background =
                "#111";

            option.style.color =
                "white";

            if (speed === 1)
            {
                option.selected =
                    true;
            }

            this.speedSelect.appendChild(
                option
            );
        }


        this.speedSelect.addEventListener(
            "change",
            () =>
            {
                const speed =
                    Number(
                        this.speedSelect.value
                    );

                this.timeController
                    .setPlaybackSpeed(
                        speed
                    );
            }
        );


        /*
         * --------------------------------------------------
         * Add controls to row
         * --------------------------------------------------
         */

        controlRow.appendChild(
            this.previousButton
        );

        controlRow.appendChild(
            this.playButton
        );

        controlRow.appendChild(
            this.nextButton
        );

        controlRow.appendChild(
            this.currentTimeLabel
        );

        controlRow.appendChild(
            this.frameLabel
        );

        controlRow.appendChild(
            this.speedSelect
        );


        /*
         * --------------------------------------------------
         * Timeline
         * --------------------------------------------------
         */

        const timeline =
            document.createElement("div");

        timeline.style.width =
            "100%";


        this.timeSlider =
            document.createElement("input");

        this.timeSlider.type =
            "range";

        this.timeSlider.min =
            "0";

        this.timeSlider.max =
            "0";

        this.timeSlider.step =
            "1";

        this.timeSlider.value =
            "0";

        this.timeSlider.style.width =
            "100%";

        this.timeSlider.style.margin =
            "0";

        this.timeSlider.style.cursor =
            "pointer";


        this.timeSlider.addEventListener(
            "input",
            () =>
            {
                const frameIndex =
                    Number(
                        this.timeSlider.value
                    );

                this.timeController
                    .setFrame(
                        frameIndex
                    );
            }
        );


        timeline.appendChild(
            this.timeSlider
        );


        /*
         * --------------------------------------------------
         * Timeline labels
         * --------------------------------------------------
         */

        const timelineLabels =
            document.createElement("div");

        timelineLabels.style.display =
            "flex";

        timelineLabels.style.justifyContent =
            "space-between";

        timelineLabels.style.marginTop =
            "5px";

        timelineLabels.style.fontSize =
            "11px";

        timelineLabels.style.opacity =
            "0.60";


        this.startTimeLabel =
            document.createElement("span");

        this.endTimeLabel =
            document.createElement("span");


        this.startTimeLabel.textContent =
            "";

        this.endTimeLabel.textContent =
            "";


        timelineLabels.appendChild(
            this.startTimeLabel
        );

        timelineLabels.appendChild(
            this.endTimeLabel
        );


        /*
         * --------------------------------------------------
         * Assemble panel
         * --------------------------------------------------
         */

        this.panel.appendChild(
            controlRow
        );

        this.panel.appendChild(
            timeline
        );

        this.panel.appendChild(
            timelineLabels
        );


        /*
         * --------------------------------------------------
         * Add to document
         * --------------------------------------------------
         */

        document.body.appendChild(
            this.panel
        );
    }


    /*
     * ------------------------------------------------------
     * Button styling
     * ------------------------------------------------------
     */

    _styleButton(button)
    {
        button.style.width =
            "34px";

        button.style.height =
            "30px";

        button.style.border =
            "1px solid rgba(255, 255, 255, 0.20)";

        button.style.borderRadius =
            "5px";

        button.style.background =
            "rgba(255, 255, 255, 0.08)";

        button.style.color =
            "white";

        button.style.cursor =
            "pointer";

        button.style.fontSize =
            "13px";

        button.style.padding =
            "0";

        button.style.display =
            "flex";

        button.style.alignItems =
            "center";

        button.style.justifyContent =
            "center";


        /*
         * Hover / active states cannot be represented
         * directly through element.style.
         *
         * Use event listeners so the component remains
         * completely self-contained.
         */

        button.addEventListener(
            "mouseenter",
            () =>
            {
                button.style.background =
                    "rgba(255, 255, 255, 0.18)";
            }
        );

        button.addEventListener(
            "mouseleave",
            () =>
            {
                button.style.background =
                    "rgba(255, 255, 255, 0.08)";
            }
        );

        button.addEventListener(
            "mousedown",
            () =>
            {
                button.style.background =
                    "rgba(255, 255, 255, 0.28)";
            }
        );

        button.addEventListener(
            "mouseup",
            () =>
            {
                button.style.background =
                    "rgba(255, 255, 255, 0.18)";
            }
        );
    }


    _update(state)
    {
        const frameCount =
            state.frameCount;


        /*
         * --------------------------------------------------
         * Slider range
         * --------------------------------------------------
         */

        if (frameCount > 0)
        {
            this.timeSlider.max =
                String(
                    frameCount - 1
                );

            this.timeSlider.value =
                String(
                    state.index
                );


            /*
             * Start / end timestamps
             */

            const firstFrame =
                this.timeController.frames[0];

            const lastFrame =
                this.timeController.frames[
                    frameCount - 1
                ];


            if (firstFrame)
            {
                this.startTimeLabel.textContent =
                    this._formatTime(
                        firstFrame.time
                    );
            }


            if (lastFrame)
            {
                this.endTimeLabel.textContent =
                    this._formatTime(
                        lastFrame.time
                    );
            }
        }
        else
        {
            this.timeSlider.max =
                "0";

            this.timeSlider.value =
                "0";

            this.startTimeLabel.textContent =
                "";

            this.endTimeLabel.textContent =
                "";
        }


        /*
         * --------------------------------------------------
         * Current timestamp
         * --------------------------------------------------
         */

        if (state.time)
        {
            this.currentTimeLabel.textContent =
                this._formatTime(
                    state.time
                );
        }
        else
        {
            this.currentTimeLabel.textContent =
                "No visualization time";
        }


        /*
         * --------------------------------------------------
         * Frame counter
         * --------------------------------------------------
         */

        if (frameCount > 0)
        {
            this.frameLabel.textContent =
                `Frame ${state.index + 1} / ${frameCount}`;
        }
        else
        {
            this.frameLabel.textContent =
                "Frame 0 / 0";
        }


        /*
         * --------------------------------------------------
         * Play / pause state
         * --------------------------------------------------
         */

        if (state.playing)
        {
            this.playButton.textContent =
                "❚❚";

            this.playButton.title =
                "Pause";
        }
        else
        {
            this.playButton.textContent =
                "▶";

            this.playButton.title =
                "Play";
        }
    }


    _formatTime(value)
    {
        if (!value)
        {
            return "";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        )
        {
            return String(value);
        }


        return date
            .toISOString()
            .replace(
                "T",
                " "
            )
            .replace(
                ".000Z",
                " UTC"
            );
    }


    destroy()
    {
        if (this.panel)
        {
            this.panel.remove();

            this.panel =
                null;
        }
    }
}