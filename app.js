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
app.use(bodyParser.json());

const GOOGLE_SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const sheets = google.sheets({ version: 'v4', auth: GOOGLE_API_KEY });

async function getPlaces() {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: 'Sheet1!A1:F',
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
    index: index + 2, // 1-based index including header row
  }));

  return places.sort((a, b) => b.votes - a.votes);
}

async function updateVotes(index, votes) {
  await sheets.spreadsheets.values.update({
    spreadsheetId: GOOGLE_SHEET_ID,
    range: `Sheet1!F${index}`,
    valueInputOption: 'RAW',
    resource: { values: [[votes]] },
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
    res.send({ success: true });
  } catch (error) {
    console.error('Error updating votes:', error);
    res.status(500).send('Error updating votes');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
