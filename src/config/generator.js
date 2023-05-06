/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable no-undef */

const faker = require('@faker-js/faker')
const uuid = require('uuid')
const dateFns = require('date-fns')
const fs = require('fs')

const transactions = []

const titles = [
  '7-ELEVEN B005, KOEBENHAVN K',
  'FAKTA 451, ROSKILDE',
  'MobilePay Victor Eskildsen',
  'Wolt, Copenhagen',
  'MobilePay køb MobilePay Coop App',
  'RUC, AABYHOEJ',
  'TREKRONER KIOSK OG CANDY, ROSKILDE',
  'COOP SUPERBRUGSEN TREKRON, ROSKILDE',
  'Cafeteria il lago, ROSKILDE',
  'Dankort-køb Rejsekort - DSB Nota',
  'Just Eat.dk, Copenhagen',
  'MENY, ROSKILDE',
  'ABSALON, KØBENHAVN V',
]

const salary = [
  new Date('2023-04-30'),
  new Date('2023-03-30'),
  new Date('2023-02-28'),
  new Date('2023-01-30'),
  new Date('2022-12-30'),
  new Date('2022-11-30'),
  new Date('2022-10-30'),
  new Date('2022-09-30'),
  new Date('2022-08-30'),
  new Date('2022-07-30'),
  new Date('2022-06-30'),
  new Date('2022-05-30'),
]

const randomDates = faker.faker.date.betweens(dateFns.subYears(new Date(), 1), new Date(), 600)
randomDates.push(...salary)
randomDates.sort((prev, next) => next.getTime() - prev.getTime())

for (let i = 0; i < 600; i++) {
  transactions.push({
    transactionId: uuid.v4(),
    remittanceInformationUnstructuredArray: [
      salary.includes(randomDates[i]) ? 'Lønoverførsel' : titles[Math.floor(Math.random() * titles.length)],
    ],
    valueDate: randomDates[i],
    transactionAmount: {
      amount: salary.includes(randomDates[i]) ? 6000 : faker.faker.finance.amount(-200, -20),
    },
  })
}

fs.writeFile('./mocked.json', JSON.stringify(transactions), () => [])
