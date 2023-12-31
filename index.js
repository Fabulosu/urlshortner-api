require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient } = require('mongodb');

// Req
const dns = require("dns");
const urlparser = require("url");

// MongoDB
const client = new MongoClient(process.env.MONGO_URL);
const db = client.db("shortenurls");
const col = db.collection("urls");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post('/api/shorturl', (req, res) => {
  console.log(req.body);
  const url = req.body.url;
  const dnslookup = dns.lookup(urlparser.parse(url).hostname, async (err, address) => {
    if (!address){
      res.json({error: "Invalid URL"})
    } else {
      const docCount = await col.countDocuments({});

      const newUrl = {
        url,
        short_url: docCount
      }

      const result = await col.insertOne(newUrl);
      console.log(result);

      res.json({
        original_url: url,
        short_url: docCount,
      });
    }
  });
});

app.get("/api/shorturl/:short_url", async (req, res) => {
  const shorturl = req.params.short_url
  const shortenUrl = await col.findOne({ short_url: +shorturl })
  res.redirect(shortenUrl.url)
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});