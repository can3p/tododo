(function() {

var LangMap = {
  en: {
    'new_task': "New Task"
  },

  ru: {
    'new_task': "Новая задача"
  }
}

var exampleData = [
      {
        subject: "Раз",
        priority: "Normal", // High, Low
        tag: "red", // blue, green, yellow, purple
        done: false
      },
      {
        subject: "Два",
        priority: "Low", // High, Low
        tag: "white", // blue, green, yellow, purple
        done: false
      },
      {
        subject: "Три",
        priority: "High", // High, Low
        tag: "green", // red, blue, yellow, purple
        done: true
      }
    ]

window.App = function() {
  var lang = localStorage.getItem('todo-lang')

  if (!lang || !LangMap[lang]) {
    language = 'en'
  }


  var language = ko.observable(lang),
      map = ko.observable(LangMap[lang])

  language.subscribe(function(value) {
    map(LangMap[value]);
    localStorage.setItem('todo-lang', value)
  })

  var form = new Form(document.getElementById('todo-addform'), map)
  var todo = new TodoList(document.getElementById('todo-container'), exampleData, language, map)

  ko.bindingHandlers.edit = {
    init: function(element, valueAccessor, allBindings, todoItem, bindingContext) {
      var bindings = valueAccessor(),
          data = bindings.action === 'add' ? null : todoItem.getItems()

      // timeout is needed because knockout
      // will try to apply bindings multiple
      // times otherwise
      setTimeout(function() {
        form.attach(element,
                        data,
                        bindings.done.bind(todoItem),
                        bindings.cancel.bind(todoItem))
      }, 0);
    }
  }

}

function TodoList(el, sampleData, lang, langmap) {
  var self = this

  var language = localStorage.getItem('todo-lang')

  if (!language || !LangMap[language]) {
    language = lang
  }


  this.language = lang
  this.l = langmap

  this.addMode = ko.observable(false)
  this.goAddMode = function() {
    this.addMode(true)
  }

  this.onAdd = function(data) {
    var item = TodoItem(data);

    item.onUpdate = self.saveState.bind(self);
    self.list.push(item)
    self.saveState()
    self.addMode(false)
  }

  this.onCancelAdd = function() {
    self.addMode(false)
  }

  this.remove = function(item) {
    item.onUpdate = null
    self.list.remove(item)
    self.saveState()
  }

  this.slideUpItem = function(elem) {
    if (elem.nodeType === 1) {
      $(elem).slideUp(100, function() {
        $(elem).remove()
      })
    }
  }

  this.slideDownItem = function(elem) {
    if (elem.nodeType === 1) {
      $(elem).hide().slideDown(100)
    }
  }

  this.saveState = function() {
    var items = this.list(),
        data = items.map(function(item) { return item.getItems() });

    localStorage.setItem('todo-data', JSON.stringify(data));
  };

  this.restoreState = function(defaults) {
    var store = localStorage.getItem('todo-data'),
        data

    if (store && store.length) {
      try {
        data = JSON.parse(store)
      } catch (e) {
      }
    }

    if (!data) data = defaults

    return ko.observableArray(data.map(function(json) {
      var item = TodoItem(json)
      item.onUpdate = self.saveState.bind(self);

      return item
    }))
  };

  this.list = this.restoreState(sampleData)
  ko.applyBindings(this, el)
}

function TodoItem(props) {
  if (!(this instanceof TodoItem)) {
    return new TodoItem(props)
  }

  this.edited = ko.observable(false);
  this.confirm = ko.observable(false);

  this.props = []
  for (var prop in props) {
    this[prop] = ko.observable(props[prop])
    this.props.push(prop)
  }

  var subject = this.subject;
  subject.subscribe(function(value) {
    subject(value.replace(/\n/g, "").substr(0,255))
  })

  this.setItems = function(props) {
    this.props.forEach(function(prop) {
      if (props.hasOwnProperty(prop)) {
        this[prop](props[prop])
      }
    }.bind(this))

    this.onUpdate && this.onUpdate()
  }

  this.getItems = function() {
    return this.props.reduce(function(acc, prop) {
      acc[prop] = this[prop]()
      return acc
    }.bind(this), {})
  }

  this.edit = function() {
    this.edited(true)
  }

  this.confirmDelete = function() {
    this.confirm(true)
  }

  this.cancelConfirm = function() {
    this.confirm(false)
  }

  this.update = function(data) {
    this.setItems(data)
    this.edited(false)
  }

  this.restore = function() {
    this.edited(false)
  }
}

function Form(el, langmap) {
  el.remove()

  this.l = langmap

  this.onAdd = null
  this.tags = [
    'white',
    'green',
    'red',
    'blue',
    'yellow',
    'purple'
  ]

  this.priorities = [
    'High',
    'Normal',
    'Low'
  ]

  this.onAdd = null
  this.onCancel = null

  this.defaults = {
    subject: '',
    tag: 'white',
    priority: 'Normal',
    done: false
  }

  this.current = TodoItem(this.defaults)
  this.addNew = ko.observable(false)
  this.formClone = el

  this.addItem = function() {
    this.onAdd(this.current.getItems())
    this.detach()
    this.cleanup()
  }

  this.cancel = function() {
    this.onCancel()
    this.detach()
    this.cleanup()
  }

  this.cleanup = function() {
    this.onAdd = null
    this.onCancel = null
  }

  this.attach = function(el, data, onAdd, onCancel) {
    if (this.onCancel) {
      this.onCancel()
      this.cleanup()
    }

    this.addNew(!data)
    this.current.setItems(data || this.defaults)
    this.onAdd = onAdd
    this.onCancel = onCancel

    //we need to clone the form
    //every time because knockout looses
    //all bindings on node detach
    this.form = this.formClone.cloneNode(true)

    el.appendChild(this.form)
    $(el).hide().slideDown(200)
    ko.applyBindings(this, this.form)
  }

  this.detach = function() {
    this.form.remove()
    this.form = null
  }

  this.setPriority = this.current.priority.bind(this)
}

}())
