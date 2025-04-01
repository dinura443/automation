// cypress/e2e/import-file.spec.ts

import { LoginPage } from "../../page-objects-and-services/page-objects/login-page";
import { DashBoard } from "../../page-objects-and-services/page-objects/dash-board";

const login = new LoginPage();
const dashboard = new DashBoard();

describe('File Import Test', () => {
  const itemName = 'States Analysis';
  const targetUrl = 'http://localhost:8088/dashboard/list/'; // Replace with the actual target URL
  const submitButtonSelector = 'button[type="submit"]'; // Replace with the actual submit button selector
  const filePath = '/home/john/Documents/automation/cypress/downloads'; // Specify the file path

  it('Should upload a specific file to the target URL', () => {
    // Step 1: Log in
    login.visitLoginPage();
    login.enterUsername('dinura');
    login.enterPassword('dinura123');
    login.clickLoginButton();

    // Step 2: Visit the dashboard page
    dashboard.visitDashboardPage();
    dashboard.findRowByItemName(itemName);
    dashboard.clickShareButtonForRow(itemName);

    // Step 3: Upload the specific file
    dashboard.uploadSpecificFile(
      targetUrl,
      filePath,
      submitButtonSelector
    );
  });
});