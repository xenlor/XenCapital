const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const prisma = new PrismaClient();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function main() {
    console.log('--- Crear Nuevo Usuario ---');

    try {
        const name = await question('Nombre: ');
        const email = await question('Email: ');
        const password = await question('Contraseña: ');

        if (!email || !password) {
            console.error('Error: Email y contraseña son obligatorios.');
            process.exit(1);
        }

        console.log('Creando usuario...');

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        console.log(`\n✅ Usuario creado exitosamente: ${user.email}`);

        // Create default categories for the new user
        console.log('Creando categorías por defecto...');
        const defaultCategories = [
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

        for (const cat of defaultCategories) {
            await prisma.categoria.create({
                data: {
                    ...cat,
                    userId: user.id,
                },
            });
        }

        console.log('✅ Categorías por defecto creadas');
        console.log('Ahora puedes iniciar sesión en la web.');

    } catch (error) {
        console.error('\n❌ Error al crear usuario:', error.message);
        if (error.code === 'P2002') {
            console.error('El email ya está registrado.');
        }
    } finally {
        await prisma.$disconnect();
        rl.close();
    }
}

main();
