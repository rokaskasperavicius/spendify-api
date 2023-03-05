/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const faker = require('@faker-js/faker')
const uuid = require('uuid')
const dateFns = require('date-fns')
const fs = require('fs')

const transactions = []

const randomDates = faker.faker.date
  .betweens(dateFns.subYears(new Date(), 2), new Date(), 5000)
  .sort((prev, next) => next.getTime() - prev.getTime())

for (let i = 0; i < 5000; i++) {
  transactions.push({
    transactionId: uuid.v4(),
    remittanceInformationUnstructuredArray: [faker.faker.finance.transactionDescription()],
    bookingDate: randomDates[i],
    transactionAmount: {
      amount: faker.faker.finance.amount(-1000, 1000),
    },
  })
}

fs.writeFile('./src/config/mocked.json', JSON.stringify(transactions), () => [])
