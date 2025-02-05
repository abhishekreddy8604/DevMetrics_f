import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add your seed data here  
  console.log('Starting database seed...')
  
  // Example seeding (uncomment and modify as needed):
  // await prisma.user.create({
  //   data: {
  //     name: 'Test User',
  //     email: 'test@example.com',
  //   },
  // })
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })