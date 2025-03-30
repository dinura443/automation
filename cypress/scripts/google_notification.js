const pushNotifications = require("@qbitum/qtaf-google-notification/src/pushNotification")
const mochawesomereport = require('../report/mochawesome-report/mochawesome.json');

config = {
    project_title:"MakeIT - UI Execution Summary",
    project_subtitle:"MakeIT Portal - Regression Test",
    owner:"Supeshala Kariyawasam",
    suite:"MI - REGRESSION TEST SUITE",
}
pushNotifications.pushNotifications(mochawesomereport,config).then(
    data => console.log("")
).catch(
    error => console.log(error)
)