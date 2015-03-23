Thulium engine for Express 4

## Requirements

[Thulium](https://www.npmjs.com/package/thulium);


## Install

    npm install -save thulium-express

## Usage

Setup Express to use thulium views and thulium engine

```javascript
require('thulium');

var express = require('express');
var app = express();

...

app.engine('html', require('thulium-express'));
app.set('view engine', 'html');

// views go in __dirname/views
// layouts in __dirname/view/layouts
app.set('views', 'views');

...

```

Create views/layouts/application.html. This will be the default layout.

Within the context of a layout, yield identifies a section where content from the view should be inserted. The simplest way to use this is to have a single yield, into which the entire contents of the view currently being rendered is inserted:

```html
<!doctype html>
<html>
<head>
    <title>Thulium</title>
</head>
<body>
    <header>
        <h1>Application layout</h1>
    </header>
    <div>
        <%= yield %>
    </div>
    <footer>
        <p>The footer</p>
    </footer>
</body>
</html>

```

Write a route:

```javascript
app.get('/', function(req, res) {
      res.render('home/index.html', {layout : 'application', posts : ["1", "2", "3", "4", "5"]});
});
```

Write the view for the route 

```html
// views/home/index.html
<% posts.forEach(function(post) { %>
    <p>Post : <%= post %></p>
<% }) %>

```

### Partials

Partial templates are another device for breaking the rendering process into more manageable chunks. With a partial, you can move the code for rendering a particular piece of a response to its own file.

To render a partial as part of a view, you use the renderPartial method within the view:

```html
<div>
	<%= renderPartial('shared/posts', {posts : [1,2,3]}) %>
</div>
```