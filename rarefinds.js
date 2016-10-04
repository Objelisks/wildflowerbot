let THREE = require('./three.js');
let noisejs = new (require('noisejs').Noise)();

let rarefinds = {};
let OCTOBER = 9; // spoopy

let finds = [
    {
        // NON EVIL ORB
        chance: 0.01,
        generate: ({camera, seed, scale}) => {
            noisejs.seed(seed);
            let orb = new THREE.Mesh(new THREE.SphereBufferGeometry(4, 16, 16), new THREE.MeshBasicMaterial({color: '#000'}));
            orb.position.x = Math.random() * 80 + 10;
            orb.position.z = Math.random() * 80 + 10;
            orb.position.y = noisejs.perlin2(orb.position.x/100, orb.position.z/100)*scale + 8;
            return orb;
        }
    },
    {
        // rainbow
        chance: 0.008,
        generate: ({camera, seed, scale}) => {
            let group = new THREE.Object3D();
            let col = new THREE.Color().setHSL(0, 0.6, 0.6);
            for(let i=0; i<8; i++) {
                let ringIndex = 50 + i*10;
                let ring = new THREE.Mesh(new THREE.RingBufferGeometry(ringIndex, ringIndex+10, 16, 1), new THREE.MeshBasicMaterial({color: col}));
                ring.position.x = -100;
                ring.position.z = -100;
                ring.position.y = 0;
                ring.lookAt(camera.position);
                group.add(ring);
                col = col.offsetHSL(1/8, 0, 0);
            }
            return group;
        }
    },
    {
        // fairy ring
        chance: 0.02,
        generate: ({camera, seed, scale}) => {
            noisejs.seed(seed);
            let group = new THREE.Object3D();
            let x = Math.random() * 60 + 20;
            let z = Math.random() * 60 + 20;
            let ringRadius = Math.random() * 15 + 3;
            for(let i=0; i<32; i++) {
                let col = new THREE.Color('#E3DAAB').offsetHSL((Math.random()-0.5)*0.3, 0, 0);
                let size = Math.random()+0.5;
                let mat = new THREE.MeshBasicMaterial({color: col});
                let capgeo = new THREE.SphereBufferGeometry(0.6*size, 6, 3, 0, 2*Math.PI, 0, Math.PI/2);
                let stemgeo = new THREE.BoxGeometry(0.2*size, 1*size, 0.2*size);
                let cap = new THREE.Mesh(capgeo, mat);
                let stem = new THREE.Mesh(stemgeo, mat);
                let angle = Math.random()*Math.PI*2;
                stem.position.x = x + Math.cos(angle) * (ringRadius+Math.random()*4);
                stem.position.z = z + Math.sin(angle) * (ringRadius+Math.random()*4);
                stem.position.y = noisejs.perlin2(stem.position.x/100, stem.position.z/100)*scale + 0.5*size;
                cap.position.copy(stem.position);
                cap.position.y += 0.5*size;
                group.add(cap);
                group.add(stem);
            }
            
            return group;
        }
    },
    {
        // punkin
        chance: new Date().getMonth() === OCTOBER ? 0.3 : 0.001,
        generate: ({camera, seed, scale}) => {
            noisejs.seed(seed);
            let group = new THREE.Object3D();
            let punkinMat = new THREE.MeshBasicMaterial({color: '#C17A44'});
            let punkinFaceMat = new THREE.MeshBasicMaterial({color: '#000000'});
            let punkinStemMat = new THREE.MeshBasicMaterial({color: '#9CC85B'});
            for(let i=0; i<8; i++) {
                let ob = new THREE.Object3D();
                let punkin = new THREE.TorusBufferGeometry(3, 8, 12, 8);
                punkin.rotateX(Math.PI/2);
                let face1 = new THREE.OctahedronGeometry(2);
                face1.translate(-2.9, 2.71, 8.88);
                let face2 = new THREE.OctahedronGeometry(2);
                face2.translate(4.05, 2.62, 8.39);
                let face3 = new THREE.TorusBufferGeometry(3, 2, 4, 6, 3);
                face3.rotateX(Math.PI/2);
                face3.translate(0.19, -2.92, 5.96);
                let stem = new THREE.OctahedronGeometry(2);
                stem.translate(0, 7.7, 0);
                ob.add(new THREE.Mesh(punkin, punkinMat));
                ob.add(new THREE.Mesh(face1, punkinFaceMat));
                ob.add(new THREE.Mesh(face2, punkinFaceMat));
                ob.add(new THREE.Mesh(face3, punkinFaceMat));
                ob.add(new THREE.Mesh(stem, punkinStemMat));
                ob.scale.set(0.2, 0.2, 0.2);
                ob.rotateY(Math.random()*Math.PI*2);
                ob.position.x = Math.random() * 80 + 10;
                ob.position.z = Math.random() * 80 + 10;
                ob.position.y = noisejs.perlin2(ob.position.x/100, ob.position.z/100)*scale + 2;
                group.add(ob);
            }
            return group;
        }
    }];

rarefinds.generateRarefinds = function(generatorParams) {
  return finds.reduce((list, find) => {
    if(Math.random() < find.chance) {
      list.push(find.generate(generatorParams));
    }
    return list;
  }, []);
};

module.exports = rarefinds;
