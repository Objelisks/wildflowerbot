/* global THREE, Noise */

let THREE = require('./three.js');
let Noise = require('noisejs').Noise;
let noisejs = new Noise();

let flowers = {};


let colorer = {
  'rainbow': (basis) => {
    basis = basis ? basis : new THREE.Color(0x0).offsetHSL(Math.random(), 0.47, 0.52);
    return (dist) => {
      return new THREE.MeshBasicMaterial({color: new THREE.Color(basis).offsetHSL(0.15*Math.random(), -dist/3000, 0), side: THREE.DoubleSide });
  }},
  'pastel': (basis) => {
    basis = basis ? basis : new THREE.Color(0x0).offsetHSL(Math.random(), 0.47, 0.75);
    return (dist) => {
      return new THREE.MeshBasicMaterial({color: new THREE.Color(basis).offsetHSL(0.15*Math.random(), -dist/3000, 0), side: THREE.DoubleSide });
  }},
  'grass': (basis) => {
    basis = '#316B24';
    return (dist) => {
      return new THREE.MeshBasicMaterial({color: new THREE.Color(basis).offsetHSL(0.05*Math.random(), -dist/3000, 0), side: THREE.DoubleSide });
    }
  }
};

let builder = {
  'round': () => () => {
    let geo = new THREE.CircleBufferGeometry(1, 8);
    return geo;
  },
  'reed': () => () => {
    let geo = new THREE.CircleBufferGeometry(0.5, 2, Math.PI*0.3, Math.PI*0.4);
    geo.scale(1, 8, 1);
    geo.translate(0,0,0);
    return geo;
  },
  'daisy': () => () => {
    let geo = new THREE.CircleBufferGeometry(0.3, 5);
    geo.translate(0, 1.5, 0);
    return geo;
  },
  'grassShadow': () => () => {
    let geo = new THREE.TetrahedronGeometry(0.5);
    let geo2 = new THREE.TetrahedronGeometry(0.5);
    geo2.rotateX(Math.random()*6);
    geo2.rotateZ(Math.random()*6);
    geo2.translate(Math.random(), Math.random(), Math.random());
    geo.merge(geo2);
    geo2 = new THREE.TetrahedronGeometry(0.5);
    geo2.rotateX(Math.random()*6);
    geo2.rotateZ(Math.random()*6);
    geo2.translate(Math.random(), Math.random(), Math.random());
    geo.merge(geo2);
    return geo;
  }
};

let placement = {
  'field': (variation) => (x, y) => {
    let s = x + (Math.random()*2-1)*variation;
    let t = y + (Math.random()*2-1)*variation;
    s = Math.abs(s) % 100;
    t = Math.abs(t) % 100;
    return {
      x: s,
      y: noisejs.perlin2(s/100, t/100)+0.01,
      z: t
    }
  },
  'grouped': (variation) => (x, y) => {
    let s = x + (Math.random()*2-1)*variation;
    let t = y + (Math.random()*2-1)*variation;
    s = Math.abs(s) % 100;
    t = Math.abs(t) % 100;
    return {
      x: s,
      y: noisejs.perlin2(s/100, t/100) - Math.max(0, noisejs.perlin2(-s/100, -t/100)),
      z: t
    }
  },
  'perlin': (variation) => (x, y) => {
    let s = x + (Math.random()*2-1)*variation + noisejs.perlin2(x/100, y/100)*100;
    let t = y + (Math.random()*2-1)*variation + noisejs.perlin2(-x/100, -y/100)*100;
    s = Math.abs(s) % 100;
    t = Math.abs(t) % 100;
    return {
      x: s,
      y: noisejs.perlin2(s/100, t/100),
      z: t
    }
  }
};

let rando = function(items) {
  let index = Object.keys(items)[Math.floor(Math.random()*Object.keys(items).length)];
  return items[index];
}

flowers.generate = function({camera, seed = 0, color, density = 1.0, scale = 1, colorType, buildType, placeType}) {
  noisejs.seed(seed);
  
  let flavor = (colorType ? colorer[colorType] : rando(colorer))(color);
  let build = (buildType ? builder[buildType] : rando(builder))();
  let place = (placeType ? placement[placeType] : rando(placement))(4.0);
  
  let group = new THREE.Object3D();
  
  let geo = build();
  
  let distTest = new THREE.Vector3();
  for(let x=0; x<100; x+=1/density) {
    for(let y=0; y<100; y+=1/density) {
      let pos = place(x, y);
      pos.y *= scale;
      let dist = camera.position.distanceTo(distTest.copy(pos));
      let mat = flavor(Math.pow(dist, 1.4));
      let mesh = new THREE.Mesh(geo, mat);
      mesh.position.copy(pos);
      mesh.lookAt(camera.position);
      group.add(mesh);
    }
  }
  
  return group;
}

module.exports = flowers;