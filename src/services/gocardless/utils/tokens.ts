class GoCardlessTokens {
  accessToken?: string

  constructor(accessToken?: string) {
    this.accessToken = accessToken
  }

  setAccessToken(token?: string) {
    this.accessToken = token
  }

  getAccessToken() {
    return this.accessToken
  }
}

export default new GoCardlessTokens(undefined)
