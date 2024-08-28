import passwordValidator from 'password-validator'

const validator = new passwordValidator()

const password = validator
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

export { password }
