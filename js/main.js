var view = {
  init: function() {
    this.render();
  },
  render: function() {
  }
}

var controller = {
  init: function() {
    model.init();
    view.init();
  },
  submit: function() {
    model.save();
  }
}

var model = {
  init: function() {
  },
  save: function() {
  }
}

controller.init();
