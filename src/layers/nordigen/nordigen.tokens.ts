class NordigenTokens {
  accessToken: string
  refreshToken: string

  constructor(accessToken: string, refreshToken: string) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  setRefreshToken(token: string) {
    this.refreshToken = token
  }

  getAccessToken() {
    return this.accessToken
  }

  getRefreshToken() {
    return this.refreshToken
  }
}

export default new NordigenTokens('', '')
