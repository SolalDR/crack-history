import Step from "./../../Step";
import AssetsManager from "~/services/assetsManager/AssetsManager"
import config from "./config";
import Water from "../../../components/Water";
import Renderer from "~/webgl/rendering/Renderer"
import ModelAnimationManager from "../../../manager/ModelAnimation";

/**
 * @constructor
 * @param {int} id
 */
export default class extends Step {
  constructor(params){
    super(params, ["background", "cube", "water", "leaf"]);
  }
  /**
   * This method initialize the step and 
   * @param {Step} previousStep previous step in History
   */
  init( previousStep ) {
    super.init(config, previousStep);
    this.display(previousStep, AssetsManager.loader.getFiles("chapter-1"));
  }

  display( previousStep = null, ressources ) {
    this.displayHumanScale( ressources, previousStep );
    super.display( ressources );
  }

  /**
   * Init human scale scene 
   * @param {*} event
   */
  displayHumanScale( ressources, previousStep ){
    this.main = new THREE.Mesh( new THREE.BoxGeometry(), new THREE.MeshPhongMaterial({ color: 0xFF0000 }) );
    this.main.name = "cube";
    this.leaf = ressources.step_1_human_leaf.result;
    this.leaf.name = config.modelAnimation.name;
    this.main.name = "step_1_human_leaf"

    this.water = new Water({ renderer: Renderer.renderer });
    this.water.mesh.position.y = -5;
    this.water.mesh.position.z = 7;
    this.water.mesh.name = "water-step-3";

    this.initGUI();

    this.scene.humanScale.group.add(this.water.mesh)
    this.scene.humanScale.group.add(this.main);
    this.scene.humanScale.group.add(this.leaf.scene);

    ModelAnimationManager.generateClips(this.leaf, config.modelAnimation.clips, config.modelAnimation.options)
    ModelAnimationManager.play('cut');
  }


  initGUI(){
    if( !this.folder.water ){
      this.folder.water = this.gui.addFolder("Water");
      var a = { explode: () => { this.water.drop(Math.random(), Math.random(), Math.random()*0.5 + 0.5) } }

      this.folder.water.addMesh("Water mesh", this.water.mesh);
      this.folder.water.add(this.water.heightmapVariable.material.uniforms.mouseSize, "value", 0, 0.5).name("Size")
      this.folder.water.add(this.water.heightmapVariable.material.uniforms.viscosityConstant, "value", 0, 0.1).name("viscosityConstant")
      this.folder.water.add(this.water.heightmapVariable.material.uniforms.gravityConstant, "value", 0, 20).name("gravityConstant")
      this.folder.water.add(a, "explode");
      this.folder.water.add(this.water.mesh.material.uniforms.opacity, "value", 0, 1)
    }
  }

  hide(newStep) {
    var toRemove = this.getRemovableObject(newStep);
    if ( toRemove.includes("cube") ){
      this.scene.humanScale.group.remove(this.main);
    }

    if ( toRemove.includes("background") ){
      this.scene.humanScale.group.remove(this.background);
    }

    if ( toRemove.includes("water") ){
      this.scene.humanScale.group.remove(this.water.mesh);
    }

    super.hide(newStep);
  }

  loop(){
    super.loop();
    this.water.render();
  }
}
