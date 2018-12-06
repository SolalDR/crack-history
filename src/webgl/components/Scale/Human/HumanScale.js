import Scale from "../Scale";
import AssetsManager from "~/services/assetsManager/AssetsManager";
import FitPlane from "./components/FitPlane";
import gui from "~/services/gui";

class HumanScale extends Scale {
 
  /**
   * @constructor
   * @param {THREE.Scene} args.scene
   */
  constructor(args){
    super({...args, name: "human"});
    this.state = {
      ...this.state
    }

    this.init();
  }

  initScene(e){
    this.group.add(e.step_1_human_leaf.result.scene);
    var background = new FitPlane({
      background: e.step_1_background.result, 
      size: 450,
      distance: 100
    });

    e.step_1_human_leaf.result.scene.scale.y = 1.5;
    e.step_1_human_leaf.result.scene.rotation.z = -0.6;
    e.step_1_human_leaf.result.scene.position.x = -7;
    e.step_1_human_leaf.result.scene.position.y = -4;
    gui.addObject3D("Leaf", e.step_1_human_leaf.result.scene, false);


    this.group.add(background.object3D);
  }

  init(){
    super.init();
    if( AssetsManager.loader.isLoaded("chapter-1") ) {
      this.initScene(AssetsManager.loader.getFiles("chapter-1"));
    }
    AssetsManager.loader.once("load:chapter-1", (event) => this.initScene( event ))
  }

  /**
   * @override
   * Raf
   */
  loop(){
    super.loop();
    if( (this.state.currentScale === "human" && this.state.previousScale === "micro") ||
      this.state.currentScale === "micro"  ){
      this.group.scale.x = 1 + (2 - this.state.currentVisibility*2);
      this.group.scale.y = 1 + (2 - this.state.currentVisibility*2);
      this.group.scale.z = 1 + (2 - this.state.currentVisibility*2);
      return;
    }
    
    if( this.state.currentScale === "human" || 
        this.state.currentScale === "macro" ){
      this.group.scale.x = this.state.currentVisibility;
      this.group.scale.y = this.state.currentVisibility;
      this.group.scale.z = this.state.currentVisibility;
      return;
    }
  }
}

export default HumanScale;
