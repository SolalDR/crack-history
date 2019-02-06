import baseConfig from "./../../config";

export default baseConfig.extends({
  background: new THREE.Color(0xf2f3ee),
  human: {
    rendering: {
      light: {
        primary: {
          position: new THREE.Vector3(5, 15, 5)
        }
      }
    }
  },
  modelAnimation: {
    name : 'step_1_human_leaf',
    options: {
      timeScale: 0.0009
    },
    clips: [
      {
        name: 'cut',
        firstFrame: 213,
        lastFrame: 264,
      }
    ]
  },
  sounds: [
    {
      name : "chapter_1_main_voice",
      sprite: {
        step_3: [
          39000,
          28000
        ],
      },
      options : {
        volume: 0.9
      } 
    },
    {
      name : "step_1_background_sound"
    }
  ]
})
