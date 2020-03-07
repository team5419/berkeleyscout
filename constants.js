// even how offten should we scan? (in ms)
const scanInterval = 10

// get this from url of spreadsheet we want to edit
const sheetId = "1Nc7NNZmOd75HYn5kJ6SyO9mh1Uxw6zCXJV_UwfEhpSo"

// what table should we edit in the sheet
const tableName = "Sheet1"

// what row should we start append to. "A" means its glued to the side
const startRow = "A"

// identification variable for google api
// see: https://developers.google.com/sheets/api/quickstart/js
// node: make sure the apikey is allowed to run on site (team5418.github.org)
// you can do that at https://console.developers.google.com/apis/credentials
const apiKey = "AIzaSyBD9wsKIBZnvoOepvj901KJGfaf-mD_fjc"
const clientId = "706334111476-5e49epa87ltl3sg892b9omiplu26dep1.apps.googleusercontent.com"