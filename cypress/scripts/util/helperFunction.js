const { faker } = require('@faker-js/faker');
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

function generateRandomRecord() {
    return {
        'Buyer': faker.person.fullName(),
        'PO': faker.string.uuid(),
        'ERP Key': faker.string.alphanumeric(6).toUpperCase(),
        'Style': faker.commerce.productAdjective(),
        'Season': faker.date.month(),
        'Product Type': faker.commerce.product(),
        'Delivery Date': faker.date.future().toISOString().split('T')[0],
        'Destination': faker.location.street(),
        'Color': faker.color.human(),
        'Size': faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
        'Quantity': faker.number.int({ min: 50, max: 200 })
    };
}

function generateRandomRecordFormat2(Buyer, PO, Style, ProductType, Color) {
    return {
        'Building': "Building 01",//faker.location.buildingNumber(),
        'Floor': "Ground floor", //faker.number.int(1),
        'Line': "Line 07", //faker.string.alphanumeric(3).toUpperCase(),
        'Buyer': Buyer || faker.person.fullName(),
        'PO': PO || faker.string.uuid(),
        'ERP Key': faker.string.alphanumeric(6).toUpperCase(),
        'Style': Style || faker.commerce.productAdjective(),
        'Product Type': ProductType || faker.commerce.product(),
        'Color': Color || faker.color.human(),
        'SMV': faker.number.int({ min: 10, max: 50 }),
        'Operator': faker.number.int({ min: 10, max: 50 }),//faker.person.firstName(),
        'Helper': faker.number.int({ min: 10, max: 50 }),//faker.person.firstName(),
        'Iron Man': faker.number.int({ min: 10, max: 50 }),//faker.person.firstName(),
        'Quantity': faker.number.int({ min: 50, max: 200 }),
        'Working Minutes': faker.number.int({ min: 100, max: 500 }),
        'Planned Date': tomorrow.toISOString().split('T')[0],
    };
}

module.exports = {
    generateRandomRecord,
    generateRandomRecordFormat2
};