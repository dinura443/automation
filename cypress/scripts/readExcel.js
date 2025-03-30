const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path'); // Importing the 'path' module

function readExcelFile(filePath) {
  try {
    // Check if file path is provided
    if (!filePath) {
      throw new Error('File path is missing. Please provide a valid file path.');
    }

    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Ensure that there are at least two rows (headers and one row of values)
    if (data.length < 2) {
      throw new Error('Invalid Excel format: Expected at least two rows (headers and values).');
    }

    // Extract headers from the first row
    const headers = data[0];

    // Determine if it's an Order Data format or a Code/Description format
    if (headers.includes('Buyer') && headers.includes('PO') && headers.includes('Style')) {
      // Order Data Format
      const values = data[2]; // Assuming values are in the third row

      const orderData = {
        Buyer: values[headers.indexOf('Buyer')],
        PO: values[headers.indexOf('PO')],
        ERPKey: values[headers.indexOf('ERP Key')],
        Style: values[headers.indexOf('Style')],
        Season: values[headers.indexOf('Season')],
        ProductType: values[headers.indexOf('Product Type')],
        DeliveryDate: values[headers.indexOf('Delivery Date')],
        Destination: values[headers.indexOf('Destination')],
        Color: values[headers.indexOf('Color')],
        Size: values[headers.indexOf('Size')],
        Quantity: Number(values[headers.indexOf('Quantity')]),
      };

      // Log Order Data
      console.log(JSON.stringify(orderData, null, 2));

    } else if (headers.includes('Code') && headers.includes('Description')) {
      // Code/Description Format
      const rows = data.slice(1); // All rows after the header

      const parsedData = rows.map(row => ({
        Code: row[headers.indexOf('Code')],
        Description: row[headers.indexOf('Description')],
        DescriptionInEnglish: row[headers.indexOf('Description in English (Optional)')],
      }));

      // Log Code/Description Data
      console.log("Code/Description Data:", JSON.stringify(parsedData, null, 2), 'utf8');

      // Write to file in the fixtures folder
      const fixturePath = path.join('cypress', 'fixtures', 'update_reject_management.json');
      fs.writeFileSync(fixturePath, JSON.stringify(parsedData, null, 2), 'utf8');
    } else {
      throw new Error('Unrecognized Excel format.');
    }

  } catch (error) {
    console.error(`Error reading Excel file: ${error.message}`);
  }
}

// Get the file path from command line arguments
const filePath = process.argv[2];
readExcelFile(filePath);
