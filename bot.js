require('./SoftwareRenderer.js');
require('./Projector.js');
let THREE = require('./three.min.js');
let Canvas = require('canvas');
let fs = require('fs');

let width = 360, height = 360;
let scene, camera, renderer;
let ground, flowers;

let canvas = new Canvas(width, height);
let terrain = require('./terrain.js');
let plants = require('./flowers.js');
let noisejs = new (require('noisejs').Noise)();

function init() {
    renderer = new THREE.SoftwareRenderer({canvas: canvas});
    renderer.setSize( width, height );

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000);
    camera.position.x = 100;
    camera.position.y = 40;
    camera.position.z = 100;
    camera.lookAt(new THREE.Vector3(0,0,0));

    let light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(0, 1, 0);
    scene.add(light);
    
    let seed = Math.random();
    ground = terrain.generate({seed: seed, scale: 50});
    scene.add(ground);
    
    flowers = plants.generate({camera: camera, seed: seed, scale: 50});
    scene.add(flowers);
}

function animate() {
    scene.remove(flowers);
    scene.remove(ground);
    let seed = Math.random();
    noisejs.seed(seed);
    ground = terrain.generate({seed: seed, scale: 50});
    flowers = plants.generate({camera: camera, seed: seed, scale: 50});
    scene.add(ground);
    scene.add(flowers);
    camera.position.y = noisejs.perlin2(100, 100)+5;
}

function render() {
    renderer.render( scene, camera );
}

function saveCanvas(name) {
    return new Promise((resolve, reject) => {
        let out = fs.createWriteStream(`${__dirname}/out/${name}.png`);
        let stream = canvas.pngStream();
        
        stream.on('data', function(chunk){
          out.write(chunk);
        });
        
        stream.on('end', function(){
          console.log('saved png', name);
          resolve();
        });
    });
}

init();

let renderAndSave = (i) => {
    return () => {
        animate();
        render();
        return saveCanvas(i);
    };
};

let p = Promise.resolve();
for(let i=0; i<16; i++) {
    p = p.then(renderAndSave(i));
}