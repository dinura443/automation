const { generateRandomRecord, generateRandomRecordFormat2 } = require('./util/helperFunction');
const fs = require('fs');
const XLSX = require('xlsx');
const path = require('path');
const { faker } = require('@faker-js/faker');

// Get command line arguments
const args = process.argv.slice(2);
const fileName = args[0];
const operationType = args[1] || 'update';
const folderpath = args[2];
const formatType = args[3];

if (!fileName || !folderpath || !formatType) {
    console.error('Missing required arguments.');
    process.exit(1);
}

// Define file paths
const filePath = path.join(__dirname, '../../cypress/fixtures', folderpath, fileName);
const jsonFilePath = path.join(__dirname, '../../cypress', 'fixtures', 'generatedData.json');

// Read JSON file
fs.readFile(jsonFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading JSON file:', err);
        process.exit(1);
    }

    let jsonData;
    try {
        jsonData = JSON.parse(data);
    } catch (parseError) {
        console.error('Error parsing JSON file:', parseError);
        process.exit(1);
    }

    // Execute based on the operation type
    if (operationType === 'update') {
        try {
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (data.length >= 2 && data[1].length > 0) {
                const newRecord = formatType === 'Format1' ? generateRandomRecord() : generateRandomRecordFormat2();
                data.push(Object.values(newRecord));
                const updatedWorksheet = XLSX.utils.aoa_to_sheet(data);
                workbook.Sheets[sheetName] = updatedWorksheet;
                XLSX.writeFile(workbook, filePath);

                console.log(JSON.stringify(newRecord));
                console.log(`File updated with new record and saved to ${filePath}`);
            } else {
                console.error('The template format is not as expected.');
            }
        } catch (fileError) {
            console.error('Error processing Excel file:', fileError);
            process.exit(1);
        }
    } else if (operationType === 'new') {
        try {
            const newWorkbook = XLSX.utils.book_new();
            let newRecord;
            let newWorksheetData;

            if (formatType === 'Format1') {
                newRecord = generateRandomRecord();
                newWorksheetData = [
                    ['ORDER'],
                    ['Buyer', 'PO', 'ERP Key', 'Style', 'Season', 'Product Type', 'Delivery Date', 'Destination', 'Color', 'Size', 'Quantity'],
                    Object.values(newRecord)
                ];
            } else if (formatType === 'Format2') {
                newRecord = jsonData;
                newWorksheetData = [
                    ['Plan'],
                    ['Building', 'Floor', 'Line', 'Buyer', 'PO', 'ERP Key', 'Style', 'Product Type', 'Color', 'SMV', 'Operator', 'Helper', 'Iron Man', 'Quantity', 'Working Minutes', 'Planned Date'],
                    Object.values(newRecord)
                ];
            } else {
                console.error('Unrecognized format type.');
                process.exit(1);
            }

            const newWorksheet = XLSX.utils.aoa_to_sheet(newWorksheetData);
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Sheet1');
            const newFilePath = path.join(__dirname, '../../cypress/fixtures', folderpath, 'new_' + fileName);
            XLSX.writeFile(newWorkbook, newFilePath);

            console.log(JSON.stringify(newRecord));
            console.log(`New file created with one record and saved to ${newFilePath}`);
        } catch (fileError) {
            console.error('Error creating new Excel file:', fileError);
            process.exit(1);
        }
    } else {
        console.error('Unknown operation type:', operationType);
        process.exit(1);
    }
});
