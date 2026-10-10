import * as THREE from "three";

import { Earth } from "./earth/Earth.js";
import { Icosahedron } from "./earth/Icosahedron.js";

import { Camera } from "./camera/Camera.js";
import { Renderer } from "./renderer/Renderer.js";
import { OrbitController } from "./camera/OrbitController.js";

import { Input } from "./input/Input.js";
import { Time } from "./time/Time.js";

import {
    geoToCartesian,
    cartesianToGeo,
    raySphereIntersection
} from "./gis/CoordinateConversion.js";

import {
    IcosahedronVisualizer
} from "./renderer/IcosahedronVisualizer.js";
import {
    WeatherVisualizer
} from "./renderer/WeatherVisualizer.js";
import { WeatherField } from "./weather/WeatherField.js";
import {
    SpatialWeatherField
} from "./weather/SpatialWeatherField.js";


import { DebugPanel } from "./ui/DebugPanel.js";
import { CameraDebugPanel } from "./ui/CameraDebugPanel.js";
import { TimePanel } from "./ui/TimePanel.js";
import {
    LocalWeatherDataSource
} from "./weather/LocalWeatherDataSource.js";

import {
    WeatherStatistics
} from "./weather/WeatherStatistics.js";

import {
    WeatherBaseline
} from "./weather/WeatherBaseline.js";

import {
    AnomalyCalculator
} from "./weather/AnomalyCalculator.js";

import {
    PrototypeWeatherGenerator
} from "./weather/PrototypeWeatherGenerator.js";

import {
    VisualizationLoader
} from "./visualization/VisualizationLoader.js";

import {
    VariableGraph
} from "./visualization/graphs/VariableGraph.js";

import { TimeController } from "./time/TimeController.js";
import { TimeSliderPanel } from "./ui/TimeSliderPanel.js";
// --------------------------------------------------
// Core
// --------------------------------------------------

const earth =
    new Earth();

const icosahedron =
    new Icosahedron(
        earth.radius
    );

const time =
    new Time();


// --------------------------------------------------
// Icosahedron Subdivision
// --------------------------------------------------

icosahedron.subdivide();

console.log(
    "Cell 20 Center:",
    icosahedron.cells[0].center
);

const cellCenter =
    icosahedron.cells[0].center;

const cellCoordinate =
    cartesianToGeo(
        cellCenter,
        earth.radius
    );

console.log(
    "Cell 20 Geographic Center:",
    cellCoordinate
);

console.log(
    "Icosahedron Level:",
    icosahedron.getLevel()
);

console.log(
    "Vertices:",
    icosahedron.getVertexCount()
);

console.log(
    "Edges:",
    icosahedron.getEdgeCount()
);

console.log(
    "Faces:",
    icosahedron.getFaceCount()
);

console.log(
    "Cells:",
    icosahedron.getCellCount()
);

console.log(
    "First Level 1 Cell:",
    icosahedron.cells[0]
);

console.log(
    "Its Parent:",
    icosahedron.cells[0].parent
);

console.log(
    "Parent Children:",
    icosahedron.cells[0].parent.children
);


// --------------------------------------------------
// Scene
// --------------------------------------------------

const scene =
    new THREE.Scene();


// --------------------------------------------------
// Camera
// --------------------------------------------------

const camera =
    new Camera();


// --------------------------------------------------
// Renderer
// --------------------------------------------------

const renderer =
    new Renderer();


// --------------------------------------------------
// Input
// --------------------------------------------------

const input =
    new Input(
        renderer.renderer.domElement
    );


// --------------------------------------------------
// Orbit Controller
// --------------------------------------------------

const orbitController =
    new OrbitController(
        camera,
        input
    );


// --------------------------------------------------
// Debug Panels
// --------------------------------------------------

const gisDebugPanel =
    new DebugPanel();

const cameraDebugPanel =
    new CameraDebugPanel();

const timePanel =
    new TimePanel();



// --------------------------------------------------
// Camera Navigation
// --------------------------------------------------

cameraDebugPanel.goToButton
    .addEventListener(
        "click",
        () => {
            const coordinate =
                cameraDebugPanel
                    .getTargetCoordinate();

            const position =
                geoToCartesian(
                    coordinate,
                    earth.radius
                );

            orbitController.goToLocation(
                position
            );
        }
    );


// --------------------------------------------------
// Earth
// --------------------------------------------------

const earthGeometry =
    new THREE.SphereGeometry(
        earth.radius,
        64,
        32
    );

const earthMaterial =
    new THREE.MeshBasicMaterial({
        wireframe: true
    });

const globe =
    new THREE.Mesh(
        earthGeometry,
        earthMaterial
    );

scene.add(
    globe
);

// --------------------------------------------------
// Icosahedron Visualization
// --------------------------------------------------

const icosahedronVisualizer =
    new IcosahedronVisualizer(
        scene,
        icosahedron
    );

// --------------------------------------------------
// Weather Visualization
// --------------------------------------------------

const weatherVisualizer =
    new WeatherVisualizer(
        scene,
        earth
    );

// --------------------------------------------------
// Weather
// --------------------------------------------------

const weatherDataSource =
    new LocalWeatherDataSource(
        "/data/weather/prototype_weather.json"
    );

const weatherField =
    new WeatherField();

let weatherObservations = [];

weatherDataSource
    .load()
    .then(
        observations => {
            weatherObservations =
                observations;

            weatherField.addObservations(
                observations
            );

            console.log(
                "Loaded weather observations:",
                weatherObservations
            );

            console.log(
                "Weather field:",
                weatherField
            );

            weatherVisualizer.displayObservations(
                weatherObservations,
                icosahedron
            );

            for (const observation of weatherObservations) {
                console.log(
                    "Weather Observation:",
                    observation
                );

                console.log(
                    "Associated Cell:",
                    observation.cell
                );
            }

            // --------------------------------------------------
            // Weather Field Tests
            // --------------------------------------------------

            console.log(
                "Valid Times:",
                [...weatherField.getValidTimes()]
            );

            console.log(
                "Ensemble Members:",
                [
                    ...weatherField.getEnsembleMembers(
                        "2026-09-27T06:00:00Z"
                    )
                ]
            );

            console.log(
                "12:00 Ensemble 1:",
                weatherField.getObservationsAt(
                    "2026-09-27T12:00:00Z",
                    1
                )
            );

            console.log(
                "18:00 Ensemble 0:",
                weatherField.getObservationsAt(
                    "2026-09-27T18:00:00Z",
                    0
                )
            );

            console.log(
                "Observations:",
                weatherField.getObservationsAt(
                    "2026-09-27T06:00:00Z",
                    0
                )
            );
            const spatialField =
                weatherField.getField(
                    "2026-09-27T12:00:00Z",
                    1
                );

            console.log(
                "Spatial Weather Field:",
                spatialField
            );

            const spatialWeatherField =
                new SpatialWeatherField(
                    earth
                );

            spatialWeatherField.addObservations(
                spatialField,
                icosahedron
            );

            const temperatureStatistics =
                WeatherStatistics.calculate(
                    spatialWeatherField.getObservations(),
                    "temperature"
                );

            console.log(
                "Temperature Statistics:",
                temperatureStatistics
            );
            const cell20Observations =
                spatialWeatherField.getCellObservations(
                    20
                );

            const cell20TemperatureStatistics =
                WeatherStatistics.calculate(
                    cell20Observations,
                    "temperature"
                );

            console.log(
                "Cell 20 Temperature Statistics:",
                cell20TemperatureStatistics
            );

            console.log(
                "Spatial Weather Representation:",
                spatialWeatherField
            );
            console.log(
                "Spatial Cell IDs:",
                [
                    ...spatialWeatherField.getCellIds()
                ]
            );
            console.log(
                "Observations in Cell 20:",
                spatialWeatherField.getCellObservations(
                    20
                )
            );

            console.log(
                "Spatial Weather Field"
            );

            console.log(
                "Observation Count:",
                spatialWeatherField.getObservationCount()
            );

            console.log(
                "Cell Count:",
                spatialWeatherField.getCellCount()
            );

            for (const cellId of spatialWeatherField.getCellIds()) {
                console.log(
                    "Cell:",
                    cellId,
                    "Observations:",
                    spatialWeatherField.getCellObservations(
                        cellId
                    )
                );
            }

            const weatherBaseline =
                new WeatherBaseline();

            weatherBaseline.set(
                "78.9629,20.5937",
                "temperature",
                28.0
            );

            weatherBaseline.set(
                "79.9629,20.5937",
                "temperature",
                27.5
            );

            weatherBaseline.set(
                "78.9629,21.5937",
                "temperature",
                27.0
            );
            console.log(
                "Baseline Temperature:",
                weatherBaseline.get(
                    "78.9629,20.5937",
                    "temperature"
                )
            );
            console.log(
                "Baseline 1:",
                weatherBaseline.get(
                    "78.9629,20.5937",
                    "temperature"
                )
            );

            console.log(
                "Baseline 2:",
                weatherBaseline.get(
                    "79.9629,20.5937",
                    "temperature"
                )
            );

            console.log(
                "Baseline 3:",
                weatherBaseline.get(
                    "78.9629,21.5937",
                    "temperature"
                )
            );
            const testObservation =
                spatialWeatherField.getObservations()[0];

            const testBaseline =
                weatherBaseline.get(
                    `${testObservation.longitude},${testObservation.latitude}`,
                    "temperature"
                );

            const temperatureAnomaly =
                AnomalyCalculator.calculate(
                    testObservation,
                    testBaseline,
                    "temperature"
                );

            console.log(
                "Temperature Anomaly:",
                temperatureAnomaly
            );
            const prototypeGenerator =
                new PrototypeWeatherGenerator({
                    longitudeStep: 5,
                    latitudeStep: 5,

                    validTimes: [
                        "2026-09-27T06:00:00Z",
                        "2026-09-27T12:00:00Z",
                        "2026-09-27T18:00:00Z"
                    ],

                    ensembleMembers: [
                        0,
                        1
                    ]
                });

            const globalObservations =
                prototypeGenerator.generate();

            console.log(
                "Global Prototype Observations:",
                globalObservations
            );

            console.log(
                "Global Observation Count:",
                globalObservations.length
            );
            const anomalyCenterObservation =
                globalObservations.find(
                    observation =>
                        observation.validTime ===
                        "2026-09-27T06:00:00Z" &&
                        observation.longitude === 60 &&
                        observation.latitude === 20
                );

            console.log(
                "Initial Anomaly Center:",
                anomalyCenterObservation
            );
            const movingAnomalyObservations =
                globalObservations.filter(
                    observation =>
                        observation.latitude === 20 &&
                        (
                            observation.longitude === 60 ||
                            observation.longitude === 70 ||
                            observation.longitude === 80
                        )
                );

            console.log(
                "Moving Anomaly Samples:",
                movingAnomalyObservations
            );
        }
    )
    .catch(
        error => {
            console.error(
                "Failed to load weather data:",
                error
            );
        }
    );
// --------------------------------------------------
// Python Visualization Data
// --------------------------------------------------
const visualizationLoader =
    new VisualizationLoader();

let visualizationData = null;


/*
 * --------------------------------------------------
 * Universal Time Controller
 * --------------------------------------------------
 *
 * This controller is independent of the currently
 * displayed weather variable.
 *
 * Temperature, pressure, wind, precipitation, etc.
 * will eventually all use the same timeline.
 */

const timeController =
    new TimeController({
        frameInterval: 750,
        playbackSpeed: 1.0
    });

    const timeSliderPanel =
    new TimeSliderPanel(
        timeController
    );
    console.log(
    "Time Slider Panel initialized."
);


visualizationLoader
    .load(
        // "/data/visualization/timeline.json"
        "/data/visualization/global_temperature.json"
    )
    .then(
        data => {

            visualizationData =
                data;


            /*
             * --------------------------------------------------
             * Visualization Debug Information
             * --------------------------------------------------
             */

            console.log(
                "Loaded Avani visualization data:",
                visualizationData
            );


            console.log(
                "Visualization Summary:",
                visualizationData.getSummary()
            );


            /*
             * Print every available frame.
             */

            for (
                let i = 0;
                i < visualizationData.getFrameCount();
                i++
            ) {

                const frame =
                    visualizationData.getFrame(i);


                console.log(
                    "Visualization Frame:",
                    i,
                    frame.time,
                    "Anomalies:",
                    frame.anomalies.length,
                    "Regions:",
                    frame.regions.length
                );
            }


            /*
             * --------------------------------------------------
             * Initialize Universal Time Controller
             * --------------------------------------------------
             */

            timeController.setFrames(
                visualizationData.frames
            );


            console.log(
                "Time Controller initialized."
            );


            console.log(
                "Time Controller frame count:",
                timeController.getFrameCount()
            );


            console.log(
                "Time Controller current index:",
                timeController.getCurrentIndex()
            );


            console.log(
                "Time Controller current time:",
                timeController.getCurrentTime()
            );


            /*
             * --------------------------------------------------
             * Variable Graph
             * --------------------------------------------------
             */

            const variableGraph =
                new VariableGraph({

                    radius:
                        1.002,

                    pointSize:
                        0.025,

                    wrapLongitude:
                        true
                });
            timeController.addListener(
                state => {

                    if (
                        !state.frame
                    ) {

                        return;
                    }


                    variableGraph.setFrame(
                        state.frame
                    );


                    console.log(
                        "Visualization time:",
                        state.time
                    );
                }
            );

            /*
             * --------------------------------------------------
             * Initial Frame
             * --------------------------------------------------
             *
             * The TimeController owns the current frame.
             *
             * Therefore we do not independently choose
             * a frame for the graph.
             */

            const firstFrame =
                timeController.getCurrentFrame();


            variableGraph.setFrame(
                firstFrame
            );


            scene.add(
                variableGraph.getObject()
            );


            /*
             * --------------------------------------------------
             * Variable Graph Debug Information
             * --------------------------------------------------
             */

            console.log(
                "Variable graph created."
            );


            console.log(
                "Graph samples:",
                variableGraph.getSampleCount()
            );


            console.log(
                "Graph grid:",
                variableGraph.getGridRows(),
                "x",
                variableGraph.getGridColumns()
            );


            console.log(
                "Graph cells:",
                variableGraph.getCellCount()
            );


            console.log(
                "Temperature range:",
                variableGraph.getMinimumValue(),
                variableGraph.getMaximumValue()
            );

          
            /*
             * --------------------------------------------------
             * Universal Time → Variable Graph
             * --------------------------------------------------
             *
             * Whenever the time controller changes,
             * the currently displayed frame changes too.
             *
             * The graph does NOT own the timeline.
             */

            timeController.addListener(
                state => {

                    if (
                        !state.frame
                    ) {

                        return;
                    }


                    variableGraph.setFrame(
                        state.frame
                    );


                    console.log(
                        "[TimeController] Frame:",
                        state.index,
                        "/",
                        state.frameCount - 1
                    );


                    console.log(
                        "[TimeController] Time:",
                        state.time
                    );


                    console.log(
                        "[TimeController] Playing:",
                        state.playing
                    );


                    console.log(
                        "[VariableGraph] Samples:",
                        variableGraph.getSampleCount()
                    );


                    console.log(
                        "[VariableGraph] Range:",
                        variableGraph.getMinimumValue(),
                        "→",
                        variableGraph.getMaximumValue()
                    );
                }
            );


            /*
             * --------------------------------------------------
             * Final Initialization Status
             * --------------------------------------------------
             */

            console.log(
                "Universal visualization timeline ready."
            );
        }
    )
    .catch(
        error => {

            console.error(
                "Failed to load Avani visualization data:",
                error
            );
        }
    );
// --------------------------------------------------
// GIS Debug Point
// --------------------------------------------------

const pointGeometry =
    new THREE.SphereGeometry(
        0.025,
        16,
        16
    );

const pointMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xff3333
    });

const debugPoint =
    new THREE.Mesh(
        pointGeometry,
        pointMaterial
    );

scene.add(
    debugPoint
);


// --------------------------------------------------
// GIS Point Update
// --------------------------------------------------

function updateGISPoint() {
    const coordinate =
        gisDebugPanel.getCoordinate();

    const position =
        geoToCartesian(
            coordinate,
            earth.radius
        );

    debugPoint.position.copy(
        position
    );

    gisDebugPanel.update(
        coordinate,
        position
    );


    const cell =
        icosahedron.findCell(
            position
        );

    console.log(
        "Current GIS Cell:",
        cell
    );


    // Highlight the cell containing
    // the current GIS position.

    icosahedronVisualizer.highlightCell(
        cell
    );
}

gisDebugPanel.longitudeInput
    .addEventListener(
        "input",
        updateGISPoint
    );

gisDebugPanel.latitudeInput
    .addEventListener(
        "input",
        updateGISPoint
    );

gisDebugPanel.heightInput
    .addEventListener(
        "input",
        updateGISPoint
    );

updateGISPoint();

const testCoordinate =
    gisDebugPanel.getCoordinate();

const testPosition =
    geoToCartesian(
        testCoordinate,
        earth.radius
    );

const foundCell =
    icosahedron.findCell(
        testPosition
    );

console.log(
    "GIS Test Coordinate:",
    testCoordinate
);

console.log(
    "Found Cell:",
    foundCell
);


// --------------------------------------------------
// Camera → Earth Center Line
// --------------------------------------------------

const cameraLineGeometry =
    new THREE.BufferGeometry();

const cameraLineMaterial =
    new THREE.LineBasicMaterial({
        color: 0x00ff00
    });

const cameraLine =
    new THREE.Line(
        cameraLineGeometry,
        cameraLineMaterial
    );

scene.add(
    cameraLine
);


// --------------------------------------------------
// Camera Look Point
// --------------------------------------------------

const cameraLookPointGeometry =
    new THREE.SphereGeometry(
        0.018,
        12,
        12
    );

const cameraLookPointMaterial =
    new THREE.MeshBasicMaterial({
        color: 0xffff00
    });

const cameraLookPoint =
    new THREE.Mesh(
        cameraLookPointGeometry,
        cameraLookPointMaterial
    );

scene.add(
    cameraLookPoint
);


// --------------------------------------------------
// Camera Debug Update
// --------------------------------------------------

function updateCameraDebug() {
    const cameraPosition =
        camera.camera.position;

    const direction =
        new THREE.Vector3();

    camera.camera.getWorldDirection(
        direction
    );

    const intersection =
        raySphereIntersection(
            cameraPosition,
            direction,
            earth.radius
        );

    if (
        intersection !== null
    ) {
        cameraLookPoint.position.copy(
            intersection
        );

        const coordinate =
            cartesianToGeo(
                intersection,
                earth.radius
            );

        cameraDebugPanel.update(
            camera,
            coordinate
        );
    }
    else {
        cameraDebugPanel.update(
            camera,
            null
        );
    }


    const linePoints = [

        cameraPosition.clone(),

        new THREE.Vector3(
            0.0,
            0.0,
            0.0
        )
    ];

    cameraLineGeometry.setFromPoints(
        linePoints
    );
}


// --------------------------------------------------
// Resize
// --------------------------------------------------

function resize() {
    const width =
        window.innerWidth;

    const height =
        window.innerHeight;

    camera.resize(
        width,
        height
    );

    renderer.resize(
        width,
        height
    );
}

window.addEventListener(
    "resize",
    resize
);


// --------------------------------------------------
// Main Loop
// --------------------------------------------------

function animate() {
    requestAnimationFrame(
        animate
    );


    // ----------------------------------------------
    // Time
    // ----------------------------------------------

    time.update();

    const deltaTime =
        time.getDeltaTime();

    timePanel.update(
        time
    );


    // ----------------------------------------------
    // Camera
    // ----------------------------------------------

    orbitController.update(
        deltaTime
    );


    // ----------------------------------------------
    // Camera Debug
    // ----------------------------------------------

    updateCameraDebug();


    // ----------------------------------------------
    // Render
    // ----------------------------------------------

    renderer.render(
        scene,
        camera
    );
}

animate();