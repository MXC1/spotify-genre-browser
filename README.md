## Environment URLs

[Spotify Genre Browser (main)](https://main.dgutam4ouh3e7.amplifyapp.com/)

[Spotify Genre Browser (staging)](https://staging.dgutam4ouh3e7.amplifyapp.com/)


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
Do not commit or merge directly to main.

### Release Process

1. Create feature branches based from `main` (branch name should be the same as the URL of the Trello ticket)
2. When features are complete, create a pull request to merge your branch into `staging`
3. Assert that the build has deployed successfully to the `staging` environment in AWS Amplify and conduct any necessary testing on `staging`.
4. Create a new tag and a new release based from `staging`.
5. In git, run:
    1. `git fetch origin`
    2. `git checkout main`
    3. `git merge --ff-only <tag_name>` (replace `<tag_name>` with the tag you created in step 4)
    4. `git push`
6. This will push all commit history to main without creating a new commit. AWS Amplify will pick up changes and deploy to the `main` environment.
7. Verify that deployment has been successful in AWS Amplify.
