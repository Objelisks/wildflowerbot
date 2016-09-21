/* global THREE, Noise */

/*
making projects and learning things i want to use in a job
*/

let THREE = require('./three.min.js');
let Noise = require('noisejs').Noise;
let noisejs = new Noise();

let flowers = {};

let flowersMaterial = new THREE.MeshLambertMaterial({color: 0x4545c5});

// destructured default function parameters go!
flowers.generate = function({camera, seed = 0, scale = 1} = {}) {
    noisejs.seed(seed);
    
    let group = new THREE.Object3D();
    
    let geo = new THREE.PlaneGeometry(1, 1, 1, 1);
    //geo.rotateX(-Math.PI/2);
    
    // adjust vertices
    for(let x=0; x<100; x+=2) {
        for(let y=0; y<100; y+=2) {
            let mesh = new THREE.Mesh(geo, flowersMaterial);
            mesh.position.x = x + Math.random()*2-1;
            mesh.position.y = noisejs.perlin2(x/100, y/100)*scale;
            mesh.position.z = y + Math.random()*2-1;
            mesh.lookAt(camera.position);
            group.add(mesh);
        }
    }
    
    return group;
};

module.exports = flowers;