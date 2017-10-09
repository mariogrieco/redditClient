'use strict' 

var express = require('express')
// var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var expressSession = require('express-session');
var rawjs = require('raw.js');
var reddit = new rawjs("Node express Reddit Client");

reddit.setupOAuth2(process.env.clientID, process.env.clientSecret, process.env.callbackURL)
var app = express();

app.set('PORT', process.env.PORT || '80');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
// app.use(cookieParser(process.env.secretKey))
// app.use(bodyParser.urlencoded({ extended: false }))
// app.use(bodyParser.json())
// app.use(expressSession({ 
  // secret: process.env.secretKey, 
  // resave: false, 
  // saveUninitialized: false
// }));

app.get('/', function (req, res) {
  var config = {
    limit: 8,
  }
  reddit.hot(config, function (err, response) {
    if (err) {
      res.send({
        message: err
      })
    }else {
      res.render('index', {
        posts: response.children
      });
    }
  })
})

// view for random post
app.get('/random', function (req, res) {
  reddit.random(function (err, response) {
    if (err) {
      res.send({
        message: err,
        info: "api return"
      })
    }else {
      reddit.comments({
        r: response.data.subreddit,
        link: response.data.id,
        limit: 4,
        comments: true
      }, function (err, com) {
         if(err) {
           res.json({
             err,
             info: "Api Return"
            });
         }else {
          res.render('random', {
            post: response,
            comments: com.data.children,
            url: response.data.preview ? response.data.preview.images[0].source.url || "" : ""
          });
         }
      })
    }
  })
})

app.get('/search', function (req, res) {
  if (req.query.keyword) {
    var config = {
      q: req.query.keyword,
      sort: 'top',
      t: 'all'
    }
    reddit.search(config, function (err, response) { 
      if (err) {
        res.send({
          message: err
        })
      }else {
        res.render('search', {
          posts: response.children,
          title: req.query.keyword
        });
      }
    })
  }
  else {
    res.send({
      message: 'query string empty'
    })
  }
});

// view for post details and comments...
app.get('/post', function (req, res) {
  // params.sub...and query
  // res.render('post',)
  // https://www.reddit.com/r/{{sub}}/comments/{{id}}.json
  res.render('post');
})

/**
 * Optional method for extra features...
 * 
 * 
 */

// app.get('/api/hot', (req, res) => {
//   reddit.hot((err, response) => {
//     if (err) {
//       res.status(400).send({
//         message: err
//       })
//     }else {
//       res.send(response);
//     }
//   })
// });

// app.get('/api/controversial', (req, res) => {
//   reddit.controversial((err, response) => {
//     if (err) {
//       res.status(400).send({
//         message: err
//       })
//     }else {
//       res.send(response);
//     }
//   })
// });

// app.get('/api/random', (req, res) => {
//   reddit.random((err, response) => {
//     if (err) {
//       res.status(400).send({
//         message: err
//       })
//     }else {
//       res.send(response);
//     }
//   })
// });

// app.get('/api/search/:query', (req, res) => {
//   // t - One of hour, day, week, month, year, all to filter the time period that is searched
//   // q - A query string no longer than 512 characters with reddit search syntax
//   // sort - One of relevance, new, hot, top, comment
//       // https://www.reddit.com/wiki/search
//   reddit.search({
//     q: req.params.query,
//     sort: 'relevance'
//   }, (err, response) => {
//     if (err) {
//       res.status(400).send({
//         message: err
//       })
//     }else {
//       res.send(response);
//     }
//   })
// });

// app.get('/api/comments', (req, res) => {
//   reddit.comments({
//     r: req.query.r,
//     link: req.query.id,
//     comments: true
//   }, (err, response) => {
//      if(err) {
//        res.json(err);
//      }else {
//        res.json(response);
//      }
//   })
// })

app.get('*', function (req, res) {
  res.status(404).json({
    message: '404'
  })
})

app.listen(app.get('PORT'), function () {
  console.log('listen at ', app.get('PORT'))
})
