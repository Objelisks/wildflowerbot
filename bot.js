require('./SoftwareRenderer.js');
require('./Projector.js');
let THREE = require('./three.js');
let Canvas = require('canvas');
let fs = require('fs');

let width = 360, height = 360;
let scene, camera, renderer;

let gradient;

let canvas = new Canvas(width, height);
let ctx = canvas.getContext('2d');

let terrain = require('./terrain.js');
let plants = require('./flowers.js');
let noisejs = new (require('noisejs').Noise)();

/*
gradient in the bg
perlin density
parametric flower generator
trees
secret orbs
*/
    
let palette = [
  '#DAB690',
  '#9AD47D',
  '#71D0B8',
  '#9C94DB',
  '#CC6692',
  '#E0A3D0',
  '#C9C9ED',
  '#DAEECD'
  ];

let pickRandom = function(arr) {
  return arr[Math.floor(Math.random()*arr.length)];
}

function init() {
    gradient = ctx.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0, pickRandom(palette));
    gradient.addColorStop(1, "#C6CF6E");
    
    renderer = new THREE.SoftwareRenderer({
        canvas: canvas
    });
    renderer.autoClear = false;
    renderer.setSize( width, height );

    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000);
    camera.position.x = 90;
    camera.position.y = 40;
    camera.position.z = 90;
}

function animate() {
    gradient = ctx.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0, pickRandom(palette));
    gradient.addColorStop(1, "#C6CF6E");
    
    scene = new THREE.Scene();
    let seed = Math.random();
    noisejs.seed(seed);
    
    let scale = 50;
    
    camera.position.y = noisejs.perlin2(0.9, 0.9)*scale + 10 + 20*Math.random();
    camera.lookAt(new THREE.Vector3(50,noisejs.perlin2(0.5, 0.5)*scale,50));
    
    let ground = terrain.generate({seed: seed, scale: scale});
    scene.add(ground);
    
    for(let i=0; i<5; i++) {
        let flowers = plants.generate({
           camera: camera,
           seed: seed,
           density: Math.random()*0.5+0.1,
           scale: scale
        });
        scene.add(flowers);
    }
    /*
    let flowers = plants.generate({
        camera: camera,
        seed: seed,
        density: 0.5,
        scale: scale,
        colorType: 'rainbow', buildType: 'round', placeType: 'grouped'});
    let tall = plants.generate({
        camera: camera,
        seed: seed,
        density: 0.5,
        scale: scale,
        colorType: 'rainbow', buildType: 'reed', placeType: 'perlin'});
    let scattered = plants.generate({
        camera: camera,
        seed: seed,
        density: 0.2,
        scale: scale,
        colorType: 'pastel', buildType: 'daisy', placeType: 'field'});
    let grassShadow = plants.generate({
        camera: camera,
        seed: seed,
        density: 0.25,
        scale: scale,
        color: '#316B24',
        colorType: 'rainbow', buildType: 'grassShadow', placeType: 'field'});
    
    scene.add(flowers);
    scene.add(tall);
    scene.add(scattered);
    scene.add(grassShadow);
    */
}

function render() {
    renderer.clearDepth();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    renderer.render(scene, camera);
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
for(let i=0; i<8; i++) {
    p = p.then(renderAndSave(i));
}