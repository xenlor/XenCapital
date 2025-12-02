# 💰 Control de Gastos

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Private-red)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

Aplicación web moderna para gestión de finanzas personales con dashboard interactivo, categorización de gastos, tracking de ahorros e informes exportables.

## 🚀 Características

- 📊 **Dashboard Interactivo** - Visualiza tus finanzas con gráficos en tiempo real
- 💸 **Gestión de Gastos e Ingresos** - Registra y categoriza todas tus transacciones
- 🏦 **Sistema de Préstamos** - Control de préstamos personales con plazos
- 👥 **Gastos Compartidos** - Divide gastos entre varios miembros
- 🐷 **Ahorro Inteligente** - Seguimiento de metas de ahorro (20% recomendado)
- 📈 **Informes Exportables** - Descarga tus datos en formato Excel
- 🔐 **Sistema de Autenticación** - Login seguro con NextAuth v5
- 🌙 **Interfaz Moderna** - Diseño dark mode con efectos glassmorphism

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** - Framework React con App Router
- **React 19** - Biblioteca UI con React Compiler
- **TailwindCSS 4** - Estilos utility-first
- **Recharts** - Gráficos interactivos
- **Lucide Icons** - Iconos modernos
- **date-fns** - Manipulación de fechas

### Backend
- **Next.js Server Actions** - API serverless integrada
- **Prisma ORM** - Gestión de base de datos type-safe
- **PostgreSQL** - Base de datos relacional
- **NextAuth.js v5** - Autenticación y sesiones
- **bcryptjs** - Hash de contraseñas
- **Zod** - Validación de datos

### Infraestructura
- **Docker & Docker Compose** - Containerización
- **Nginx** - Reverse proxy
- **Let's Encrypt (Certbot)** - Certificados SSL/TLS

## 📋 Requisitos Previos

- **Node.js 20+** (para desarrollo local)
- **Docker & Docker Compose** (para producción)
- **Git** (para clonar el repositorio)

## 🏃 Inicio Rápido (Desarrollo Local)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/xenlor/control-gastos.git
   cd control-gastos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar entorno**
   Crea un archivo `.env`:
   ```env
   DATABASE_URL="postgresql://admin:adminpassword@localhost:5432/control_gastos"
   AUTH_SECRET="genera-uno-con-openssl-rand-base64-32"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Levantar base de datos**
   ```bash
   docker-compose up -d postgres
   ```

5. **Inicializar base de datos**
   ```bash
   npx prisma db push
   ```

6. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

7. **Abrir navegador** en http://localhost:3000

## 📚 Documentación

- [📖 Guía de Despliegue](docs/DEPLOYMENT.md) - Instrucciones detalladas para producción.
- [🗄️ Estructura de Base de Datos](docs/DATABASE.md) - Documentación del esquema y modelos.

## 🐳 Despliegue Fácil

El proyecto incluye scripts automatizados para despliegue. Consulta la [Guía de Despliegue](docs/DEPLOYMENT.md) para más detalles.

## 👤 Gestión de Usuarios

### Panel de Administración
La aplicación cuenta con una interfaz gráfica para administradores.
1. Inicia sesión como administrador.
2. Ve a **Configuración** > **Administración de Usuarios**.
3. Desde allí puedes crear, eliminar y gestionar usuarios fácilmente.

### Scripts de Emergencia
Si pierdes acceso al panel, puedes usar los scripts de terminal:

```bash
# Crear usuario
docker-compose exec app node scripts/crear-usuario.js email@ejemplo.com 123456 "Nombre"

# Eliminar usuario
docker-compose exec app node scripts/eliminar-usuario.js
```

## 📦 Copias de Seguridad

Para realizar una copia de seguridad de la base de datos:

```bash
# Exportar base de datos
docker-compose exec postgres pg_dump -U postgres control_gastos > backup.sql
```

Para restaurar una copia de seguridad:

```bash
# Importar base de datos (¡Cuidado! Sobreescribe datos)
cat backup.sql | docker-compose exec -T postgres psql -U postgres -d control_gastos
```

## 🔐 Credenciales por Defecto

El seed inicial crea un usuario administrador por defecto:

| Usuario | Contraseña | Rol |
| :--- | :--- | :--- |
| **admin** | `123456` | Administrador |

> **IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer inicio de sesión.

## 📄 Licencia

Este proyecto es software privado. Todos los derechos reservados.

## ✉️ Contacto

**Esteban** - [xenlor.dev](https://xenlor.dev)
