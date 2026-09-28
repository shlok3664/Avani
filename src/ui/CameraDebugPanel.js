export class CameraDebugPanel
{
    constructor()
    {
        this.container =
            document.createElement("div");

        this.container.style.position =
            "absolute";

        this.container.style.top =
            "20px";

        this.container.style.right =
            "20px";

        this.container.style.width =
            "270px";

        this.container.style.padding =
            "16px";

        this.container.style.background =
            "rgba(10, 10, 10, 0.85)";

        this.container.style.border =
            "1px solid rgba(255, 255, 255, 0.25)";

        this.container.style.borderRadius =
            "8px";

        this.container.style.color =
            "white";

        this.container.style.fontFamily =
            "monospace";

        this.container.style.fontSize =
            "13px";

        this.container.style.zIndex =
            "100";

        document.body.appendChild(
            this.container
        );

        this.createUI();
    }


    createUI()
    {
        this.container.innerHTML = `
            <div style="
                font-size: 16px;
                font-weight: bold;
                margin-bottom: 14px;
            ">
                AVANI CAMERA DEBUG
            </div>


            <div style="
                margin-bottom: 8px;
                opacity: 0.8;
            ">
                CAMERA POSITION
            </div>

            <div>
                X:
                <span id="camera-x">0</span>
            </div>

            <div>
                Y:
                <span id="camera-y">0</span>
            </div>

            <div>
                Z:
                <span id="camera-z">0</span>
            </div>

            <div style="margin-top: 6px;">
                Distance:
                <span id="camera-distance">0</span>
            </div>


            <hr style="
                margin: 15px 0;
                border: none;
                border-top:
                    1px solid rgba(255,255,255,0.2);
            ">


            <div style="
                margin-bottom: 8px;
                opacity: 0.8;
            ">
                LOOKING AT
            </div>

            <div>
                Longitude:
                <span id="camera-longitude">
                    ---
                </span>°
            </div>

            <div>
                Latitude:
                <span id="camera-latitude">
                    ---
                </span>°
            </div>

            <div>
                Height:
                <span id="camera-height">
                    ---
                </span>
            </div>


            <hr style="
                margin: 15px 0;
                border: none;
                border-top:
                    1px solid rgba(255,255,255,0.2);
            ">


            <div style="
                margin-bottom: 8px;
                opacity: 0.8;
            ">
                NAVIGATE TO
            </div>

            <div style="
                margin-bottom: 6px;
            ">
                Longitude

                <input
                    id="camera-target-longitude"
                    type="number"
                    value="0"
                    step="0.0001"
                    style="
                        width: 100px;
                        float: right;
                    "
                >
            </div>

            <div style="
                margin-bottom: 6px;
            ">
                Latitude

                <input
                    id="camera-target-latitude"
                    type="number"
                    value="0"
                    step="0.0001"
                    style="
                        width: 100px;
                        float: right;
                    "
                >
            </div>

            <div style="
                margin-bottom: 10px;
            ">
                Height

                <input
                    id="camera-target-height"
                    type="number"
                    value="0"
                    step="0.01"
                    style="
                        width: 100px;
                        float: right;
                    "
                >
            </div>

            <button
                id="camera-go-to"
                style="
                    width: 100%;
                    padding: 7px;
                    cursor: pointer;
                "
            >
                GO TO LOCATION
            </button>


            <div style="
                margin-top: 14px;
                font-size: 11px;
                opacity: 0.6;
                line-height: 1.5;
            ">
                Mouse drag → Orbit<br>
                ← → → Longitude<br>
                ↑ ↓ → North / South<br>
                Ctrl + → Zoom In<br>
                Ctrl - → Zoom Out
            </div>
        `;


        // Camera position

        this.x =
            this.container.querySelector(
                "#camera-x"
            );

        this.y =
            this.container.querySelector(
                "#camera-y"
            );

        this.z =
            this.container.querySelector(
                "#camera-z"
            );

        this.distance =
            this.container.querySelector(
                "#camera-distance"
            );


        // Looking-at coordinate

        this.longitude =
            this.container.querySelector(
                "#camera-longitude"
            );

        this.latitude =
            this.container.querySelector(
                "#camera-latitude"
            );

        this.height =
            this.container.querySelector(
                "#camera-height"
            );


        // Navigation inputs

        this.targetLongitude =
            this.container.querySelector(
                "#camera-target-longitude"
            );

        this.targetLatitude =
            this.container.querySelector(
                "#camera-target-latitude"
            );

        this.targetHeight =
            this.container.querySelector(
                "#camera-target-height"
            );

        this.goToButton =
            this.container.querySelector(
                "#camera-go-to"
            );
    }


    getTargetCoordinate()
    {
        return {
            longitude:
                Number(
                    this.targetLongitude.value
                ),

            latitude:
                Number(
                    this.targetLatitude.value
                ),

            height:
                Number(
                    this.targetHeight.value
                )
        };
    }


    update(camera, coordinate)
    {
        const position =
            camera.camera.position;

        this.x.textContent =
            position.x.toFixed(4);

        this.y.textContent =
            position.y.toFixed(4);

        this.z.textContent =
            position.z.toFixed(4);

        this.distance.textContent =
            position.length().toFixed(4);


        if (coordinate === null)
        {
            this.longitude.textContent =
                "---";

            this.latitude.textContent =
                "---";

            this.height.textContent =
                "---";

            return;
        }


        this.longitude.textContent =
            coordinate.longitude.toFixed(4);

        this.latitude.textContent =
            coordinate.latitude.toFixed(4);

        this.height.textContent =
            coordinate.height.toFixed(4);
    }
}