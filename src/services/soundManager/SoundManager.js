import {Howler} from 'howler'
import SoundEffectManager from './SoundEffectManager'
import config from './config'

class SoundManager {

  /**
   * @constructor
   * @property {Map} sounds Howler Sounds lists in manager
   * @property {Map} playingSounds Currently playing sounds
   * @property {float} volume Global volume
   * @property {Howler} howler Main Howler
   * @property {SoundEffectManager} soundEffectManager Effect manafer
   */
  constructor(){
    this.sounds = new Map();
    this.playingSounds = new Map();
    this._volume = 0;
    this.defaultVolume = 0;
    this.howler = null;
    this.soundEffectManager = null;

    // init on dom content loaded to get audio context
    document.addEventListener("DOMContentLoaded", this.init.bind(this));
  }
  
  /**
   * init sound effect
   */
  init() {
    this.howler = Howler;
    this.soundEffectManager = new SoundEffectManager();
    this.volume = this.defaultVolume = config.globalVolume;
  }

  get volume() {
    return this._volume;
  }

  set volume(v) {
    Howler.volume(v);
    this._volume = v
  }

  /**
   * Set volume to its default value
   */
  setDefaultVolume() {
    this.volume = this.defaultVolume;
  }

  /**
   * Play sounds
   * We can pass a name or an array of names with sprite names
   * @param {Array.<string[]>|String} soundNames Array of Strings or String of sound names
   * @param {String} spriteName Sound sprite name
   * @param {Object} options Sound play options apply once
   * @param {Number} options.volume Volume from 0 to 1
   * @param {Boolean} options.loop Sound looping
   * @return {Promise}
   */
  play(soundNames, spriteName, options) {
    if(Array.isArray( soundNames )) {
      soundNames.forEach(sound => {
        // if sound sprite
        if(Array.isArray(sound)) {
          this._play(sound[0], sound[1], options);
        } else {
          this._play(sound, undefined, options);
        }
      })
    } else {
      return this._play(soundNames, spriteName, options);
    }
  }

  /**
   * Play a sound
   * @private
   * @param {String} name main sound name
   * @param {String} spriteName sprite sound name
   * @param {Object} options Sound play options apply once
   * @param {Number} options.volume Volume from 0 to 1
   * @param {Boolean} options.loop Sound looping
   * @param {Number} options.delay play delay in seconds
   * @return {Promise}
   */
  _play(name, spriteName, options = {
    delay: 0
  }) {
    var sound, id;
    var soundName = name;
    if(spriteName) {
      soundName = this.getSpriteSoundName(name, spriteName);
    }
    sound = this.getSound(soundName);
    if(this.playingSounds.has(name)) return;
    
    setTimeout(() => {
      // get id
      id = sound.play(spriteName ? spriteName : undefined);
    
      // set volume
      sound.volume(options.volume ? options.volume : sound.defaultVolume); 
      
      // add name and id to playingSound
      this.playingSounds.set(soundName, id);
    }, options.delay * 1000)

    // return promise on sound ended
    return new Promise((resolve, reject) => {
      sound.on('end', () => {
        resolve({soundName, id, sound});
        // Remove from playing list when the sound finishes playing.
        if(this.playingSounds.has(soundName)) {
          this.playingSounds.delete(soundName); 
        }   
      }, id);
    });
  }

  /**
   * Stop sounds
   * Sounds can be faded before stop
   * @param {String[]|Array.<string[]>|String} soundNames Array of String or of String array for sprite id or String of sound names
   * @param {String} spriteName String of sprite name
   * @param {Boolean} fade  Stop with fade
   */
  stop(soundNames, spriteName = null, fade = false) { 
    if( Array.isArray( soundNames )) {
      soundNames.forEach(sound => {
        // if sound sprite
        if(Array.isArray(sound)) {
          this._stop(sound[0], sound[1], fade);
        } else {
          this._stop(sound, undefined, fade);
        }
      })
    } else {
      this._stop(soundNames, spriteName, fade);
    }
  }


  /**
   * Stop sounds
   * Sounds can be faded before stop
   * @private
   * @param {String} name main sound name
   * @param {String} spriteName sprite sound name
   * @param {Boolean} fade  Stop with fade
   */
  _stop (name, spriteName, fade) {
    var sound, id;
    if(spriteName) {
      id = this.playingSounds.get(this.getSpriteSoundName(name, spriteName));
    } else {
      id = this.playingSounds.get(name);
    }
    
    if(spriteName) {
      sound = this.getSpriteSound(name, spriteName);
    } else {
      sound = this.getSound(name);
    }
    // if is fade fade out, stop sound and remove on events
    if(fade) {
      this.fade(sound, 'out', 1000, id);
      sound.once('fade', () => {
        sound.stop(id);
        sound.off('end');
      });
    } else {
      sound.stop(id);
      sound.off('end');
    }
    if(spriteName) {
      this.playingSounds.delete(this.getSpriteSoundName(name, spriteName));  
    } else {
      this.playingSounds.delete(name);
    }
  }

  /**
   *
   * @param {Howler} sound Sound object to fade 
   * @param {Number} from Volume to fade from
   * @param {Number} to Volume to fade to
   * @param {Number} duration Fade duration
   * @param {String|Number} id sprite or sound id  
   */
  fade(sound, type, duration = 1000, id = null) {
    var from,to;
    if(type === 'in') {
      from = 0;
      to = sound.volume();
    } else if(type === 'out') {
      from = sound.volume();
      to = 0;
    } else {
      console.error('define fade type "in" or "out"');
    }    
    if(id) {
      sound.fade(from, to, duration, id)
    } else {
      sound.fade(from, to, duration)
    }
  }

  /**
   * Get a sound from this.sounds[] by its name
   * @param {String} name 
   */
  getSound(name) {
    const sound = this.sounds.get(name);
    if(sound) {
      return this.sounds.get(name);
    } else {
      console.error('sound', name, 'not found');
      return null;
    }
  }

  /**
   * Update currently playing sounds  
   * @param {Object} soundsData soundsData to update from
   */
  updatePlayBack(soundsData) {
    // add new sounds
    //this.add(soundsData);
    // Assign new options
    soundsData.forEach(data => {
      if(data.options) {
        var sound;
        if(data.spriteName) {
          sound = this.getSpriteSound(data.name, data.spriteName);
        } else {
          sound = this.getSound(data.name);
        }
        this.assignOptions(sound, data.options);
      }
    })

    // Stop sounds not playings
    this.playingSounds.forEach((id, name) => {  
        
      // If playing sound not in input sound datas
        if( !soundsData.find(soundData => soundData.name === name) ) {
          const soundName = this.splitSpriteName(name);
          
          // if is sprite sound
          if(soundName[1]) {
            // find sprite sound from input data
            const tmpSoundData = soundsData.find(soundData => soundData.name === soundName[0]);
            // if main sound found compare spritenames and stop if differents
            if(!tmpSoundData || tmpSoundData.spriteName !== soundName[1]) {
              this.stop(soundName[0], soundName[1], true);
            }
          } else { 
            this.stop(name, null, true);
          }
        }
    })

    // play added sounds
    soundsData.forEach(data => { 
      if(data.spriteName) {
        this.play(data.name, data.spriteName);
      } else {
        this.play(data.name);
      }
    })
  }

  /**
   * Add
   * @param {Object[]|Objet} soundsData Can be Object Array or Object of sound datas 
   * @param {string} soundsData.name Sound name
   * @param {Howl} soundsData.sound Howler sound entity
   * @param {Object} soundsData.options Howler sound options
   */
 add(soundsData){
   const add = (data) => {
    if(data.sprite) {
      this.addSpriteSound(data, data.sprite);
    } else if (!this.sounds.has(data.name)) {
      const soundObject = this.assignOptions(data.sound, data.options);
      this.sounds.set(data.name, soundObject);
    }
   }
   if( Array.isArray( soundsData )) {
    soundsData.forEach((data) => {
      add(data);
    });
   } else {
      add(soundsData);
   }
 }

 /**
  * Add sound object from sprite
  * # Sound Object name : soundName.spriteName
  * @param {Object} data Object of sound datas 
  * @param {Object} sprite Howler sprite object
  */
 addSpriteSound(data, sprite) {
   Object.keys(sprite).forEach((key,index) => {
    const name = this.getSpriteSoundName(data.name, key);
    if(!this.sounds.has(name)) {
      let soundObject = data.sound;
      if(data.options) {
        soundObject = this.assignOptions(soundObject, data.options);
      }
      soundObject._sprite[key] = sprite[key];
      this.sounds.set(name, soundObject);
    }
   });
 }

  /**
  * Add sprite to sound object
  * @param {String} name sound name
  * @param {String} spriteName sprite sound name
  */
  getSpriteSound(name, spriteName) {
    return this.getSound(this.getSpriteSoundName(name, spriteName));
  }

  splitSpriteName(name) {
    return name.split('.');
  }

  /**
   * Get sprite sound name 
   * @param {String} name main sound name
   * @param {String} spriteName sprite name in main sound 
   */
  getSpriteSoundName(name, spriteName) {
    return name + '.' + spriteName;
  }

  // TODO: unused
  /**
   * Remove a sound by is name
   * @param {string} name sound name 
   */
  removeSound(name){
    var sound = this.getSound(name);
    this.fade(sound, 'out');
    sound.once('fade', () => {
      sound.stop();
      this.sounds.delete( name );
    });
  }

  // TODO: unused
  /**
   * Update sounds
   * @param {*} sounds 
   */
  updateSounds(soundsData){
    // add sounds
    this.add(soundsData);

    // remove sounds 
    this.sounds.forEach((sound, name) => {
      if( !soundsData.find(elementTmp => elementTmp.name === name) ) {
        this.removeSound(name);
      }
    });
  }

  /**
   * Assign options to Howl Object
   * @param {Howl} sound Howl object
   * @param {Object} options
   * @return {Howl}
   */
  assignOptions(sound, options = null) {
    Object.entries(options).forEach(([key, value]) => {
      sound['_' + key] = value;
    });
    sound.defaultVolume = options.volume || 1;
    return sound;
  }

  // Effects
  // ======================================

  /**
   * @param {String} name effect name
   */
  addEffect(name) {
    this.soundEffectManager.addEffect(name);
  }

  /**
   * @param {String} name effect name 
   */
  removeEffect(name) {
    this.soundEffectManager.removeEffect(name);
  }

  removeAllEffects() {
    this.soundEffectManager.removeAllEffects(); 
  }

  /**
   * Set effect intensity 
   * @param {String} name effect name
   * @param {Number} advancement value between 0 and 1
   */
  setEffectIntensity(name, advancement) {
    this.soundEffectManager.effects[name].setIntensity(advancement);
  }

}

export default new SoundManager();
