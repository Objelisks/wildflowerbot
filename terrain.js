/* global THREE, Noise */

/*
making projects and learning things i want to use in a job
*/

let THREE = require('./three.min.js');
let fs = require('fs');
let Noise = require('noisejs').Noise;
let noisejs = new Noise();

let terrain = {};

let image = fs.readFileSync('grass_grass_0085_01_s.jpg');

let terrainMaterial = new THREE.MeshLambertMaterial({map: new THREE.TextureLoader().load('grass_grass_0085_01_s.jpg'), color: 0x439934, overdraw: 0.5});
//let terrainMaterial = new THREE.MeshNormalMaterial({overdraw: 0.5});

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
    return new THREE.Mesh(geo, terrainMaterial);
};

module.exports = terrain;