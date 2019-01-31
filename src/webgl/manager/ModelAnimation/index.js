import Event from "~/helpers/Event"; 
import ClipAnimationUtils from "../../helpers/ClipAnimationUtils";

class ModelAnimationManager extends Event {
    
  constructor(){
    super();
    this.models = new Map();
    this.activeModel = null;
  }

  generateClips(model, clipsData, options = {}) {
    
    const modelAnim = this._getModelAnim(model, options);

    // create clips from clips data
    for (var i = 0; i < clipsData.length; i++) { 
      const clipData = clipsData[i];
      if(!modelAnim.clips.find(clip => clip.name === clipData.name)) {
        const clip = this._createClip(modelAnim, clipData);
        modelAnim.clips.push(clip);
      }
    }

    // set first clip has current action
    modelAnim.currentAction = clipsData[0].animation;
    
    // add modelAnim to list
    this.models.set(modelAnim.name, modelAnim);

    // set modelAnim to active
    this.activeModel = modelAnim;
  }

  _getModelAnim(model, options) {
    // find if already exist
    let modelAnim = this.models.get(model.name);

    // if not create new modelAnim

    // TODO: create modelAnim
    if(!modelAnim) {
      modelAnim = {
        name : model.name,
        mixer: new THREE.AnimationMixer(model.scene),
        clips: [],
        currentAction: null,
        running: false
      } 
    }

    // set options
    if(options.timeScale) modelAnim.mixer.timeScale = options.timeScale;

    // set main clip
    modelAnim.mainClip = {
      name: 'main',
      animation : modelAnim.mixer.clipAction( model.animations[0] )
    }
    return modelAnim
  }

  _createClip(modelAnim, clipData) {
    const clip = clipData;
    const loopType = clip.loop !== undefined ? clip.loop : THREE.LoopOnce;
    clip.animation = modelAnim.mixer.clipAction(ClipAnimationUtils.subclip(modelAnim.mainClip.animation._clip, clipData.name , clipData.firstFrame, clipData.lastFrame ));
    clip.animation.setLoop( loopType );
    clip.animation.clampWhenFinished = true;
    return clip;
  }
  
  clear() {
    this.activeModel = null;
    this.models.clear();
  }

  playFrom(modelName, clipName) {
    return this._play(modelName, clipName);
  }

  play(clipName) {
    return this._play(this.activeModel.name, clipName);
  }

  _play(modelName, clipName) {
  
    var modelAnim = this.models.get(modelName);
    var lastAction = modelAnim.currentAction;

    
    // if(lastAction.isRunning()) {
    //   console.log('last action still running');
    //   console.log('lastAction', lastAction);
    //   return;
    // }

    var mixer;
    var activeAction;
    var activeAnimation;

    // set modelAnim running
    modelAnim.running = true;

    // if no clipName, set mainClip, else set clip from param name 
    if(!clipName) {
      activeAnimation = modelAnim.mainClip 
    } else {
      activeAnimation = modelAnim.clips.find(u => u.name === clipName);
    }

    console.log('calling', clipName, 'to play');

    activeAction = activeAnimation.animation;
    mixer = activeAction.getMixer();

    if(activeAction === lastAction) {
        activeAction.stop().play();
    } else {
        activeAction.play();
        lastAction.stop();
    }

    // set currentAction
    modelAnim.currentAction = activeAction;
    console.log('-- running action', activeAction.getClip().name);
    console.log(this);

    // anim chain
    const isLooping = activeAction.loop === THREE.LoopRepeat;
    const eventLabel = isLooping ? 'loop' : 'finished';
    return new Promise(function(resolve, reject) {
      mixer.addEventListener(eventLabel, () => {
        // remove event listener if stop
        resolve();
        if (!isLooping) modelAnim.running = false;
      }, {once: true});
    });
  }

  // FIXME: stop not reseting animation
  stopAll() {
    if ( this.models.size > 0 ) {
      for (var model of this.models.values()) {
        if(model.running) {
          //model.mixer.stopAllAction();
          for(var clip of model.clips) {
            clip.animation.stop();
          }
          model.running = false;
        } 
      }
      model.mainClip.animation.play().stop();
    }
  }

  stopCurrent(modelName) {
    const model = this.models.get(modelName) ? this.models.get(modelName) : this.activeModel ;
    if(!model) return;
    model.currentAction.stop().stopFading();
    

    // TEST
    model.currentAction.stop().stopFading();
    model.mixer.stopAllAction();
    const mixer = model.currentAction.getMixer();
    mixer.stopAllAction();
    //

    // FIXME: find a better way to reset animation
    model.mainClip.animation.play().stop();

    model.running = false;
    console.log('anim after stop', this);
  }

  update(delta) { 
    if ( this.models.size > 0 ) {
      for (var model of this.models.values()) {
        if(model.running) model.mixer.update(delta);
      }
    }
  }
}

export default new ModelAnimationManager();
