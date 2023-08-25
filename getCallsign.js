const adsbx = "https://globe.adsbexchange.com"

async function getCurrentTab() {
    let queryOptions = {active: true, lastFocusedWindow: true}
    let [tab] = await chrome.tabs.query(queryOptions)
    return tab
}

getCurrentTab().then(tab => {
    if (tab) {
        if (tab.url.startsWith(adsbx)) {
            if (tab.url.includes("?icao=")) {
                document.getElementById("Callsign").innerHTML = "Yup, aircraft selected"
            } else {
                document.getElementById("Callsign").innerHTML = "No aircraft selected"
            }
        } else {
            document.getElementById("Callsign").innerHTML = "Not on adsbx"
        }
    }
})

window.addEventListener("getCallsignData", function(data) {
    document.getElementById("Callsign").innerHTML = data
}, false);