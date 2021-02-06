const fs = require('fs')
// Load the data and convert to buffer
const dataBuffer = fs.readFileSync('1-json.json')
// Convert data to a string
const dataString = dataBuffer.toString()
// convert data to object
const data = JSON.parse(dataString)
// change the values
data.name = "Imran"
data.age = "34"
// turn data to string and write to the 1-json.json file
const userJSON = JSON.stringify(data)
fs.writeFileSync('1-json.json', userJSON)
