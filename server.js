'use strict' 

const express = require('express')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const rawjs = require('raw.js');
const reddit = new rawjs("Node express Reddit Client");

reddit.setupOAuth2(process.env.clientID, process.env.clientSecret, process.env.callbackURL)
const app = express();

app.set('port', '80');
app.set('view engine', 'pug');

app.use(express.static(__dirname + '/public'));
app.use(cookieParser(process.env.secretKey))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(expressSession({ 
  secret: process.env.secretKey, 
  resave: false, 
  saveUninitialized: true
}));

app.get(['/', '/index', '/home'], (req, res) => {
  let config = {
    limit: 8,
  }
  reddit.hot(config, (err, response) => {
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
app.get('/random', (req, res) => {
  reddit.random((err, response) => {
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
      }, (err, com) => {
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

app.get('/search', (req, res) => {
  if (req.query.keyword) {
    reddit.search({
      q: req.query.keyword,
      sort: 'top',
      t: 'all'
    }, (err, response) => { 
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
app.get('/post', (req, res) => {
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

app.get('*', (req, res) => {
  res.status(404).json({
    message: '404'
  })
})

app.listen(app.get('port'))
