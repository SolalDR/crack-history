import * as dat from "dat.gui";
import "three-dat.gui";

var gui = new dat.GUI({
  load: JSON,
});


dat.GUI.prototype.addThreeColor=function(obj,varName){
  // threejs & dat.gui have color incompatible formats so we use a dummy data as target :
  var dummy={};
  // set dummy initial value :
  dummy[varName]=obj[varName].getStyle(); 
  return this.addColor(dummy,varName)
      .onChange(function( colorValue  ){
          //set color from result :
          obj[varName].setStyle(colorValue);
      });
};

export const guiMicro = gui.addFolder("Micro");
export const guiMacro = gui.addFolder("Macro");
export const guiMuman = gui.addFolder("Human");
export const guiRendering = gui.addFolder("Rendering");
export const guiChapter1 = gui.addFolder("Chapter 1");
// export const guiChapter2 = gui.addFolder("Chapter 2");
// export const guiChapter3 = gui.addFolder("Chapter 3");
// export const guiChapter4 = gui.addFolder("Chapter 4");

export default gui; 
