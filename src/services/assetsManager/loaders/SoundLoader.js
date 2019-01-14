import {Howl, Howler} from "howler";

/**
 * @author SolalDR / https://solaldussout-revel.fr/
 */


class SoundLoader  {

	load( url, onLoad, onProgress, onError ) {
    var sound = new Howl({
      src: url
    });

    sound.once('load', () => {
      onLoad(sound)
    });
	}

};

export default SoundLoader;
