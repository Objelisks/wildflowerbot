require('./SoftwareRenderer.js');
require('./Projector.js');
let THREE = require('./three.js');
let Canvas = require('canvas');
let fs = require('fs');

let width = 1024, height = 512;
let scene, camera, renderer;
let gradient;

let canvas = new Canvas(width, height);
let ctx = canvas.getContext('2d');

let terrain = require('./terrain.js');
let plants = require('./flowers.js');
let noisejs = new (require('noisejs').Noise)();

/* TODO
parametric flower generator
trees
more secret things (a house, an animal)
*/

// for bg gradient
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

    camera = new THREE.PerspectiveCamera( 60, width / height, 0.1, 1000);
    camera.position.x = 80;
    camera.position.y = 40;
    camera.position.z = 80;
}

function animate() {
    
    gradient = ctx.createLinearGradient(0,0,0,height);
    gradient.addColorStop(0, pickRandom(palette));
    gradient.addColorStop(1, "#C6CF6E");
    
    scene = new THREE.Scene();
    let seed = Math.random();
    noisejs.seed(seed);
    
    let scale = Math.random()*50+20;
    
    camera.position.y = noisejs.perlin2(0.8, 0.9)*scale + 10 + 5*Math.random();
    camera.lookAt(new THREE.Vector3(50,noisejs.perlin2(0.5, 0.5)*scale,50));
    
    let ground = terrain.generate({seed: seed, scale: scale});
    scene.add(ground);
    
    let layers = Math.floor(Math.random()*2) + 2;
    
    for(let i=0; i<layers; i++) {
        let flowers = plants.generate({
           camera: camera,
           seed: seed,
           density: Math.random()*0.4+0.1,
           scale: scale
        });
        scene.add(flowers);
    }
    
    // secret zone
    if(Math.random() < 0.01) {// one in one hundred
        let orb = new THREE.Mesh(new THREE.SphereBufferGeometry(4, 16, 16), new THREE.MeshBasicMaterial({color: '#000'}));
        orb.position.x = Math.random() * 80 + 10;
        orb.position.z = Math.random() * 80 + 10;
        orb.position.y = noisejs.perlin2(orb.position.x/100, orb.position.z/100)*scale + 8;
        scene.add(orb);
    }
    if(Math.random() < 0.001) {// one in one thousand
        let col = new THREE.Color().setHSL(0, 0.6, 0.6);
        for(let i=0; i<8; i++) {
            let ringIndex = 50 + i*10;
            let ring = new THREE.Mesh(new THREE.RingBufferGeometry(ringIndex, ringIndex+10, 16, 1), new THREE.MeshBasicMaterial({color: col}));
            ring.position.x = -100;
            ring.position.z = -100;
            ring.position.y = 0;
            ring.lookAt(camera.position);
            scene.add(ring);
            col = col.offsetHSL(1/8, 0, 0);
        }
    }
}

function render() {
    renderer.clearDepth();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    renderer.render(scene, camera);
}

function saveCanvas(name) {
    return new Promise((resolve, reject) => {
        let path = `${__dirname}/out/${name}.png`;
        let out = fs.createWriteStream(path);
        let stream = canvas.pngStream();
        
        stream.on('data', function(chunk){
          out.write(chunk);
        });
        
        stream.on('end', function(){
          console.log('saved png', name);
          out.end();
          resolve(path);
        });
    });
}

// main
let testMode = process.argv.indexOf('--test') > 0;

init();

if(testMode) {
    let p = Promise.resolve();
    for(let i=0; i<4; i++) {
        p = p.then(() => {
            animate();
            render();
            return saveCanvas(i);
        });
    }
} else {
    let Twitter = require('./twitter/twitter.js');
    let twitter = new Twitter(JSON.parse(fs.readFileSync('./creds.json')));
    
    // high quality nlp
    let who = ['you see', "you've found", 'you come across'];
    let where = ['a sunny field', 'some rolling hills'];
    let what = ['with many flowers', 'full of color'];
    let why = ['and it makes you happy.', 'and it is peaceful.'];
    
    let tweetCanvas = () => {
        return new Promise((resolve, reject) => {
            let buf = canvas.toBuffer();
        
            twitter.post('media/upload', { media: buf }, (err, data, res) => {
                if(err) return reject(err);
                console.log('media uploaded');
                
                let mediaId = data.media_id_string;
                
                let altText = [pickRandom(who), pickRandom(where), pickRandom(what), pickRandom(why)].join(' ');
                let params = {
                  media_id: mediaId,
                  alt_text: { text: altText }
                };
                
                twitter.post('media/metadata/create', params, (err, data, res) => {
                    if(err) return reject(err);
                    console.log('metadata uploaded');
                    
                    params = {
                        status: '',
                        media_ids: mediaId
                    };
                    twitter.post('statuses/update', params, (err, data, res) => {
                        if(err) return reject(err);
                        console.log('successfully tweeted');
                        resolve();
                    });
                });
                
            });
        });
    };
    
    let doTweeting = () => {
        animate();
        render();
        tweetCanvas().catch((err) => console.log(err));
    };
    setInterval(doTweeting, 30*60*1000);
    doTweeting();
}
