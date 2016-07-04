require('neon');
require('thulium');
var fs = require('fs');

var fileCache = {};
var regexp = new RegExp(/\.([0-9a-z]+)(?:[\?#]|$)/);

function fixExtension(filename) {
  if (!filename) {
    throw new Error('unknown `' + filename + '` view');
  }

  if (regexp.test(filename) === false) {
    filename += '.html';
  }

  return filename;
}

module.exports = function(path, options, callback) {
  var key = path + ':thulium:string';

  if ('function' == typeof options) {
    callback = options, options = {};
  }

  options.filename = path;

  var view;

  try {
    view = options.cache
      ? fileCache[key] || (fileCache[key] = fs.readFileSync(path, 'utf8'))
      : fs.readFileSync(path, 'utf8');
  } catch (err) {
    return callback(new Error('cannot read `' + path + '` view'));
  }

  if (typeof options.layout === 'undefined') {
    options.layout = 'application';
  }

  var tm;
  var lookup = this.lookup.bind(this);

  options.partial = options.renderPartial = function renderPartial(partialPath, locals) {
    try {
      var partialFile = fs.readFileSync(lookup(fixExtension(partialPath)), 'utf8');

      var partialTemplate = new Thulium({
        template : partialFile
      });

      locals = locals || {};
      locals.partial = locals.renderPartial = renderPartial;

      // merge parent's locals for simple inheritance
      Object.keys(options).forEach(function (prop) {
        var value = options[prop];

        if (typeof locals[prop] === 'undefined') {
          locals[prop] = options[prop];
        }
      });

      partialTemplate.parseSync().renderSync(locals);

      return partialTemplate.view;

    } catch (err) {
      return callback(new Error('cannot read `' + partialPath + '` partial'));
    }

  };

  if (options.layout !== false) {
    var layoutView;

    var layoutPath = lookup('layouts/' + fixExtension(options.layout));

    var layoutKey = layoutPath + ':thulium:string';

    try {
      layoutView = options.cache
        ? fileCache[layoutKey] || (fileCache[layoutKey] = fs.readFileSync(layoutPath, 'utf8'))
        : fs.readFileSync(layoutPath, 'utf8');
    } catch (err) {
      return callback(new Error('cannot read `' + options.layout + '` layout'));
    }

    tm = new Thulium({
      template : layoutView
    });

    var partial = new Thulium({
      template : view
    });

    partial.parseSync().renderSync(options);

    options.yield =  partial.view;

  } else {
    tm = new Thulium({
      template : view
    });
  }

  tm.parseSync().renderSync(options);

  var rendered = tm.view;

  callback(null, rendered);
}
