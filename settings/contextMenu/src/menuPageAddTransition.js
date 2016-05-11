"use strict"

class PageAddTransitionMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  onContextTransitionMenu(show) {
    this.props.onContextTransitionMenu(show);
  }

  render() {
    return (
      <button type="button" className="list-group-item" ref="AivicsContextTransition"
        onClick={(event)=>this.onContextTransitionMenu(true)}>Add Transition</button>
    )
  }
}

class PageAddTranstionList extends React.Component {
  constructor(props) {
    super(props)
  }

  onNewTransitionSubmit(id) {
    this.props.onNewTransitionSubmit(id);
  }

  render() {
    var self = this;
    var model = this.props.dataStorage.model("Pages");
    var activeBrickId = this.props.activeBrickId;
    var contents = model.find().map(function(brick, i){
      if (brick.id == activeBrickId) {
        return;
      }
      return (
        <button id={brick.id} key={brick.id} type="button" className="list-group-item"
          onClick={(event)=>self.onNewTransitionSubmit(brick.id)}>{brick.title}</button>
      )
    })

    return (
      <div className="list-group pages PageAddTranstionList">
        {contents}

      </div>
    )
  }
}

var PageAddTransitionContextMenu = {};
PageAddTransitionContextMenu.PageAddTransitionMenu = PageAddTransitionMenu;
PageAddTransitionContextMenu.PageAddTranstionList = PageAddTranstionList;

module.exports = PageAddTransitionContextMenu;