# Spendify API

### Requirements
- Node v20.16.0
- PostgreSQL 16

### Setup
  1. `git clone git@github.com:rokaskasperavicius/spendify-api.git`
  2. `cd spendify-api`
  3. `nvm use` or `nvm install`
  4. `npm install`
  5. `npm run prisma-migrate`
  6. `npm run dev`
  7. Go to [http://localhost:8080/](http://localhost:8080/)

Test user has been seeded with:
  - email: `test@gmail.com`
  - password: `Test123.`


### Documentation
http://localhost:8080/api-docs/#/

Based on OpenApi 3.0 - https://swagger.io/docs/specification/about/

### Deployments
Deployment to production happens automatically on merge to `main`

Deployments are done with Heroku - https://api.spendify.dk/
