var authorizeButton = document.getElementById('authorize_button')
authorizeButton.onclick = () => gapi.auth2.getAuthInstance().signIn()

var signoutButton = document.getElementById('signout_button')
signoutButton.onclick = () => gapi.auth2.getAuthInstance().signOut()

gapi.load('client:auth2', () => gapi.client.init({
    apiKey: 'AIzaSyBD9wsKIBZnvoOepvj901KJGfaf-mD_fjc',
    clientId: '706334111476-5e49epa87ltl3sg892b9omiplu26dep1.apps.googleusercontent.com',
    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    scope: "https://www.googleapis.com/auth/spreadsheets.readonly"
}).then(() => {
    let onSignInStatusChanges = isSignedIn => isSignedIn ? onSignin() : onSignout()

    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(onSignInStatusChanges)

    // Handle the initial sign-in state.
    onSignInStatusChanges(gapi.auth2.getAuthInstance().isSignedIn.get())
}).catch(error => console.error))

let isSignedIn = () => gapi.auth2.getAuthInstance().isSignedIn.get()

function onSignin() {
    authorizeButton.style.display = 'none'
    signoutButton.style.display = 'block'

    doStuff()
}

function onSignout() {
    authorizeButton.style.display = 'block'
    signoutButton.style.display = 'none'
}

function doStuff() {
    gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: '1Nc7NNZmOd75HYn5kJ6SyO9mh1Uxw6zCXJV_UwfEhpSo',
        range: 'Sheet1!A1:A1',
        valueInputOption: "USER_ENTERED",
        resource: {values: [["blablabla7"]]}
    }).then(response => {
        
    }).catch(err => {
        console.error(err)
    })
}