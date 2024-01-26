const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

async function hlsUrl(videoUrl) {
  try {
    const response = await fetch(videoUrl);
    const text = await response.text();
    if(text){
      console.log('Got data');
    }

    const hlsManifestMatch = text.match(/"hlsManifestUrl":"([^"]+\.m3u8)"/);

    if (hlsManifestMatch && hlsManifestMatch[1]) {
      console.log(hlsManifestMatch[1]);
      return hlsManifestMatch[1];
    }else{
      console.log('Cannot find link');
    }
  } catch (error) {
    console.log(error);
  }
}


app.get('/', (req, res) => {
  res.send('Youtube live streaming SERVER!');
})


app.get('/prx', async (req, res) => {
  const videoUrl = req.query.url;
  const response = await fetch(videoUrl);
  const text = await response.text();
  res.send(text);
})

app.get('/prx-image', async (req, res) => {
  try {
    const imageUrl = req.query.url;
    const imageResponse = await fetch(imageUrl);

    if (!imageResponse.ok) {
      throw new Error('Failed to fetch image');
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    res.set('Content-Type', imageResponse.headers.get('content-type'));
    res.send(buffer);
  } catch (error) {
    console.error('request error:', error);
    res.status(500).send('request error');
  }
});


app.get('/stream', async (req, res) => {
  const channelName = req.query.ch;
  try {
    const result = await hlsUrl(`https://www.youtube.com/${channelName}`);
    if (result) {
      res.redirect(result);
    }
  }
  catch (e) {
    console.log(e);
  }

})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
