import { body } from 'express-validator'
import passwordValidator from 'password-validator'

// Services
import { db } from '@services/db'

const passwordSchema = new passwordValidator()

passwordSchema
  .is()
  .min(8) // Minimum length 8
  .is()
  .max(40) // Maximum length 40
  .has()
  .uppercase() // Must have uppercase letters
  .has()
  .lowercase() // Must have lowercase letters
  .has()
  .digits(1) // Must have at least 1 digit

export const registerUser = [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email')
    .isEmail()
    .custom(async (email) => {
      const emails = await db('SELECT email FROM users WHERE email = $1', [email])

      const isEmailValid = emails.length === 0

      if (!isEmailValid) {
        throw new Error('Email has been already taken')
      }

      return true
    })
    .withMessage({ code: 1 }),
  body('password').custom((password) => passwordSchema.validate(password)),
]

export const loginUser = [
  body('email')
    .notEmpty()
    .custom(async (email) => {
      const emails = await db('SELECT email FROM users WHERE email = $1', [email])

      if (!emails.length) {
        throw new Error('User does not exist')
      }

      return true
    }),
  body('password').notEmpty(),
]
