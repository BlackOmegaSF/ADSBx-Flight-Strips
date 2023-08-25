
window.addEventListener('DOMContentLoaded', () => {
    let bg = chrome.extension.getBackgroundPage();

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        let currentTabId = tabs[0].id
        let currentCallsign = bg.flightStrip[currentTabId]

        document.getElementById("Callsign").innerHTML = currentCallsign
    })
})