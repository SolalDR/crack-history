import Step from "./../../Step";
import AssetsManager from "~/services/assetsManager/AssetsManager"
import FitPlane from "~/webgl/components/Scale/Human/components/FitPlane"
import SoundManager from "~/webgl/components/SoundManager/SoundManager"
import config from "./config";

/**
 * @constructor
 * @param {int} id
 */
export default class extends Step {

  /**
   * This method initialize the step and 
   * @param {boolean} isNextStep If the step is arriving form the precedent
   */
  init( previousStep ) {
    super.init();
    this.folder = {};
    this.display(previousStep, AssetsManager.loader.getFiles("chapter-1"));
  }

  displayHumanScale( e ){
    this.main = e.step_1_human_leaf.result.scene;
    this.main.name = "main-step-1";
    
    this.scene.humanScale.group.add(this.main);
    var background = new FitPlane({
      background: e.background.result, 
      size: 450,
      distance: 100
    });

    this.main.scale.y = 1;
    this.main.position.x = -1;
    this.main.position.y = -4.5;
    this.main.rotation.z = 0.2;
    // TOFIX: error : " 'Leaf' folder already exist
    //this.folder.leaf = this.gui.addObject3D("Leaf",  this.main, false);

    this.scene.humanScale.group.add(background.object3D);
  }

  display( isNextStep = false, event ) {
    this.displayHumanScale( event );
    super.display();
  }

  hide() {
    this.scene.humanScale.group.remove(this.main);
    // FIXME: error : " 'Leaf' folder already exist
    //this.gui.removeFolder(this.folder.leaf);
    
    SoundManager.stop('step_1_main_sound', true);

    super.hide();
  } 
}
