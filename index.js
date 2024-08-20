require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const app = express();
var bodyParser = require('body-parser');
const dns = require('dns');
const client = new MongoClient(process.env.DB_URL, {});
const db = client.db('urlshortner');
const urls = db.collection('urls');
const urlparsing = require('url');


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl', function(req, res) {
  const url = req.body.url
  
  const dnslookup = dns.lookup(urlparsing.parse(url).hostname, async (err, address) => {
    if(!address){
      res.json({error: "invalid url"})
    }
    else{
      const urlcount = await urls.countDocuments({})
      const urlDoc = {
        url: req.body.url,
        short_url: urlcount
      }
      const result = await urls.insertOne(urlDoc)
      console.log(result);
      res.json({original_url: url, short_url: urlcount})
    }
  })
});

app.get('/api/shorturl/:short_url', async(req, res) => {
  const shorturl = req.params.short_url;
  const docUrl = await urls.findOne({short_url: +shorturl})
  res.redirect(docUrl.url)
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
