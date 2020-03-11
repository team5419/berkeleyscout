// default to false. will be update in onSignin and onSignout
let isSignedIn = false

// load the api
gapi.load('client:auth2', () => gapi.client.init({
    // see constants.js
    apiKey, clientId,
    // wtf is this. I sure dont know. Dont touch it unless you do.
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    // ask for permission for google sheets.
    scope: "https://www.googleapis.com/auth/spreadsheets"
}).then(() => {
    // set up the sign in  and out buttons
    document.getElementById('signin_button').onclick = () => gapi.auth2.getAuthInstance().signIn()
    document.getElementById('signout_button').onclick = () => gapi.auth2.getAuthInstance().signOut()

    // a callback for when the sign-in state changes.
    let onSignInStatusChanges = isSignedIn => isSignedIn ? onSignin() : onSignout()

    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(onSignInStatusChanges)

    // Handle the initial sign-in state.
    onSignInStatusChanges(gapi.auth2.getAuthInstance().isSignedIn.get())
}).catch(console.error))

// a list of all games we have stored up
let games = []

// and a set of all qr codes to make sure we dont record data twice
let codes = new Set()

// what should we do when we sign in
function onSignin() {
    // update the signed in flag
    isSignedIn = true

    // hide the sign in button and show the sign out button
    document.getElementById('signin_button').style.display = 'none'
    document.getElementById('signout_button').style.display = 'block'
}

// what should we do when we sign out
function onSignout() {
    // update the signed in flag
    isSignedIn = false
    
    // hide the sign out button and show the sign in button
    document.getElementById('signin_button').style.display = 'block'
    document.getElementById('signout_button').style.display = 'none'
}

// upload a match to sheets
function appendGame(game) {
    // figure out the letter for the last character in the 
    let endCol = String.fromCharCode(startCol.charCodeAt(0) + game.length - 1)

    // append the data to the first availiable spot in range
    // see: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append
    return gapi.client.sheets.spreadsheets.values.append({
        // get this from url of spreadsheet we want to edit
        spreadsheetId: sheetId,
        // get the range in witch matches can be uploaded
        range: `${tableName}!${startCol}2:${endCol}2`,
        // make so that it parses input data correctly
        valueInputOption: "USER_ENTERED",
        // 2d array of the data we want to send over
        resource: {values: [game]}
    }).then(console.log).catch(console.log)
}

// get refrence to elements needed for camera
const stream = document.getElementById("stream")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

// link the camera to the stream
navigator.mediaDevices.getUserMedia({ video: true }).then(camera => {
    // tell the video object to use the camera as a souce for it
    stream.srcObject = camera

    // and hit play
    stream.play()
}).catch(console.error)

// scan the image to see if there is a qr code in view
function scan() {
    // get width and height of image
    let width  = Math.floor(stream.videoWidth)
    let height = Math.floor(stream.videoHeight)

    // make all the widths equal so it dosent crop the image
    canvas.width = ctx.width = width
    canvas.height = ctx.height = height

    // if they are zero then its not ready yet
    if (width == 0 || height == 0) return null

    // draw the image on to the canvas
    ctx.drawImage(stream, 0, 0, width, height)

    // then load if back to get it as an ImageData
    let imageData = ctx.getImageData(0, 0, width, height)

    // do the scan!
    let data = jsQR(imageData.data, imageData.width, imageData.height)

    // the data as a string is stored in data.data
    if (data !== null) return data.data
}

// scan the image repeatedly
setInterval(() => {
    // we dont even want to scan if were not logged in
    // if (!isSignedIn) return

    // get the data from the scan
    let data = scan()

    // nothing was found, lets bounce
    if (data == undefined || data == null || data.data == "") return

    // weve allready scaned this data, is no good
    if ( codes.has(data) ) return

    // add it to the list of codes to make sure we dont scan it again
    codes.add(data)

    // yay! we actually have data!
    onData(data)
}, scanInterval)

// what should we do when we get a successful qr code?
function onData(data) {
    // the game data is stored as csv so lets split it apart
    console.log("scanned, data is: " + data)
    
    let game = data.split(";")

    if (game[2] == undefined) {
        console.log(`game[0] is ${game[0]}`)
        return
    }

    $("#data").append(`
        <tr>
            <th scope="row">${game[2]}</th>                        
            <td>${game[0]}</td>
            <td>${game[1]}</td>
            <td>${(game[4] == "true")? "Yes": "No"}</td>
            <td>${(game[5] == "true")? "Yes": "No"}</td>
            <td>${(game[6] == "true")? "Yes": "No"}</td>
            <td>${game[17]}</td>
        </tr>
    `)

    $("#color").attr("style", "background-color: green")
    $("#status").text("SCANNED")
    setTimeout(() => {$("#color").attr("style", "background-color: red"); $("#status").text("Waiting for scan...")}, 1000)
    console.log("index 0 is: " + game[0])

    // lets just immidatly append the data to the sheets
    appendGame(game)
}