## Environment URLs

[Genre Browser for Spotify (main)](https://main.dgutam4ouh3e7.amplifyapp.com/)

[Genre Browser for Spotify (staging)](https://staging.dgutam4ouh3e7.amplifyapp.com/)


## Cypress Testing

### `npx cypress run`

Runs all Cypress tests (cypress\e2e\*.cy.js)

### `npx cypress open`

Opens Cypress in the interactive test runner.

## Available Scripts

In the project directory, you can run:

### `npm install`

Installs necessary dependencies for development.

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

Nb. You will not be able to run the app without .env variables, which are not deployed to git.

## Deployment and Release

AWS Amplify watches the `main` branch for changes and automatically deploys.

Branch rules:
* Do not commit or merge directly to `main`.
* Do not commit directly to `staging`.
* `staging` should only be updated by PRs.
* `main` should only be updated when running the deployment process below.

### Branching Process

1. Create feature branches based from `staging` (branch name should be the same as the URL of the Trello ticket e.g. `7-write-privacy-policy`).
2. When features are complete, create a pull request to merge your branch into `staging`.
3. Assert that the latest build has deployed successfully to the `staging` environment in AWS Amplify.

### Deployment Process 

1. Create a new release from staging:

    1. Go to the GitHub web interface.
    2. Navigate to Releases → Draft a new release.
    3. Choose the latest commit from staging.

2. Create a tag (e.g., v1.2.3) and publish the release.

3. Open a pull request from the tag to main:

    1. Go to Pull Requests → New Pull Request.
    2. Set base as main and compare as staging.
    3. GitHub will show the changes.
    4. Confirm that everything looks correct.

4. AWS Amplify will automatically detect changes and deploy.
