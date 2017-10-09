'use strict' 

var express = require('express');
// var bodyParser = require('body-parser');
// var cookieParser = require('cookie-parser');
// var expressSession = require('express-session');
var rawjs = require('raw.js');
var request = require('request');
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
function getRandom (req, res, next) {
  reddit.random(function (err, response) {
    if (err) {
      res.send({
        message: err,
        info: "api return"
      })
    } else {
      res.locals.response = response;
      next();
    }
  })
}

function getCommets (req, res, next) {
  reddit.comments({
    r: res.locals.response.data.subreddit,
    link: res.locals.response.data.id,
    limit: 5,
    comments: true
  }, function (err, com) {
     if(err) {
       res.json({
         err,
         info: "Api Return"
        });
     }else {
      res.locals.com = com;
      next()
     }
  })
}
app.get('/random',getRandom, getCommets ,function (req, res) {
  res.render('random', {
    post: res.locals.response,
    comments: res.locals.com.data.children,
    url: res.locals.response.data.preview ? res.locals.response.data.preview.images[0].source.url || "" : ""
  });
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

function getInfo (req, res, next) {
  // nottheonion => r
  // id ...7511p5
  var url = 'https://www.reddit.com/r/'+req.query.r+'/comments/'+req.query.id+'.json';
  // if (req.query.q || req.query.id) {
  //   res.json({
  //     message: 'empty query string'
  //   })
  // }
  request({
    url,
    json: true,
    jsonReviver: true
  }, function(e, r, b) {
    if (e || r.statusCode == '404' || r.statusCode == '403') {
      res.send(e|| { message: r.statusCode });
    }
    else {
      res.locals.postInfo = b;
      next()
    }
  })
}
// view for post details and comments...
app.get('/post', getInfo, function (req, res) {
  // params.sub...and query
  // res.json(res.locals.postInfo[0]);
  // {"message": "Not Found", "error": 404}
  res.render('post', {
    post: res.locals.postInfo[0].data.children[0].data || {}, 
    url: res.locals.postInfo[0].data.children[0].data.url || "",
    comments: res.locals.postInfo[1].data.children || []
  });
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
