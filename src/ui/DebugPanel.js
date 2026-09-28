export class DebugPanel
{
    constructor()
    {
        this.container = document.createElement("div");

        this.container.style.position = "absolute";
        this.container.style.top = "50px";
        this.container.style.left = "20px";

        this.container.style.width = "240px";

        this.container.style.padding = "16px";

        this.container.style.background =
            "rgba(10, 10, 10, 0.85)";

        this.container.style.border =
            "1px solid rgba(255, 255, 255, 0.25)";

        this.container.style.borderRadius = "8px";

        this.container.style.color = "white";

        this.container.style.fontFamily =
            "monospace";

        this.container.style.fontSize =
            "13px";

        this.container.style.zIndex = "100";

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
                AVANI GIS DEBUG
            </div>

            <div>
                Longitude
                <input
                    id="debug-longitude"
                    type="number"
                    value="78.9629"
                    step="0.0001"
                    style="width: 90px; float: right;"
                >
            </div>

            <div style="margin-top: 8px;">
                Latitude
                <input
                    id="debug-latitude"
                    type="number"
                    value="20.5937"
                    step="0.0001"
                    style="width: 90px; float: right;"
                >
            </div>

            <div style="margin-top: 8px;">
                Height
                <input
                    id="debug-height"
                    type="number"
                    value="0"
                    step="0.01"
                    style="width: 90px; float: right;"
                >
            </div>

            <hr style="
                margin: 15px 0;
                border: none;
                border-top: 1px solid rgba(255,255,255,0.2);
            ">

            <div style="margin-bottom: 6px;">
                CARTESIAN
            </div>

            <div>
                X:
                <span id="debug-x">0</span>
            </div>

            <div>
                Y:
                <span id="debug-y">0</span>
            </div>

            <div>
                Z:
                <span id="debug-z">0</span>
            </div>

            <hr style="
                margin: 15px 0;
                border: none;
                border-top: 1px solid rgba(255,255,255,0.2);
            ">

            <div>
                Radius:
                <span id="debug-radius">0</span>
            </div>
        `;

        this.longitudeInput =
            this.container.querySelector(
                "#debug-longitude"
            );

        this.latitudeInput =
            this.container.querySelector(
                "#debug-latitude"
            );

        this.heightInput =
            this.container.querySelector(
                "#debug-height"
            );

        this.xOutput =
            this.container.querySelector(
                "#debug-x"
            );

        this.yOutput =
            this.container.querySelector(
                "#debug-y"
            );

        this.zOutput =
            this.container.querySelector(
                "#debug-z"
            );

        this.radiusOutput =
            this.container.querySelector(
                "#debug-radius"
            );
    }

    getCoordinate()
    {
        return {
            longitude:
                Number(this.longitudeInput.value),

            latitude:
                Number(this.latitudeInput.value),

            height:
                Number(this.heightInput.value)
        };
    }

    update(coordinate, position)
    {
        this.xOutput.textContent =
            position.x.toFixed(6);

        this.yOutput.textContent =
            position.y.toFixed(6);

        this.zOutput.textContent =
            position.z.toFixed(6);

        this.radiusOutput.textContent =
            position.length().toFixed(6);
    }
}