"use strick"

import Backbone from 'backbone'
import uuid from 'uuid'
import BaseModel from './index.js'


class PageModel extends BaseModel{

  constructor(props) {
    props = props || {
      offset: {
        top: 80,
        left: 500,
        width: 375,
        height: 667
      }
    }
    super(props)

    var defaults = {
        id: props.id || uuid.v4(),
        name: "a brick",
        brickType: "Page",
        offset: props.offset,
        "zIndex": 100,
        "backgroundColor": props.backgroundColor || "#d3f9dd",
        "backgroundOpacity": 1,
        classNames: [ 'aClass', 'bClass' ],
        title: props.title || "new page 0",
        settings: ["pageTitle", "imageUrl"],
        "barMode": props.barMode || 0,
        engineeringTree: []
    }
    var allKeys = Object.keys(defaults)
    for (let key of allKeys) {
      this.set(key, defaults[key])
    }
  }
}



module.exports = PageModel;
