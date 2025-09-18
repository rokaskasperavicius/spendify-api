import bcrypt from 'bcrypt'

import { PASSWORD_SALT_ROUNDS } from '@/lib/constants'

import prisma from '@/services/prisma'

async function main() {
  const hashedPassword = await bcrypt.hash('Test123.', PASSWORD_SALT_ROUNDS)

  await prisma.users.upsert({
    where: { email: 'test@gmail.com' },
    update: {},
    create: {
      name: 'Test User',
      email: 'test@gmail.com',
      password: hashedPassword,
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
