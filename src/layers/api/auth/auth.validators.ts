/*
|--------------------------------------------------------------------------
| Auth Validators
|--------------------------------------------------------------------------
|
| Here you define all of the validators functions for the auth endpoint
|
*/

import { body } from 'express-validator'
import passwordValidator from 'password-validator'

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

export const validateRegisterUser = [
  body('firstName').notEmpty(),
  body('lastName').notEmpty(),
  body('email').isEmail(),
  body('password').custom((password) => passwordSchema.validate(password)),
]

export const validateLoginUser = [body('email').notEmpty(), body('password').notEmpty()]
