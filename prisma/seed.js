const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Poblando base de datos...');

    const adminUsername = 'admin';
    const adminPassword = '123456';

    // 1. Verificar o Crear Usuario Admin
    let admin = await prisma.user.findUnique({
        where: { username: adminUsername }
    });

    if (!admin) {
        console.log('👤 Usuario Admin no encontrado. Creando...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        admin = await prisma.user.create({
            data: {
                username: adminUsername,
                name: 'Admin',
                password: hashedPassword,
                role: 'ADMIN',
                // Crear configuración por defecto
                configuracion: {
                    create: {
                        porcentajeAhorro: 20.0
                    }
                }
            }
        });
        console.log('✅ Usuario Admin creado.');
    } else {
        console.log('👤 El usuario Admin ya existe.');
    }

    // 2. Poblar Categorías
    console.log('📂 Poblando categorías...');
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
        // Verificar si la categoría ya existe para este usuario
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

    console.log('✅ Categorías por defecto pobladas exitosamente.');
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
