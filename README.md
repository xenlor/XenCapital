# 💰 Control de Gastos

![Status](https://img.shields.io/badge/Status-Active-success)
![License](https://img.shields.io/badge/License-Private-red)
![Next.js](https://img.shields.io/badge/Next.js-15-black)

<div align="center">
  <img src="docs/screenshots/logo.png" alt="XenCapital Logo" width="250">
</div>

Aplicación web moderna para gestión de finanzas personales con dashboard interactivo, categorización de gastos, tracking de ahorros, inversiones e informes exportables.

## 🚀 Características

- 📊 **Dashboard Interactivo** - Visualiza tus finanzas con gráficos en tiempo real
- 💸 **Gestión de Gastos e Ingresos** - Registra y categoriza todas tus transacciones
- 📈 **Tracking de Inversiones** - Controla tu portafolio de ETFs, acciones y criptomonedas
- 🏦 **Sistema de Préstamos** - Control de préstamos personales con recordatorios
- 💳 **Compras a Plazos** - Gestión de deudas y cuotas mensuales
- 👥 **Gastos Compartidos** - Divide gastos entre varios miembros con cálculo automático
- 🐷 **Ahorro Inteligente** - Seguimiento de metas de ahorro (20% recomendado)
- 📥 **Informes Exportables** - Descarga tus datos en formato Excel
- 🔐 **Sistema de Autenticación** - Login seguro con NextAuth v5
- 👨‍💼 **Panel de Administración** - Gestión de usuarios y configuración
- 🌙 **Interfaz Moderna** - Diseño dark mode con efectos glassmorphism
- 📱 **Diseño Responsive** - Funciona perfectamente en móviles y escritorio



## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 15** - Framework React con App Router
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
- **Nginx** - Reverse proxy (opcional)
- **Let's Encrypt (Certbot)** - Certificados SSL/TLS (opcional)

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
    POSTGRES_USER="postgres"
    POSTGRES_PASSWORD="tu-password-segura"
    POSTGRES_DB="control_gastos"
    DATABASE_URL="postgresql://postgres:tu-password-segura@localhost:5432/control_gastos"
    AUTH_SECRET="genera-uno-con-openssl-rand-base64-32"
    NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Levantar base de datos**
   ```bash
   docker compose up -d postgres
   ```

5. **Inicializar base de datos**
   ```bash
   npx prisma db push
   ```

   node scripts/fix-admin.js admin

7. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

8. **Abrir navegador** en http://localhost:3000

## 📚 Documentación

**⚠️ ADVERTENCIA:** Esto borrará **TODOS** los datos.

## 🔧 Scripts Útiles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm start            # Iniciar producción

# Base de datos
npx prisma studio    # Interfaz gráfica para ver datos
npx prisma db push   # Aplicar cambios del schema
npx prisma generate  # Regenerar cliente Prisma

# Testing
npm test             # Ejecutar tests
```

## 🌟 Características Destacadas

### Dashboard Inteligente
- Visualización en tiempo real de ingresos, gastos y ahorros
- Gráficos de distribución por categorías
- Indicadores de progreso de ahorro
- Resumen de inversiones con totales mensuales

### Sistema de Inversiones
- Registro de ETFs, acciones, criptomonedas y fondos
- Tracking de monto invertido por mes
- Visualización de portafolio agrupado por tipo
- Filtrado por mes para análisis histórico

### Gastos Compartidos
- Creación de gastos divididos entre múltiples miembros
- Cálculo automático de proporcionalidad según ingresos
- Snapshot histórico de participaciones
- Vinculación automática con gastos individuales

### Préstamos y Plazos
- Tracking de dinero prestado a terceros
- Gestión de compras a plazos con cuotas
- Recordatorios de fechas de pago
- Generación automática de gastos al pagar cuotas

## 📄 Licencia

Este proyecto es software privado. Todos los derechos reservados.

## ✉️ Contacto

**Esteban** - [xenlor.dev](https://xenlor.dev)

---

**Última actualización**: Diciembre 2024


<details>
<summary><h2>📸 Galería de Imágenes (Clic para expandir)</h2></summary>

| Dashboard | Inversiones |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Inversiones](docs/screenshots/inversiones.png) |

| Ingresos | Gastos |
|---|---|
| ![Ingresos](docs/screenshots/ingresos.png) | ![Gastos](docs/screenshots/gastos.png) |

| Préstamos | Plazos |
|---|---|
| ![Préstamos](docs/screenshots/prestamos.png) | ![Plazos](docs/screenshots/plazos.png) |

| Móvil | |
|---|---|
| ![Móvil](docs/screenshots/mobile.png) | |

</details>

