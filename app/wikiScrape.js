const jsdom = require('jsdom')
const fs = require('fs')
const html = fs.readFileSync('./app/kerbalWiki.html').toString()

const { JSDOM } = jsdom
const dom = new JSDOM(html)

// grabs headers, then rows for data
let headers = dom.window.document.querySelectorAll('table th')
let data = dom.window.document.querySelectorAll('tbody tr')

// creates a list, pushes the header names in after trimming \n
// takes header list, row list (data), and sends out the array and row list
const buildCsv = (h, cb) => {
  // start with empty string for proper csv -> json conversion
  let csvList = ['']
  h.forEach(head => csvList.push(head.textContent.trim()))
  // next row
  csvList.push('\n')
  cb(csvList)
}

// after headers at put in the list, this iterates over rows and pulls data
const sortData = function(csv, data) {
  // for each row
  data.forEach(d => {
    // for each cell
    d.querySelectorAll('td').forEach(da => {
      // if actual value stored
      let localData = da.getAttribute('data-sort-value')
      if (localData) {
        csv.push(localData)
      // else look at text content
      } else {
        // grrrrr
        csv.push(parseFloat(da.textContent))
      }
    })
    // next row
    csv.push('\n')
  })
  return csv
}

// makes new promise, writes resolved promise to text file
const y = new Promise((resolve, reject) => {
  const x = buildCsv(headers, (c) => resolve(sortData(c, data)))
})
  // writes to data file or throws error (maybe?)
  .then(response => fs.writeFile('data.txt', response, (err) => {
    if (err) {
      console.log(err)
    } else {
      console.log('written')
    }
  }))
  .catch(err => console.log(err))
