import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import ScaleMenu from "./components/ScaleMenu/ScaleMenu";
import SoundButton from "./components/SoundButton/SoundButton";
import FullScreenButton from "./components/FullScreenButton/FullScreenButton";
import InfoList from "./components/Info/InfoList";

import WebGL from "~/webgl/WebGL";

import { setCurrentScale } from '~/services/stores/actions';
import { getCurrentScale, getIsTutorialDone, getIsChapterReady, getIsAssetLoaded } from '~/services/stores/reducers/selectors';
import { setTutorialDone } from "~/services/stores/actions";

import {InfoManager} from "~/webgl/manager"
import Bus from "~/helpers/Bus"
import "./style.sass"

class Scene extends React.Component {

  static propTypes = {
      step: PropTypes.shape({
        api_id: PropTypes.number,
        chapter_id: PropTypes.number,
        chapter_rank: PropTypes.chapter_rank,
        id: PropTypes.number,
        content: PropTypes.string,
        infos: PropTypes.array,
        slug: PropTypes.string,
        title: PropTypes.string,
        type: PropTypes.string
      }),
      isReady: PropTypes.bool,
      showElements: PropTypes.bool,
    }

  constructor(props) {
    super(props)

    this.state = {
      isThreeSceneMounted: false,
      currentStepRank: 1
    };

    this.sceneElement = React.createRef();
  }

  componentDidMount(){
    // if (this.props.isChapterReady && this.props.isAssetLoaded) {
    //   this.initScene();
    //   Bus.on("scale:display", (scale) => {
    //     if( this.props.currentScale !== scale.name ){
    //       this.props._setCurrentScale(scale.name);
    //     }
    //   })
    // }
  }

  componentWillMount() {
    if (!this.props.isTutorialDone) {
      this.props._setTutorialDone();
    }
  }

  initScene(){
    this.webgl = new WebGL({
      element: this.sceneElement.current
    });
    this.webgl.selectStep(this.props.step);
    InfoManager.updateInfos([]);
    
    this.setState({isThreeSceneMounted: true});
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.isChapterReady && this.props.isAssetLoaded) {
      if (this.props.isReady != nextProps.isReady && nextProps.isReady) {
        this.initScene();
        Bus.on("scale:display", (scale) => {
          if( this.props.currentScale !== scale.name ){
            this.props._setCurrentScale(scale.name);
          }
        })
      }
    }
    if (this.props.step.rank !== nextProps.step.rank) { 
      /**
       * Before scene component is rendered, update current step in the webgl scene
       * new Step is created and is ready to receive infos
       */
      this.webgl.selectStep(nextProps.step);
    }
  }

  /**
   * @param {string} name Name of scale
   */
  selectScale = (name) => {
    this.webgl.selectScale(name);
    this.props._setCurrentScale(name);
  }

  /**
   * Fire at initialisation & rendering, notice scene to update listened point position
   * @return {[PropTypes.infos]} Return the filtered list 
   */
  updateInfos(){
    var infos = this.props.step.infos.filter(info => info.scale === this.props.currentScale);
    InfoManager.updateInfos(infos);
    return infos;
  }

  render() {
    return (
      <div ref={(this.sceneElement)} className="scene">
          <ScaleMenu scale={this.props.currentScale} onSelectCallback={this.selectScale} showTutorial={!this.props.isTutorialDone}  show={this.props.showElements} />
          <InfoList infos={this.webgl ? this.updateInfos() : []}></InfoList>
          <div className={`scene__bottom-right-nav ${this.props.showElements ? 'is-shown' : ''}`} >
            <SoundButton />
            <FullScreenButton  />
          </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    currentScale: getCurrentScale(state),
    isChapterReady: getIsChapterReady(state, state.ui.chapter.rank),
    isAssetLoaded: getIsAssetLoaded(state, 'global'),
    isTutorialDone: getIsTutorialDone(state)
  }
}

const mapDispatchToProps = dispatch => {
  return { 
    _setCurrentScale: scale => {
      dispatch(setCurrentScale(scale));
    },
    _setTutorialDone: () => {
      dispatch(setTutorialDone());
    }
  }
};

export default connect(mapStateToProps, mapDispatchToProps)(Scene);
