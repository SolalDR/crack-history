import React from 'react';
import hocScale from "./withScale";
import * as THREE from "three";
import Raf from "./../../Raf/Raf"
import MatCapMaterial from "./../../../scripts/components/materials/MatCapMaterial";

class HumanScale extends React.Component {
  constructor(props){
    super(props);
    this.state = {};
  }

  componentWillMount(){
    this.loader = new THREE.TextureLoader().load("images/molecule_matcap.jpg", (texture)=>{
      var mesh = new THREE.Mesh(
        new THREE.BoxGeometry(3, 3, 3),
        new MatCapMaterial({ matcap: texture })
      );
  
      this.props.group.add(mesh);
    });
  }

  componentWillReceiveProps(){

    if( (this.props.currentScale === "human" && this.props.previousScale === "micro") ||
         this.props.currentScale === "micro"  ){
      this.props.group.scale.x = 1 + (2 - this.props.visibility*2);
      this.props.group.scale.y = 1 + (2 - this.props.visibility*2);
      this.props.group.scale.z = 1 + (2 - this.props.visibility*2);
      return; 
    }
   
    if( this.props.currentScale === "human" || 
        this.props.currentScale === "macro" ){
      this.props.group.scale.x = this.props.visibility;
      this.props.group.scale.y = this.props.visibility;
      this.props.group.scale.z = this.props.visibility;
      return;
    }

  }

  render(){ return (
    <Raf>{
        ()=>{
            
        }
    }</Raf>
    ); 
  }

  loop(){
      
  }
}

export default hocScale(HumanScale);
