const UUID = "9D38FFB8-3E52-4A95-845E-813FC4DA6DAD";
const NAME = "Dot";

const HOMEBRIDGE = "192.168.0.50"; // ip address or hostname for machine running homebridge
const PORT       = 28081;              // port that homebridge-iota is listening on

/**
 **
 **
 **   
 **/

const URI = "http://" + HOMEBRIDGE + ":" + PORT;

const SERVICE_OCCUPANCY = "OccupancySensor";
const SERVICE_BUTTON    = "StatelessProgrammableSwitch";

const OCCUPANCY_NOT_DETECTED = 0;
const OCCUPANCY_DETECTED     = 1;

const SINGLE_PRESS = 0;

function onEnterRange() {
	//called enter the range of a Dot
	sendWebRequest(URI, null, {'uuid': UUID, 'name': NAME, 'state': OCCUPANCY_DETECTED, 'service': SERVICE_OCCUPANCY}, 'POST', handleResult);

	setLED('00ff00');
	setTimeout(5, dimLED, {});
}
            
function onExitRange() {
	//called when you exit the range of a Dot
	sendWebRequest(URI, null, {'uuid': UUID, 'name': NAME, 'state': OCCUPANCY_NOT_DETECTED, 'service': SERVICE_OCCUPANCY}, "POST", handleResult);
	setLED('ff3300');
	setTimeout(5, dimLED, {});
}

function onButtonPress() {
    sendWebRequest(URI, null, {'uuid': UUID, 'name': NAME, 'state': SINGLE_PRESS, 'service': SERVICE_BUTTON}, "POST", handleResult);
    //setLED('000000');
}

function handleResult(data) {
    
}

function dimLED(obj) {
    setLED('000000');
}
