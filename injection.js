const adsbx = "https://globe.adsbexchange.com"

const heavies = ["A34", "A35", "B70", "B74", "N74", "B75", "B76", "B77", "B78", "A12", "A22", "A30", "A3S", "DC1", "DC8", "IL9", "IL7", "L10", "MD1", "CON"]
const supers = ["A38"]

var updateRunning = false;
var tableTaskRunning = false;

var selectedIcao = "AAAAAA"

window.addEventListener("message", function(event) {
    if (event.data.type
        && (event.data.type == "FROM_PAGE")
        && typeof chrome.app.isInstalled !== 'undefined') {
        chrome.runtime.sendMessage({callsign: event.data.callsign})
        }
}, false)

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        th.style.width = key
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table) {
    //Example data structure: { width: "12%", rows: 3, border: false }

    let columnWidths = [
        { width: "12%", rows: 3, border: false },
        { width: "10%", rows: 3, border: true }, 
        { width: "10%", rows: 4, border: false }, 
        { width: "50%", rows: 4, border: false }, 
        { width: "6%", rows: 3, border: true }, 
        { width: "6%", rows: 3, border: true }, 
        { width: "6%", rows: 3, border: true }
    ]
    let row = table.insertRow();
    row.style.borderCollapse = "collapse"

    let i = 0
    for (let column of columnWidths) {
        let cell = row.insertCell();
        cell.style.width = column.width
        let innerTable = document.createElement('table');
        innerTable.id = `${table.id}${i}`
        innerTable.style.height = "100%"
        innerTable.style.width = "100%"
        innerTable.style.border = "1px solid black"
        innerTable.style.borderCollapse = "collapse"
        for (let i = 0; i < column.rows; i++) {
            let innerCell = innerTable.insertRow();
            innerCell.style.textAlign = "center"
            innerCell.style.verticalAlign = "middle"
            if (column.border) {
                innerCell.style.border = "1px solid black"
                innerCell.style.borderCollapse = "collapse"
            }
            let testText = document.createTextNode(column.width)
            innerCell.appendChild(testText)
        }
        cell.appendChild(innerTable)
        i++
    }

}

function injectTable(callsign, type, squawk) {
    tableTaskRunning = true;
    $.get(chrome.runtime.getURL('/flightStrip.html'), function(data) {
        $(data).appendTo('#stripArea')
        updateTableData(callsign, type, squawk)
        tableTaskRunning = false;
    })

}

function updateTableData(callsign, type, squawk) {
    updateRunning = true;

    //Set callsign
    $('#flightStripTextInfo td').eq(0).html(callsign)
    //Set type
    $('#flightStripTextInfo td').eq(1).html(type)
    //Set Squawk
    $('#flightStripNumberInfo td').eq(0).html(squawk)

    //Get from FlightAware
    chrome.runtime.sendMessage({callsign: callsign}).then((response) => {
        //console.log(response)

        $('#flightStripRouteRemarks td').eq(3).html(`${response.airlineCallsign} // ${response.destinationName}`)
        $('#flightStripApts td').eq(0).html(response.origin)
        $('#flightStripApts td').eq(1).html(response.destination)
        $('#flightStripNumberInfo td').eq(2).html(response.planAlt)
        $('#flightStripRouteRemarks td').eq(0).html(response.route)

        updateRunning = false
    })

}

function showStripIfNeeded() {
    var main_container = document.getElementById("layout_container")
    var infoblock = document.getElementById("selected_infoblock")
    var table = document.getElementById("flightStripTable")
    var stripArea = document.getElementById("stripArea")
    if (!infoblock || infoblock.style.display == "none") {
        //DEBUG
        //console.log("No craft selected")
        main_container.style.height = "100%"
        if (stripArea) {
            stripArea.remove()
        }
        return
    }

    main_container.style.height = "75%"

    //Now we know the info block is shown, scrape data from it
    let params = (new URL(document.location)).searchParams;
    let icao = params.get("icao").toUpperCase()

    var callsign = document.getElementById("selected_callsign").textContent
    var type = document.getElementById("selected_icaotype").textContent
    var first3Type = type.substring(0,3)
    if (heavies.includes(first3Type)) {
        type = `H/${type}`
    } else if (supers.includes(first3Type)) {
        type = `J/${type}`
    }
    type = `${type}/L`

    var squawk = document.getElementById("selected_squawk1").textContent

    //console.log("ICAO: " + icao + ", " + callsign, ", " + type + ", " + squawk)

    if (!stripArea) {
        stripArea = document.createElement("div")
        stripArea.id = "stripArea"
        var stripWidth = $(window).width() - 200
        stripArea.style.width = stripWidth.toString() + "px"
        stripArea.style.height = "25%"
        stripArea.style.position = "fixed"
        stripArea.style.color = "black"
        stripArea.style.bottom = 0
        stripArea.style.right = 0
        document.body.appendChild(stripArea)
    }

    if (!table && !tableTaskRunning) {
        injectTable(callsign, type, squawk)
    }

    if (!updateRunning) {
        if (selectedIcao != icao) {
            selectedIcao = icao
            updateTableData(callsign, type, squawk)
        }
    }

}

var interval = setInterval(showStripIfNeeded, 1000)


