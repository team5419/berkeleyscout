$("#submit").click(() => {
    newAPIKey = $("#APIKey").val()
    newClientID = $("#clientID").val()
    setAPIKey(newAPIKey)
    setClientId(newClientID)

    console.log(apiKey)
    console.log(clientId)
});