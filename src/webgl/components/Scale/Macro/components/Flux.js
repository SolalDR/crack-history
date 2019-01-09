
import * as THREE from "three";
import FluxGeometry from "./FluxGeometry"


class Flux {

  static Material = new THREE.MeshBasicMaterial( {
    color: 0xFFFFFF,
    opacity: 1
  });

  constructor(info){
    console.log(info);
    if (!info.attachment && !info.attachment.countries) return null;
    this.group  = new THREE.Group();
    this.group.name = "zoning-" + info.id;
    this.group.visible = false;
    // info.attachment.countries.forEach(element => {
    //   if (countries[element]) {
    //     this.group.add(new THREE.Mesh( countries[element], Zoning.Material ))
    //   }
    // });
  }

  display(){
    this.group.children.forEach(child => {
      child.material.opacity = 1;
      child.material.needsUpdate = true;
    })
    this.group.visible = true;
  }

  hide(){
    this.group.children.forEach(child => {
      child.material.opacity = 0;
      child.material.needsUpdate = true;
    })
    this.group.visible = false;
  }

  updateMaterial(config){
    this.group.children.forEach(mesh => {
      config.forEach((value, index) => {
        mesh.material[index] = value; 
        mesh.material.needsUpdate = true;
      })
    })
  }

}

export default Flux;
