# homebridge-iota

[![npm package](https://nodei.co/npm/homebridge-iota.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/homebridge-iota/)

[![NPM Version](https://img.shields.io/npm/v/homebridge-iota.svg)](https://www.npmjs.com/package/homebridge-iota)

IoTa Labs Dot platform plugin for [Homebridge](https://github.com/nfarina/homebridge).

# Installation

1. Install homebridge using: npm install -g homebridge
2. Install this plugin using: npm install -g homebridge-iota
3. Update your configuration file. See the sample below.

# Updating

- npm update -g homebridge-iota

# Configuration

Configuration sample:

 ```javascript
"platforms": [
    {
        "platform": "IoTa",
        "name": "IoTa"
    }
]

```

# Dot code
1. The `dot.js` file should be modified on Dot by Dot basis by modifying the constants for ...
  * `UUID`
  * `NAME`
  * `HOMEBRIDGE`
  * `PORT`
 2. The modified code should then be loaded onto a Dot using the Dot Editor https://developer.doteverything.co/
