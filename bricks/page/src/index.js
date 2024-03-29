"use strict"

require("./style.css")

import Brick from "../../base/src"

class Page extends React.Component  {
  constructor(props){   //Equals to getInitialState
    super(props);

    this.refName = "aivicsPage";
    this.model = this.props.dataStorage;
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.reload = this.reload.bind(this);
    this.getDOMElement = this.getDOMElement.bind(this);

    this.dataStorage = this.props.dataStorage;
    this.updateContentView = this.updateContentView.bind(this);
    this.renderContent = this.renderContent.bind(this);
  }

  reload(data){
    var offset = data.offset;
    $(this.refs[this.refName])
              .css(offset)
              .css(data);
  }

  getDOMElement(){
    return this.refs[this.refName];
  }

  updateContentView(record) {

    var $brick = $("#" + this.props.id);
    var height = $brick.outerHeight();
    var para = $brick.find("h3.aivcis-page-title-paragraph");
    var pHeight = para.outerHeight();

    para.css({
      "top": (100 * ((height - pHeight)/height) / 2.0) + "%"
    });

    if (!record.barMode || record.barMode == 0) {
      this.jqueryMap.$TabBar.hide();
    }else {
      this.jqueryMap.$TabBar.show();
    }


  }

  componentDidMount(){

    this.jqueryMap = {
      $TabBar: $(this.refs.brickContentTarBar)
    }

    var record = this.model.find({ id: this.props.id }).getValue();
    this.reload(record);
    this.updateContentView(record);

    var height = record.offset.height;
    $(this.refs.brickContentWrapper).height(height-64);
  }


  componentDidUpdate(){
    var record = this.model.find({ id: this.props.id }).getValue();
    this.reload(record);
    this.updateContentView(record);
  }

  handleOverlayClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if(e.target.className !== e.currentTarget.className){
      return;
    }

    var $this = $(this.getDOMElement());

    var left = _.replace($this[0].style.left, 'px', '');
    var top  = _.replace($this[0].style.top, 'px', '');
    var width = $this.width();
    var height = $this.height();

    var position = {
      left: left,
      top: top,
      width: width,
      height: height
    };

    this.props.onBrickSelect(e, this.props.id, position);
  }

  contextMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.props.preview) {
      var $this = $(this.getDOMElement());

      var left = _.replace($this[0].style.left, 'px', '');
      var top  = _.replace($this[0].style.top, 'px', '');
      var width = $this.width();
      var height = $this.height();

      var position = {
        left: left,
        top: top,
        width: width,
        height: height
      };
      //
      // var position = {
      //   left: event.pageX,
      //   top: event.pageY
      // }
      this.props.onPageContextMenu(this.props.id, position);

      return false;
    }
  }

  renderNest(){
    var self = this;
    var parentId = this.props.id;
    var record = this.model.find({ id: this.props.id }, this.props.treeName).getValue();
    if(!_.isEmpty(record[this.props.treeName])){
      return record[this.props.treeName].map(function(b){
        var b = b.getValue()
        var bid = parentId + "/" + b.id;

        var TagName = $.Bricks[b.brickType];
        return React.createElement(TagName, {
          id:bid, key:bid, containerId: parentId,
            dataStorage:self.props.dataStorage,
            onBrickSelect:self.props.onBrickSelect,
            parentId: parentId,
            title: b.title,
            position: b.offset,
            treeName: self.props.treeName,
            onPageContextMenu: self.props.onPageContextMenu
        });
      })
    }
  }

  renderContent(record) {
    return (
      <div>
        <img className="aivics-page-image" src={record.imageUrl}/>

      </div>
    )
  }

  render() {
    var record = this.model.find({ id: this.props.id }).getValue();
    var subContent = this.renderContent(record);

    var previewId = this.props.preview?this.props.id:"";
    return (
      <div id={this.props.id}
          ref={this.refName}
          data-preview-id={previewId}
          className="aivics-brick aivics-page" >
          <div className="aivics-page-header">
            <p className="status">01:30</p>
            <p className="title">{record.title}</p>
          </div>
          <div ref="brickContentWrapper"
              className="aivics-page-content-wrapper">
            {this.renderNest()}
            {subContent}
          </div>
          <div ref="brickContentTarBar"
               className="brickContentTarBar"
               onContextMenu={(event)=>this.contextMenu(event)}>
          </div>
          <div ref="brickContentForegrond"
              className="aivics-brick-content-foreground">
          </div>
          <div ref="brickContentOverlay"
              className="aivics-brick-content-overlay"
              onClick={this.handleOverlayClick}
              onContextMenu={(event)=>this.contextMenu(event)}>
          </div>
      </div>
    )
  }
}

Page.treeName = {
  referenceTree: "referenceTree",
  engineeringTree: "engineeringTree"
}

module.exports = Page;
