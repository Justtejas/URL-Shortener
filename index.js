require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const mongodb = require('mongodb')
const dns = require('dns');
const urlparser = require('url');
const URI = process.env.DB_URI;
mongoose.connect(URI, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.set('strictQuery', true);
const URLSchema = new mongoose.Schema({ url: 'string' })
const URL = mongoose.model('url', URLSchema);
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  
  const originalURL = req.body.url;
  
  const parsedLookupUrl = urlparser.parse(originalURL);
  dns.lookup(parsedLookupUrl.hostname, (err, address) => {
    if (!address) {
      res.json({ error: 'invalid url' })
    } else {
      const url = new URL({ url: originalURL });
      url.save((err, data) => {
        if (err) return console.log(err)
        res.json({
          original_url: data.url,
          short_url: data.id
        })
      })
    }
  })

})

app.get('/api/shorturl/:id', (req, res) => {
  const id = req.params.id
  URL.findById(id, (err, data) => {
    if (!data) {
      res.json({
        error: 'invalid url'
      })
    } else {
      res.redirect(data.url)
    }
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
