// set up the sign in button
var authorizeButton = document.getElementById('authorize_button')
authorizeButton.onclick = () => gapi.auth2.getAuthInstance().signIn()

// set up the sign out button
var signoutButton = document.getElementById('signout_button')
signoutButton.onclick = () => gapi.auth2.getAuthInstance().signOut()

// load the api
gapi.load('client:auth2', () => gapi.client.init({
    apiKey: 'AIzaSyBD9wsKIBZnvoOepvj901KJGfaf-mD_fjc',
    clientId: '706334111476-5e49epa87ltl3sg892b9omiplu26dep1.apps.googleusercontent.com',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
}).then(() => {
    // a callback for when the sign-in state changes.
    let onSignInStatusChanges = isSignedIn => isSignedIn ? onSignin() : onSignout()

    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(onSignInStatusChanges)

    // Handle the initial sign-in state.
    onSignInStatusChanges(gapi.auth2.getAuthInstance().isSignedIn.get())
}).catch(console.error))

// get wether were signed in or not
let isSignedIn = false

// get refrence to elements needed for camera
const stream = document.getElementById("stream")
const canvas = document.getElementById("canvas")
const ctx = canvas.getContext('2d')

// link the camera to the stream
navigator.mediaDevices.getUserMedia({ video: true }).then(camera => {
    stream.srcObject = camera
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

    // do the scan
    let data = jsQR(imageData.data, imageData.width, imageData.height)

    if (data !== null) return data.data
}

// even how many ms should we scan?
const scanInterval = 10

// scan the image repeatidly
setInterval(() => {
    // we dont even want to scan if were not logged in
    if (!isSignedIn) return

    // get the data from the scan
    let data = scan()

    // nothing was found, lets bounce
    if (data == undefined || data == null) return

    // weve allready scaned this data, is no good
    if ( codes.has(data) ) return

    // add it to the list of codes to make sure we dont scan it again
    codes.add(data)

    // yay! we actually have data!
    onData(data)
}, scanInterval)

// a list of all games we have stored up
let games = []

// and a set of all qr codes to make sure we dont record data twice
let codes = new Set()

// what should we do when we get a successful qr code?
function onData(data) {
    // the game data is stored as csv so lets split it apart
    let game = data.split(",")

    console.log(game)

    uploadMatch(game)
}

// what should we do when we sign in
function onSignin() {
    isSignedIn = true

    authorizeButton.style.display = 'none'
    signoutButton.style.display = 'block'
}

// what should we do when we sign out
function onSignout() {
    isSignedIn = false
    
    authorizeButton.style.display = 'block'
    signoutButton.style.display = 'none'
}

// upload a match to sheets
function uploadMatch(game) {
    let start = "A"
    let end = String.fromCharCode(start.charCodeAt(0) + game.length - 1)

    //see: https://developers.google.com/sheets/api/reference/rest/v4/spreadsheets.values/append

    return gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: "1Nc7NNZmOd75HYn5kJ6SyO9mh1Uxw6zCXJV_UwfEhpSo",
        range: `Sheet1!${start}${1}:${end}${10}`,
        valueInputOption: "USER_ENTERED",
        resource: {values: [game]}
    }).then(console.log).catch(console.log)
}