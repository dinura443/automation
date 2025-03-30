# web-automation-framework-template

This template can used to automate tests for web applications, aligning to a framework using Cypress automation tool.


# Installation & Configuration

This guide will provide the instructions to setup test automation for a web application using this template.

### Step 01:
Setup `web-automation-framework-template` by cloning from github repository.

```
git clone https://github.com/Qbitum/Web-Automation-Framework-Template.git
```
### Step 02:
Open package.json file and edit name, version, description, author, keywords and developer dependencies according to your project.

### Step 03:
Install project dependent packages 

```
npm install
```
### Step 04:
Open Cypress Test runner mode.

```
npm run cy:open
```
### Step 05:
Select E2E Testing. It should be displayed as "Configured".

### Step 06:
Select a browser and click Start E2E Testing.

### Step 07:
Two options should be displayed on creating your first spec files.

1.Scaffold example specs - It creates several example specs explaining writing test specs in Cypress.
2.Create new spec - It creates a single test spec to start execution of Cypress in TestRunner mode.

You can choose either one of these options. After selecting an option, we can check whether Cypress is executing properly by running these test specs.

### Step 08:
Create and include the web pages in the page-objects directory under page-objects-and-services directory.

### Step 09:
Create and organize your test specs in the e2e directory under cypress directory. Test specs can be organized accurately by referring the file structure of the template described below.


# File Structure of Template

1. Cypress

Inside this directory, there are several directories.

* downloads - In this directory, the downloaded files from the test executions are stored and used for verifications.
* e2e - In this directory, the end to end functional tests are stored. They can be divided according to the functionalities, requirements.
* fixtures - In this directory, the static test data which is used for test executions are stored.
* screenshots - In this directory, the screenshots are saved when test executions failed in headless mode. Failed moments of each test spec are   captured in these screenshots with UI view. This directory is created when a test run is executed in headless mode.
* reports - In this directory, reports for each test spec execution are created using mochawesome reporter. Reports can be saved in JSON and HTML formats. This directory is created when a test run is executed in headless mode.
* scripts - In this directory, the scripts which are used to to help test spec executions are located. Scripts that include read/write excel operations, send google notification alerts after execution, merging mochawesome JSON reports to a single JSON file.
* support - There is a commands.ts file in this directory to configure custom commands and a e2e.ts file to configure end to end testing settings.

2. Page-Objects-and-Services

Inside this directory, there are two main directories.

* page-objects - In this directory the pages of the web application are stored. The web elements, methods to interact and verify with elements are included in these web pages.
* services - In this directory, the functions are stored used for API requests, data extraction from API requests.

3. cypress.config.ts
This file contains configuration settings to control the behavior of Cypress during test execution. It includes reporter configurations, test spec patterns, specifying environmental variables.

4. package.json
This file contains basic project information such as name, version, author , developer dependencies for Cypress, reporting and logging, utility libraries, scripts for executing custom commands.

5. package-lock.json
 This file ensures consistency through different environments by locking down the versions of the dependencies that are installed.

  
