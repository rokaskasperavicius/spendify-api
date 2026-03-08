// Allowed urls for accessing our API
const corsOptions = {
  origin: ['*'],
  credentials: true,
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
}

export { corsOptions }
