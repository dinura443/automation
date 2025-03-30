const {merge} = require('mochawesome-merge');
const fs = require('fs');

const options = {
    files: [
        'cypress/report/mochawesome-report/*.json',
    ],
}
merge(options)
    .then(report => {
        console.log(`These are the stats of the merged json we will write: ${JSON.stringify(report.stats)}`);
        fs.writeFileSync('cypress/report/mochawesome-report/mochawesome.json', JSON.stringify(report, null, 2));
    })
    .catch(error => {
        console.error('Error merging reports:', error);
    });