import Step from "./../../Step";
import AssetsManager from "~/services/assetsManager/AssetsManager"
import FitPlane from "~/webgl/components/Scale/Human/components/FitPlane"
import SoundManager from "~/services/soundManager/SoundManager";
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
  init( previousStep ) {
    super.init(config);
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
    // FIXME : add Folder leaf at every display
    this.folder.leaf = this.gui.addObject3D("Leaf",  this.main, false);

    this.scene.humanScale.group.add(background.object3D);
  }

  display( isNextStep = false, event ) {
    this.displayHumanScale( event );

    // Sound
    //
    const soundsData = [
      {
        name : event.step_1_background_sound.name, 
        sound : event.step_1_background_sound.result,
        options : {
          loop: true,
          volume: 0.3
        }
      },
      {
        name : event.step_1_main_sound.name, 
        sound : event.step_1_main_sound.result,
        options : {
          volume: 0.9
        }
      }
    ];
    SoundManager.updatePlayBack(soundsData);

    // display
    super.display();
  }

  hide() {
    this.scene.humanScale.group.remove(this.main);
    this.gui.removeFolder(this.folder.leaf);

    super.hide();
  } 
}
