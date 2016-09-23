/* global THREE, Noise */

let THREE = require('./three.js');
let Noise = require('noisejs').Noise;
let noisejs = new Noise();

let terrain = {};

let terrainMaterial = new THREE.MeshBasicMaterial({color: 0x43a454, overdraw: 0.5});

// destructured default function parameters go!
terrain.generate = function({seed = 0, scale = 1} = {}) {
    noisejs.seed(seed);
    
    let geo = new THREE.PlaneGeometry(100, 100, 100, 100);
    geo.rotateX(-Math.PI/2);
    geo.translate(50, 0, 50);
    
    // adjust vertices
    for(let x=0; x<100; x++) {
        for(let y=0; y<100; y++) {
            let vertex = geo.vertices[x*100+y];
            vertex.y = noisejs.perlin2(vertex.x/100, vertex.z/100)*scale;
        }
    }
    
    geo.verticesNeedUpdate = true;
    geo.computeFaceNormals();
    return new THREE.Mesh(geo, terrainMaterial);
};

module.exports = terrain;