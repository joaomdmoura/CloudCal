var fs         = require('fs');
var readline   = require('readline');
var google     = require('googleapis');
var googleAuth = require('google-auth-library');

const storage         = require('electron-json-storage');
const electron        = require('electron');
const {ipcMain}       = electron
const {BrowserWindow} = electron;

var SCOPES     = ['https://www.googleapis.com/auth/calendar'];
var TOKEN_DIR  = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'cloudcal.json';

function googleSync(win){
  fs.readFile(`${__dirname}/../config/client_secret.json`, function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    authorize(JSON.parse(content), storeEvents, win);
  });
}

module.exports = {
    googleSync: googleSync
};

// HELPERS

function authorize(credentials, callback, win) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client, win);
    }
  });
}

function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });

  integrationwin = new BrowserWindow({width: 400, height: 320});
  integrationwin.loadURL(`file://${__dirname}/../pages/authorize_google.html`);

  ipcMain.on('googleAuth', (event) => {
    googlewin = new BrowserWindow({width: 600, height: 600});
    googlewin.loadURL(authUrl);
  });

  ipcMain.on('googleIntegrate', (event, code) => {
    integrationwin.close()
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

function storeEvents(auth, win) {
  var today        = new Date();
  var currentMonth = today.getMonth();
  var currentYear  = today.getFullYear();

  var calendar = google.calendar('v3');
  calendar.events.list({
    auth: auth,
    calendarId: 'primary',
    timeMin: (new Date(currentYear, currentMonth, 1)).toISOString(),
    maxResults: 500,
    singleEvents: true,
    orderBy: 'startTime'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var events = response.items;
    if (events.length == 0) {
      console.log('No upcoming events found.');
    } else {
      storage.set('events', events, function(error) {
        if (error) throw error;
        win.webContents.send('eventsReceived', events);
      });
    }
  });
}
