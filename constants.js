// even how offten should we scan? (in ms)
const scanInterval = 10

// get sheetId from url param 
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const sheetId = urlParams.get("id");

// what table should we edit in the sheet
const tableName = "Sheet1"

// what row should we start append to. "A" means its glued to the side
const startRow = "A"


function setAPIKey(newAPIKey) {
    apiKey = newAPIKey
}

function setClientId(newClientID) {
    clientId = newClientID
}

// identification variable for google api
// see: https://developers.google.com/sheets/api/quickstart/js
// node: make sure bore are allowed to run on site (team5419.github.org)
// you can do that at https://console.developers.google.com/apis/credentials
// you must create a new client id if its not configure to work for web application
let apiKey = "AIzaSyBD9wsKIBZnvoOepvj901KJGfaf-mD_fjc"
let clientId = "706334111476-a0796rgunk4uahlnd311aqipi31f9mm0.apps.googleusercontent.com"