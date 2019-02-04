import SimplexNoise from "simplex-noise";

class LeafCloud {
  constructor({
    map = null,
    roughness = null,
    normal = null,
    alpha = null
  } = {}){
    var boxGeometry = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    var material = new THREE.MeshStandardMaterial({ 
      map, 
      roughnessMap: roughness, 
      normalMap: normal,
      alphaMap: alpha, 
      transparent: true, 
      opacity: 1,
      side: THREE.DoubleSide,
      alphaTest: 0.01
    });

    this.count = 100;

    var cluster = new THREE.InstancedMesh(  boxGeometry, material, this.count, true, false );

    var _v3 = new THREE.Vector3();
    var _q = new THREE.Quaternion();
    
    this.items = [];    
    for ( var i = 0 ; i < this.count ; i ++ ) {
      this.items.push({
        position: new THREE.Vector3( Math.random() , Math.random(), Math.random() ),
        rotation: _q.clone()
      })
      cluster.setQuaternionAt( i , this.items[i].rotation );
      cluster.setPositionAt( i , this.items[i].position );
      cluster.setScaleAt( i , _v3.set(1,1,1) );
    }
    this.noise = new SimplexNoise();
    this.object3D = cluster;
    
  }

  render(time){
    var timeRotation = time * 10.;
    this.items.forEach((item, i) => {
      this.object3D.setQuaternionAt( i , new THREE.Quaternion(
        this.noise.noise2D(item.rotation.x + i*0.5, timeRotation),
        this.noise.noise2D(item.rotation.y + i*0.5, timeRotation),
        this.noise.noise2D(item.rotation.z + i*0.5, timeRotation),
        this.noise.noise2D(item.rotation.w + i*0.5, timeRotation)
      ) );
      this.object3D.setPositionAt( i , new THREE.Vector3(
        this.noise.noise2D(item.position.x + i*0.5, time) * 15,
        this.noise.noise2D(item.position.y + i*0.5, time) * 10,
        this.noise.noise2D(item.position.z + i*0.5, time) * 10
      ) );
    })
    // console.log(this.object3D.geometry);
    // con
    this.object3D.needsUpdate("position");
    this.object3D.needsUpdate("quaternion");
  }
}

export default LeafCloud;
