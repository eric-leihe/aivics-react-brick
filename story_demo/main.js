"use strict"

/**
 * Demo entry
 */
import uuid from 'uuid'
import React from "react"
import ReactDOM from "react-dom"
import Bricks from '../src'
import PageSettingPanel from '../settings/pageTools/src'
import PageTransitionSettings from '../settings/pageTransitionSettings/src'
import PageContextMenu from '../settings/contextMenu/src'
import TransitionSettings from '../settings/transitionSettings/src'

$.Bricks = Bricks;

let BrickMask = Bricks.Mask;
let Brick = Bricks.Base;
let LabelBrick = Bricks.Label;
let Page = Bricks.Page;
let BrickSetting = Bricks.settings.Base;
let Transition = Bricks.Transition;

import DataStorage from './DataStorage'

//defin BrickType and ModelType name
const _pageBrickType = 'Page';
const _pageModelType = 'Bricks';
const _pageReferenceBrickType = 'PageReference';
const _pageReferenceModelType = 'Bricks';
const _transitionBrickType = 'Transition';
const _transitionModelType = 'Transitions';

var data = DataStorage.model("Bricks").upsert({
    name: "a brick",
    brickType: "Page",
    offset: {
      top: 10,
      left: 100,
      width: 375,
      height: 667
    },
    "zIndex": 100,
    "backgroundColor": "#d3f9dd",
    "backgroundOpacity": 1,
    classNames: [ 'aClass', 'bClass' ],
    title: "new page 0",
    settings: ["pageTitle", "imageUrl"],
    bricks: []
});

var data2 = DataStorage.model("Bricks").upsert({
    name: "a brick",
    brickType: "Page",
    offset: {
      top: 100,
      left: 600,
      width: 375,
      height: 667
    },
    "zIndex": 100,
    "backgroundColor": "#66E243",
    "backgroundOpacity": 1,
    classNames: [ 'aClass', 'bClass' ],
    title: "new page 1",
    settings: ["pageTitle", "imageUrl"]
});

var data3 = DataStorage.model("Bricks").upsert({
    name: "a brick",
    brickType: "Page",
    offset: {
      top: 50,
      left: 1150,
      width: 375,
      height: 667
    },
    "zIndex": 100,
    "backgroundColor": "#33f0a1",
    "backgroundOpacity": 1,
    classNames: [ 'aClass', 'bClass' ],
    title: "new page 2",
    settings: ["pageTitle", "imageUrl"]
});


class Story extends React.Component {
  constructor(props) {
    super(props);
    this.onBrickSelect = this.onBrickSelect.bind(this);
    this.onBrickResize = this.onBrickResize.bind(this);
    this.onBrickSettingChange = this.onBrickSettingChange.bind(this);
    this.onPageAdd = this.onPageAdd.bind(this);
    this.onBrickAdd = this.onBrickAdd.bind(this);
    this.onPageDelete = this.onPageDelete.bind(this);

    this.onNewTransitionSubmit = this.onNewTransitionSubmit.bind(this);
    this.onTransitionDeleteClick = this.onTransitionDeleteClick.bind(this);
    this.onPageScaleSmall = this.onPageScaleSmall.bind(this);
    this.onPageScaleLarge = this.onPageScaleLarge.bind(this);
    this.onPageAddReference = this.onPageAddReference.bind(this);
    this.onPageContextMenu = this.onPageContextMenu.bind(this);
    this.onTransitionSelected = this.onTransitionSelected.bind(this);
    this.onTransitionChanged = this.onTransitionChanged.bind(this);

    this.onPreview = this.onPreview.bind(this);

    this.lastSettings = 0;
    this.inBricks = true;

    this.state = {
        activeBrickId: data.id,
        activeBrickPosition: data.offset,
        activeBrickType: data.brickType,
        settingChangeName: null,
        settingChangeValue: null,
        storyScale: 1.0,
        contextMenuPosition: {left: 0, top: 0},
        activeTransitionId: null
    }

  }

  onBrickSelect(e, brickId, position) {
    var activeBrick = DataStorage.model(this.mapBrickTypeToModelType(this.state.activeBrickType))
                      .find({id: brickId}, this.props.treeName);
    console.info(brickId)
    this.setState({
      activeBrickId: brickId,
      activeBrickPosition: position,
      settingChangeName: null,
      settingChangeValue: null,
      activeBrickType: activeBrick.brickType,
      activeTransitionId: null
    });

    $(".transitionSettings").hide();
    $(".aivics-brick-setting-panel").show();

  }

  onBrickSettingChange(brickId, fieldName, changeToValue) {
    var record = DataStorage.model("Bricks").find({ id: brickId }, this.props.treeName);
    console.info(brickId);
    let position = this.state.activeBrickPosition,
        brickType = this.state.activeBrickType;

    this.setState({
      activeBrickId: brickId,
      settingChangeName: fieldName,
      settingChangeValue: changeToValue,
      activeBrickPosition: position,
      activeBrickType: brickType
    })

  }

  onBrickResize(activeBrickId, position) {
    var editorLeft = $(this.refs.story).position().left;
    var editorTop = $(this.refs.story).position().top;
    var editorWidth = $(this.refs.story).width();
    var editorHeight = $(this.refs.story).height();

    var self = this;
    //Constrain the component inside the container
    if(position.left < 0){
      position.left = 0;
    }
    if(position.top < 0){
      position.top = 0;
    }

    if( position.left + position.width > editorWidth ){
      position.left = editorWidth - position.width;
    }

    if(position.top + position.height > editorHeight){
      position.top = editorHeight - position.height;
    }

    if(position.left >= editorWidth ){
      position.left = 0;
      //position.width = 1;
    }

    if(position.top >= editorHeight){
      position.top = 0;
      //position.height = 1;
    }

    var record = DataStorage.model("Bricks").find({ id: activeBrickId }, this.props.treeName);
    if(!record){
      return;
    }

    //Page cannot change width & height
    if (this.state.activeBrickType == "Page") {
      position.width = record.offset.width;
      position.height = record.offset.height;
    }

    //delte parents' offset
    var ids = activeBrickId.split("/");
    if (ids.length > 1) {
      ids.map(function(id, i){
        if (i == ids.length-1) {
          return;
        }
        var parent = DataStorage.model("Bricks").find({ id: id }, self.props.treeName);
        var offset = parent.offset;
        position.top -= offset.top;
        position.left -= offset.left;
      })
      position.top -= 64;
    }

    _.merge(record, { offset: position });

    this.setState({
      activeBrickId: activeBrickId,
      activeBrickPosition: position,
      settingChangeName: null,
      settingChangeValue: null
    });

    $(".transitionSettings").hide();
    $(".aivics-brick-setting-panel").show();
  }

  onBrickAdd(id = this.state.activeBrickId, top = 50, left = 120
        , width = 200, height = 50, brickType = "Base", settings=[]) {

    // if (this.state.activeBrickType == "Page") {
      var page = DataStorage.model("Bricks").find({id: id}, this.props.treeName);
      if (!page.engineeringTree) {
        page.engineeringTree = [];
      }

      var newBrick = {
        id: uuid.v4(),
        name: "brick",
        brickType: brickType,
        offset: {
          top: top,
          left: left,
          width: width,
          height: height
        },
        "zIndex": 100,
        "backgroundColor": "#FFFFFF",
        "backgroundOpacity": 1,
        "settings": settings
      };
      page.engineeringTree.push(newBrick)
      this.setState({
        activeBrickId: page.id+"/"+newBrick.id,
        activeBrickPosition: newBrick.offset,
        activeBrickType: newBrick.brickType,
        settingChangeName: null,
        settingChangeValue: null
      });
      $(".transitionSettings").hide();
      $(".aivics-brick-setting-panel").show();
    // }
  }


  onPageAdd(top = 10, left = 400){
    var currentPages = DataStorage.model("Bricks").find();
    var title = "new page " + currentPages.length;
    var newPage = DataStorage.model("Bricks").upsert({
        name: "a brick",
        brickType: "Page",
        offset: {
          top: top,
          left: left,
          width: 375,
          height: 667
        },
        "zIndex": 100,
        "backgroundColor": "#d3f9dd",
        "backgroundOpacity": 1,
        "title": title,
        classNames: [ 'aClass', 'bClass' ],
        settings: ["pageTitle", "imageUrl"]
    })
    this.setState({
      activeBrickId: newPage.id,
      activeBrickPosition: newPage.offset,
      activeBrickType: newPage.brickType,
      settingChangeName: null,
      settingChangeValue: null
    });

    $(".transitionSettings").hide();
    $(".aivics-brick-setting-panel").show();
  }

  onPageDelete(){
    var activeBrickId = this.state.activeBrickId

    var model = DataStorage.model("Bricks"),
        pages = model.find();

    if (pages.length > 1) {
      model.delete({id: activeBrickId});

      //also delete related transitions
      var transitions = DataStorage.model('Transitions').find();
      if (transitions) {
        transitions.map(function(transition){
          if (transition.fromPageId == activeBrickId || transition.toPageId == activeBrickId) {
            DataStorage.model('Transitions').delete({id: transition.id})
          }
        })
      }
      pages = model.find();
      var lastPage = _.last(pages)

      this.setState({
        activeBrickId: lastPage.id,
        activeBrickPosition: lastPage.offset,
        activeBrickType: lastPage.brickType,
        settingChangeName: null,
        settingChangeValue: null
      });
    }
    $(".transitionSettings").hide();
    $(".aivics-brick-setting-panel").show();
  }

  onPageContextMenu(brickId, position) {
    var record = DataStorage.model("Bricks").find({id: brickId}, this.props.treeName);
    $(".pageContextMenu").show();

    var scroll = {
      left: $(".story")[0].scrollLeft,
      top: $(".story")[0].scrollTop
    }

    position.left += scroll.left;
    position.top += scroll.top - 40;

    position.left/= this.state.storyScale;
    position.top /= this.state.storyScale;

    this.setState({
        activeBrickId:brickId,
        activeBrickPosition: record?record.offset : this.state.activeBrickPosition,
        activeBrickType: record? record.brickType : this.state.activeBrickType,
        settingChangeName: null,
        settingChangeValue: null,
        storyScale: this.state.storyScale,
        contextMenuPosition: position
    })
  }

  onPageScaleLarge() {
    if (this.state.storyScale < 2) {
      this.state.storyScale += 0.2;
      var width = 200 * this.state.storyScale;
      $(".story").css({
        'transform': 'scale('+this.state.storyScale+')',
        'transform-origin': '0 0'
      })
    }
  }

  onPageScaleSmall() {
    if (this.state.storyScale > 0.4) {
      this.state.storyScale -= 0.2;
      var width = 200 * this.state.storyScale;
      $(".story").css({
        'transform': 'scale('+this.state.storyScale+')',
        'transform-origin': '0 0'
      })
    }
  }

  onNewTransitionSubmit(fromPageId, toPageId ,remark) {
    var transitions = DataStorage.model('Transitions').find();
    var hasTransition = false;
    if (transitions) {
      //ignore submit if transition exits
      transitions.map(function(transition){
        if (transition.fromPageId == fromPageId && transition.toPageId == toPageId) {
          hasTransition = true;
          return
        }
      })
    }
    if (hasTransition) {
      return;
    }
    var newTransition = DataStorage.model('Transitions').upsert({
        name: "Transition",
        brickType: "Transition",
        "zIndex": 1,
        "fromPageId": fromPageId,
        "toPageId": toPageId,
        "remark": remark,
        "fromPageTransition": "fadeOut",
        "toPageTransition": "fadeIn",
        "background": "black"
    })
    this.setState(this.state)
  }

  onTransitionDeleteClick(transitionId) {
    DataStorage.model('Transitions').delete({id: transitionId});
    this.setState(this.state)
  }

  onTransitionSelected(transitionId) {
    var transitions = DataStorage.model("Transitions").find();
    transitions.map(function(transition, i){
      if (transition.id == transitionId) {
        transition.background = "red"
      }else {
        transition.background = "black"
      }
    })
    this.setState({
      activeTransitionId: transitionId
    });

    $(".transitionSettings").show();
    $(".aivics-page-transition-panel").hide();
    $(".aivics-brick-setting-panel").hide();

  }

  onTransitionChanged(transitionId, remark) {
    var transition = DataStorage.model("Transitions").find({id: transitionId});
    transition.remark = remark;
    this.setState(this.state)
  }

  onPageAddReference(id = this.state.activeBrickId, top = 50, left = 120, width = 200, height = 50) {

    if (this.state.activeBrickType == "Page") {
      var page = DataStorage.model("Bricks").find({id: id});
      if (!page.referenceTree) {
        page.referenceTree = [];
      }

      var newReference = {
        id: uuid.v4(),
        name: "reference",
        brickType: "PageReference",
        offset: {
          top: top,
          left: left,
          width: width,
          height: height
        },
        "zIndex": 100,
        "backgroundColor": "#FFFFFF",
        "backgroundOpacity": 1,
        "title": "reference",
        "settings": ["pageTitle"]
      };
      page.referenceTree.push(newReference)
      this.setState({
        activeBrickId: page.id+"/"+newReference.id,
        activeBrickPosition: newReference.offset,
        activeBrickType: newReference.brickType,
        settingChangeName: null,
        settingChangeValue: null
      });
      $(".transitionSettings").hide();
      $(".aivics-brick-setting-panel").show();
    }
  }


  mapBrickTypeToModelType(brickType){
    switch (brickType) {
      case 'Page':
        return 'Bricks';break;
      case 'PageReference':
        return 'Bricks';break;
      case 'Transition':
        return 'Transitions';break;
      default:
        return 'Bricks';
    }
  }

  onPreview() {
    this.props.showPreview();
  }

  contextMenu(event) {
    event.preventDefault();
    event.stopPropagation();

    var position = {
      left: event.pageX,
      top: event.pageY
    }
    this.onPageContextMenu(null, position);

    return false;
  }


  render() {

    var self = this;
    let brickPosition = {
      top: this.state.activeBrickPosition.top,
      left: this.state.activeBrickPosition.left,
      width: this.state.activeBrickPosition.width,
      height: this.state.activeBrickPosition.height
    };

    if (this.state.activeBrickId) {
      var ids = this.state.activeBrickId.split("/");
      if (ids.length > 1) {
        ids.map(function(id, i){
          if (i == ids.length -1) {
            return;
          }
          var component = DataStorage.model("Bricks").find({id: id}, self.props.treeName);
          var position = component.offset;
          brickPosition.top += position.top;
          brickPosition.left += position.left;
        })
        brickPosition.top += 64;
      }
    }


    var components = DataStorage.model("Bricks").find();

    var contents = components.map(function(comp){
      var DynaBrick = Bricks[comp.brickType];

      return (
        <DynaBrick id={comp.id} key={comp.id}
          dataStorage={DataStorage}
          onPageContextMenu = {self.onPageContextMenu}
          preview={false}
          treeName={self.props.treeName}
          onBrickSelect={self.onBrickSelect} />
      )
    });

    var transitionModels = DataStorage.model("Transitions").find();
    var transition = "";
    if (transitionModels) {
      transition = transitionModels.map(function(transition){
        console.log(transition)
        return (
          <Transition
            id={transition.id}
            key={transition.id}
            dataStorage={DataStorage}
            fromPageId={transition.fromPageId}
            toPageId={transition.toPageId}
            remark={transition.remark}
            onTransitionSelected={self.onTransitionSelected}
          />
        )
      })
    }
    var brickType = this.mapBrickTypeToModelType(this.state.activeBrickType);
    return (
      <div className="story-content">
        <div ref="header" className="header">
          <PageSettingPanel
            onPageAdd = {this.onPageAdd}
            onPageDelete = {this.onPageDelete}
            onPageSettingsClick = {this.onPageSettingsClick}
            onPageTransitionClick = {this.onPageTransitionClick}
            onPageScaleLarge = {this.onPageScaleLarge}
            onPageScaleSmall = {this.onPageScaleSmall}
            onPreview = {this.onPreview}
            dataStorage={DataStorage}

          />
        </div>
        <div ref="story" className="story" onContextMenu={(event)=>this.contextMenu(event)}>
          {contents}
          <BrickMask
              ref = "BrickMask"
              key = "BrickMask"
              activeBrickId={this.state.activeBrickId}
              activeBrickPosition={brickPosition}
              storyScale = {this.state.storyScale}
              dataStorage = {DataStorage}
              brickType = {brickType}
              treeName = {this.props.treeName}
              onPageContextMenu = {self.onPageContextMenu}
              onBrickResize={this.onBrickResize} />
          {transition}
          <PageContextMenu
            activeBrickId={this.state.activeBrickId}
            position={this.state.contextMenuPosition}
            onPageAddReference={this.onPageAddReference}
            dataStorage = {DataStorage}
            onNewTransitionSubmit = {this.onNewTransitionSubmit}
            onPageAdd = {this.onPageAdd}
            onBrickAdd = {this.onBrickAdd}
            onPageDelete = {this.onPageDelete}
            brickType = {brickType}
            treeName = {this.props.treeName}
            config = {this.props.config}
          />
        </div>

        <BrickSetting
            activeBrickId={this.state.activeBrickId}
            dataStorage={DataStorage}
            brickType={brickType}
            onPageAddReference={this.onPageAddReference}
            settingChangeName={this.state.settingChangeName}
            settingChangeValue={this.state.settingChangeValue}
            treeName = {this.props.treeName}
            onBrickSettingChange={this.onBrickSettingChange} />
        <PageTransitionSettings
          activeBrickId={this.state.activeBrickId}
          dataStorage={DataStorage}
          onTransitionDeleteClick = {this.onTransitionDeleteClick}
          onNewTransitionSubmit={this.onNewTransitionSubmit}
        />
        <TransitionSettings
          dataStorage={DataStorage}
          transitionId={this.state.activeTransitionId}
          onTransitionDeleteClick={this.onTransitionDeleteClick}
          onTransitionChanged={this.onTransitionChanged}
        />
      </div>

    )
  }
}
module.exports = Story;
