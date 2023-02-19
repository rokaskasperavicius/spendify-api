import axios from 'axios'

const getNordigenTokensBody = {
  secret_id: process.env.NORDIGEN_SECRET_ID,
  secret_key: process.env.NORDIGEN_SECRET_KEY,
}

export const getNordigenToken = () => {
  return axios.post(`${process.env.NORDIGEN_BASE_URL}/token/new/`, getNordigenTokensBody)
}
