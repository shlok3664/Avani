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

import { DebugPanel } from "./ui/DebugPanel.js";
import { CameraDebugPanel } from "./ui/CameraDebugPanel.js";
import { TimePanel } from "./ui/TimePanel.js";

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
        () =>
        {
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

function updateGISPoint()
{
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

function updateCameraDebug()
{
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
    )
    {
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
    else
    {
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

function resize()
{
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



function animate()
{
    requestAnimationFrame(
        animate
    );


    time.update();


    const deltaTime =
        time.getDeltaTime();


    timePanel.update(
        time
    );


    orbitController.update(
        deltaTime
    );


    updateCameraDebug();


    renderer.render(
        scene,
        camera
    );
}
animate();