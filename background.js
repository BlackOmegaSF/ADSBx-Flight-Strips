const adsbx = "https://globe.adsbexchange.com"

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  async function getFlightAwareData(callsign) {
    try {
        const url = `https://flightaware.com/live/flight/${callsign}`
        const response = await fetch(url)
        let text = await response.text()
        let lineResult = text.match(/<script>var trackpollBootstrap =.*$/gm)
        let trimmed = lineResult[0].match(/{.*}/)[0]
        let parsed = JSON.parse(trimmed)
        let thisFlight = parsed.flights[Object.keys(parsed.flights)]
        let airlineCallsign = thisFlight.airline.callsign
        let origin = thisFlight.origin.icao
        let originName = thisFlight.origin.friendlyName
        let destination = thisFlight.destination.icao
        let destinationName = thisFlight.destination.friendlyName
        let planAlt = thisFlight.flightPlan.altitude
        let route = thisFlight.flightPlan.route

        return {airlineCallsign, origin, originName, destination, destinationName, planAlt, route}

    } catch (e) {
        return `Error getting FlightAware data: ${e.message}`
    }


}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const Fakepromise = new Promise((resolve, reject) => {
        delay(1000).then(resolve("Received message"))
    })
    getFlightAwareData(request.callsign).then(sendResponse)
    return true;
});