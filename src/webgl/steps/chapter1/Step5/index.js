import Step from "./../../Step";
import AssetsManager from "~/services/assetsManager/AssetsManager"
import config from "./config";
import SoundManager from "../../../../services/soundManager/SoundManager";
import SimplexNoise from "simplex-noise";
import Renderer from "~/webgl/rendering/Renderer"
import { AnimationManager, Animation } from "../../../manager";
import { Mixer } from "../../../manager/Animation";
import AbilitiesManager from "../../../../services/AbilitiesManager";

/**
 * @constructor
 * @param {int} id
 */
export default class extends Step {
  constructor(params){
    super(params, ["background"]);
    this.simplex = new SimplexNoise();
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
    super.beforeDisplay( ressources, previousStep );
    this.displayHumanScale( ressources, previousStep );
    super.display( ressources );
  }

  /**
   * Init human scale scene 
   * @param {*} event
   */
  displayHumanScale( ressources, previousStep ){
    if( previousStep.rank === this.rank - 1 ){
      this.pasta = previousStep.pasta;
      this.water = previousStep.water;
      this.particleCloud = previousStep.particleCloud;
    } else {
      SoundManager.removeEffect('moogfilter');
    }

    // Start sounds
    SoundManager.play('chapter_1_main_voice', 'step_5', {
      delay: 2
    })
    SoundManager.play('chapter_1_trigger', 'step_5_02_h1_ajout_acide', {
      delay: 1
    }).then(() => {
    })    

    // Pasta
    this.pasta.noiseRocksIntensity = 0;

    // Water
    this.water.mesh.position.y = -10;
    this.water.mesh.material.uniforms.diffuse.value = new THREE.Color("rgb(128, 128, 128)");
    
    // Particle clouds
    this.particleCloud.object3D.material.uniforms.u_size.value = 0;
    this.particleCloud.config.speed = 20 * 0.00001;
    this.particleCloud.object3D.position.y = -20;
    this.particleCloud.material.uniforms.u_color.value = new THREE.Color("rgb(255,255,255)");

    this.scene.humanScale.group.add(this.water.mesh);
    this.scene.humanScale.group.add(this.particleCloud.object3D);

    // Wait and drop a water
    setTimeout(()=>{
      this.water.drop(0, -3, 0.3);

      // water drop sound
      SoundManager.play('chapter_1_trigger', 'step_3_03_entree_eau').then(() => {
        SoundManager.addEffect('moogfilter');
        console.log(SoundManager.soundEffectManager);
        SoundManager.play('chapter_1_trigger', 'step_5_03_reaction_chimique', {
          delay: 1
        }).then(() => {
          SoundManager.play('chapter_1_trigger', 'step_5_04_h2_pouah_odeur').then(() => {
            SoundManager.play('chapter_1_trigger', 'step_5_05_h1_toux');
          });
        })      
        SoundManager.play('chapter_1_trigger', 'step_3_04_ambiance_eau', {
          delay: 1
        })      
      })
    }, 1600);

    // Start diving in water
    AnimationManager.addAnimation(
      new Animation({ duration: 1000, delay: 2000, timingFunction: "easeOutQuad" })
        .on("progress", (event)=>{
          this.water.mesh.position.y = -10 + 8*event.advancement;
          this.particleCloud.object3D.position.y = -20 + 17*event.advancement;
          this.particleCloud.object3D.material.uniforms.u_size.value = 5*event.advancement;
          if( event.advancement > 0.5 ){
            console.log(config)
            Renderer.setBokehFocus(
              THREE.Math.lerp(
                config.human.rendering.bokeh.focus, 
                config.human.water.bokeh.focus, 
                (event.advancement - 0.5) * 2));
          }
        })
        .on("end", ()=>{
          this.water.mesh.position.y = -2;
          this.particleCloud.object3D.position.y = -3;
          Renderer.setBokehFocus(config.human.water.bokeh.focus);

          // explode pasta
          this.pasta.modelAnimation.currentAction.animation.time = this.pasta.modelAnimation.currentAction.animation.getClip().duration;
          this.pasta.modelAnimation.currentAction.animation.paused = false;

          this.pasta.state.animated = true;

          // particle speed
          var fromSpeed = this.particleCloud.config.speed
          AnimationManager.addAnimation(new Animation({duration: 4000})
            .on("progress", (event)=>{
              var a = event.advancement > 0.5 ? 1 - (event.advancement - 0.5)*2 : event.advancement*2
              this.particleCloud.config.speed = fromSpeed + ((20*0.00001) - 50*0.00001)*a
            })  
            .on("end", ()=>{
              this.particleCloud.config.speed = 20*0.00001;
            })
          )

          // Merge pasta to coca
          this.pasta.modelAnimation.play("merge", {
            timeScale: -0.15
          }).then(()=>{
            // Reactivate noise  and animate diffuse
            this.pasta.state.animated = false;
            AnimationManager.addAnimation(new Animation({duration: 2000})
              .on("progress", (event)=>{
                this.pasta.material.uniforms.u_base_color.value = Mixer.color(new THREE.Color(0, 0, 0), new THREE.Color(1, 1, 1), event.advancement);
                this.pasta.noiseRocksIntensity = event.advancement*4;
              })  
              .on("end", ()=>{
                this.pasta.material.uniforms.u_base_color.value = new THREE.Color(1, 1, 1);
                this.pasta.noiseRocksIntensity = 4;

                // Out of water
                var waterSoundEffectRemoved = false;
                setTimeout(()=>{
                  AnimationManager.addAnimation(new Animation({duration: 3500, timingFunction: "easeInOutCubic"})
                    .on("progress", (event)=>{
                      this.water.mesh.position.y = -2 - 15*event.advancement;
                      this.particleCloud.object3D.position.y = -3 - 17*event.advancement;
                      this.particleCloud.object3D.material.uniforms.u_size.value = 5*(1. - event.advancement);
                      this.pasta.noiseRocksIntensity = THREE.Math.lerp(4, 0, event.advancement);

                      // Bokeh
                      if( event.advancement > 0.5 ){
                        Renderer.setBokehFocus(THREE.Math.lerp(
                          config.human.water.bokeh.focus,
                          config.human.rendering.bokeh.focus, 
                          (event.advancement - 0.5) * 2));
                      }
                      if(event.advancement > 0.35 && !waterSoundEffectRemoved) {
                        waterSoundEffectRemoved = true;
                        SoundManager.removeAllEffects();
                        SoundManager.setDefaultVolume();
                      }
                    })
                    .on("end", ()=>{
                      AbilitiesManager.can("all", true);
                      this.water.mesh.position.y = -17;
                      this.particleCloud.object3D.position.y = -20;
                      this.pasta.noiseRocksIntensity = 0;
                      this.pasta.state.animated = true;
                      Renderer.setBokehFocus(config.human.rendering.bokeh.focus);
                      this.pasta.modelAnimation.play("merge", {
                        timeScale: 0.5
                      });

                      // play sound pasta merging
                      SoundManager.play('chapter_1_trigger', 'step_4_04_merge_pasta', {
                        delay: 0.5
                      });                      
                    })
                  )
                }, 1000)

                // Spanish Voices
                SoundManager.play('chapter_1_trigger', 'step_5_06_h1_salut_a').then(() => {
                  SoundManager.play('chapter_1_trigger', 'step_5_07_h2_salut');
                })                

              })
            )
          })
        }
      )
    )


    this.scene.humanScale.group.add(this.pasta.scene);
  }

  hide(newStep) {
    var toRemove = this.getRemovableObject(newStep);

    super.hide(newStep);
  }

  loop(time){
    this.water.render();
    this.particleCloud.render()

    this.pasta.render(time);

    super.loop();
  }
}
