Cypress.Commands.add("login", () => {
    cy.session(
      [Cypress.env("username"), Cypress.env("password")], // Unique identifier for the session
      () => {
        // Perform the login steps
        cy.visit(Cypress.env("instance1Login")); // Replace with the appropriate login URL
        cy.get("#username").type(Cypress.env("username"));
        cy.get("#password").type(Cypress.env("password"));
        cy.get("#kc-login").click();
  
        // Wait for the dashboard or another page to load after login
        cy.url().should("include", "/dashboard"); // Adjust this assertion based on your app
      },
      {
        cacheAcrossSpecs: true, // Cache the session across different test files
      }
    );
  });