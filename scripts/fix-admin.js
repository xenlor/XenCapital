const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const username = process.argv[2] || 'admin'
    console.log(`🔍 Checking role for: ${username}`)

    const user = await prisma.user.findUnique({
        where: { username }
    })

    if (!user) {
        console.log('❌ User not found!')
        return
    }

    console.log(`👤 User found: ${user.name}`)
    console.log(`🔑 Current Role: ${user.role}`)

    if (user.role !== 'ADMIN') {
        console.log('⚠️ Role is NOT Admin. Updating...')
        await prisma.user.update({
            where: { username },
            data: { role: 'ADMIN' }
        })
        console.log('✅ Role updated to ADMIN successfully!')
    } else {
        console.log('✅ User is already ADMIN.')
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
