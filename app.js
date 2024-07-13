const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const path = require('path');
const bodyParser = require('body-parser');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const serviceAccountBase64 = process.env.GOOGLE_SERVICE_ACCOUNT_BASE64;

if (!serviceAccountBase64) {
  throw new Error('The GOOGLE_SERVICE_ACCOUNT_BASE64 environment variable is not set.');
}

const serviceAccountBuffer = Buffer.from(serviceAccountBase64, 'base64');
const serviceAccount = JSON.parse(serviceAccountBuffer.toString('utf-8'));

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: SCOPES,
});

async function getPlaces() {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A1:G',
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) {
    throw new Error('No data found in the sheet');
  }

  const places = rows.slice(1).map((row, index) => ({
    name: row[0],
    area: row[1],
    openingHours: row[2],
    startingPrice: row[3],
    internetSpeed: row[4],
    votes: parseInt(row[5], 10) || 0,
    mapLink: row[6] || '',
    index: index + 2, // 1-based index including header row
  }));

  return places.sort((a, b) => b.votes - a.votes);
}

async function updateVotes(index, votes) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `Sheet1!F${index}`,
    valueInputOption: 'RAW',
    resource: { values: [[votes]] },
  });
}

async function addPlace(place) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  await sheets.spreadsheets.values.append({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A:G',
    valueInputOption: 'RAW',
    resource: {
      values: [
        [
          place.name,
          place.area,
          place.openingHours,
          place.startingPrice,
          place.internetSpeed,
          place.votes,
          place.mapLink
        ]
      ]
    }
  });
}

app.get('/', async (req, res) => {
  try {
    const places = await getPlaces();
    res.render('index', { places });
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    res.status(500).send('Error fetching data');
  }
});

app.get('/add-recommendation', (req, res) => {
  res.render('add-recommendation');
});

app.post('/add-recommendation', async (req, res) => {
  const { name, area, openingHours, startingPrice, internetSpeed, mapLink } = req.body;
  const newPlace = {
    name,
    area,
    openingHours,
    startingPrice,
    internetSpeed,
    votes: 0,
    mapLink
  };

  try {
    await addPlace(newPlace);
    res.redirect('/');
  } catch (error) {
    console.error('Error adding new place:', error);
    res.status(500).send('Error adding new place');
  }
});

app.post('/vote', async (req, res) => {
  const { index, action } = req.body;

  try {
    const places = await getPlaces();
    const place = places.find(place => place.index === index);

    if (!place) {
      return res.status(404).send('Place not found');
    }

    let newVotes = place.votes;
    if (action === 'upvote') {
      newVotes += 1;
    } else if (action === 'downvote') {
      newVotes = Math.max(newVotes - 1, 0);
    }

    await updateVotes(index, newVotes);
    res.send({ success: true, votes: newVotes });
  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).send({ success: false, message: 'Error updating votes' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
