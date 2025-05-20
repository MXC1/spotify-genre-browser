## Environment URLs

[Genre Browser for Spotify (main)](https://d3f5rwuxerjftx.cloudfront.net/)

[Genre Browser for Spotify (staging)](https://d3vmn7hy1avbwa.cloudfront.net/)

[Genre Browser for Spotify (dev)](https://d32znmj1ft1rl1.cloudfront.net/)


## Cypress Testing

### `npx cypress run`

Runs all Cypress tests (cypress\e2e\*.cy.js)

Nb. Some of the Cypress test suite require a production build to pass. See `npm run build; serve -s build`

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

### `npm run build; serve -s build`

Creates and serves a production build on localhost.

## Deployment and Release

CodePipeline watches the `staging` and `main` branches for changes and automatically deploys.

Branch rules:
* Do not commit or merge directly to `main`.
* Do not commit directly to `staging`.
* `staging` should only be updated by PRs.
* `main` should only be updated when running the deployment process below.

### Branching Process

1. Create feature branches based from `staging` (branch name should be the same as the URL of the Trello ticket e.g. `7-write-privacy-policy`).
2. When features are complete, create a pull request to merge your branch into `staging`.
3. Assert that the latest build has deployed successfully to the `staging` environment in CodePipeline.

### Deployment Process 

1. Run the 'Create Release and PR' GitHub action
   It will create a Pull Request from staging to main.
2. Check that the Pull Request contains the content you expect.
3. Approve and merge.
4. CodePipeline will automatically detect changes and deploy.
5. Verify that the CodePipeline succeeded.
