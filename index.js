require('neon');
require('thulium');
var fs = require('fs');

var fileCache = {};

function fixExtension(filename) {
  if (/(?:\.([^.]+))?$/.test(filename) === false) {
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
    return callback(err);
  }

  if (typeof options.layout === 'undefined') {
    options.layout = 'application';
  }

  var tm;

  options.partial = options.renderPartial = function renderPartial(partialPath, locals) {
    try {

      var partialFile = fs.readFileSync('./' + options.settings.views + '/' + fixExtension(partialPath), 'utf8');

      var partialTemplate = new Thulium({
        template : partialFile
      });

      locals = locals || {};
      locals.partial = locals.renderPartial = renderPartial;

      partialTemplate.parseSync().renderSync(locals);

      return partialTemplate.view;

    } catch (err) {
      return callback(err);
    }

  };

  if (options.layout !== false) {
    var layoutView;

    var layoutPath = './' + options.settings.views + '/layouts/' + fixExtension(options.layout);

    var layoutKey = layoutPath + ':thulium:string';

    try {
      layoutView = options.cache
        ? fileCache[layoutKey] || (fileCache[layoutKey] = fs.readFileSync(layoutPath, 'utf8'))
        : fs.readFileSync(layoutPath, 'utf8');
    } catch (err) {
      return callback(err);
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
