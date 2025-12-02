const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    const adminUsername = 'admin';
    const adminPassword = '123456';

    // 1. Check or Create Admin User
    let admin = await prisma.user.findUnique({
        where: { username: adminUsername }
    });

    if (!admin) {
        console.log('👤 Admin user not found. Creating...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        admin = await prisma.user.create({
            data: {
                username: adminUsername,
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
                // Create default config
                configuracion: {
                    create: {
                        porcentajeAhorro: 20.0
                    }
                }
            }
        });
        console.log('✅ Admin user created.');
    } else {
        console.log('👤 Admin user already exists.');
    }

    // 2. Seed Categories
    console.log('📂 Seeding categories...');
    const categories = [
        { nombre: 'Alimentación', color: '#ef4444', icono: 'Utensils' },
        { nombre: 'Transporte', color: '#f97316', icono: 'Car' },
        { nombre: 'Vivienda', color: '#eab308', icono: 'Home' },
        { nombre: 'Servicios', color: '#84cc16', icono: 'Zap' },
        { nombre: 'Ocio', color: '#06b6d4', icono: 'Gamepad2' },
        { nombre: 'Salud', color: '#3b82f6', icono: 'Heart' },
        { nombre: 'Ropa', color: '#8b5cf6', icono: 'Shirt' },
        { nombre: 'Educación', color: '#d946ef', icono: 'GraduationCap' },
        { nombre: 'Otros', color: '#64748b', icono: 'MoreHorizontal' },
    ];

    for (const cat of categories) {
        // Check if category already exists for this user
        const existing = await prisma.categoria.findFirst({
            where: {
                nombre: cat.nombre,
                userId: admin.id
            }
        });

        if (!existing) {
            await prisma.categoria.create({
                data: {
                    nombre: cat.nombre,
                    color: cat.color,
                    icono: cat.icono,
                    userId: admin.id
                }
            });
        }
    }

    console.log('✅ Default categories seeded successfully.');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
