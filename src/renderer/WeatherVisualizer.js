import * as THREE from "three";

import {
    geoToCartesian
} from "../gis/CoordinateConversion.js";


export class WeatherVisualizer
{
    constructor(scene, earth)
    {
        this.scene = scene;
        this.earth = earth;

        this.points = [];
    }


    clear()
    {
        for (const point of this.points)
        {
            this.scene.remove(point);

            point.geometry.dispose();
            point.material.dispose();
        }

        this.points = [];
    }


    displayObservations(
    observations,
    icosahedron
)
{
    this.clear();

    for (const observation of observations)
    {
        this.addObservation(
            observation,
            icosahedron
        );
    }
}


    addObservation(observation, icosahedron)
{
    const position =
        geoToCartesian(
            observation,
            this.earth.radius
        );


    const cell =
        icosahedron.findCell(
            position
        );


    observation.spatialCell  =
        cell;


    const geometry =
        new THREE.SphereGeometry(
            0.025,
            12,
            12
        );


    const material =
        new THREE.MeshBasicMaterial({
            color: 0x00ffff
        });


    const point =
        new THREE.Mesh(
            geometry,
            material
        );


    point.position.copy(
        position
    );


    this.scene.add(
        point
    );


    this.points.push(
        point
    );
}
}