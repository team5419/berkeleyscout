const fs = require('fs')
const readline = require('readline')
const {google} = require('googleapis')

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets', 'https://www.googleapis.com/auth/drive']

const TOKEN_PATH = 'token.json'

let test = (auth) => {
    const sheets = google.sheets({version: 'v4', auth})

    sheets.spreadsheets.values.update({
        spreadsheetId: '1Nc7NNZmOd75HYn5kJ6SyO9mh1Uxw6zCXJV_UwfEhpSo',
        range: 'Sheet1!A1:A1',
        valueInputOption: "USER_ENTERED",
        resource: {values: [["blablabla"]]}
    }, (err, res) => {
        if (err) {
            console.log(err)
        }

        return res
    })
}

let ask = (question, callback) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    rl.question(question, answer => {
        rl.close()
        callback(answer)
    })
}

fs.readFile('credentials.json', (err, content) => {
    if (err) return console.log('Error loading client secret file:', err)
    // Authorize a client with credentials, then call the Google Sheets API.
    authorize(JSON.parse(content), test)
})

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0])
  
    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getNewToken(oAuth2Client, callback)

        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
    })
}

function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    })

    console.log('Authorize this app by visiting this url:', authUrl)

    ask('Enter the code from that page here: ', (code) => {
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error while trying to retrieve access token', err)

            oAuth2Client.setCredentials(token)
            
            // Store the token to disk for later program executions
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err)
                console.log('Token stored to', TOKEN_PATH)
            })
            
            callback(oAuth2Client)
        })
    })
}
