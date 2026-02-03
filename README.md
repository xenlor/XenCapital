# 💰 XenCapital

<div align="center">
  <img src="public/logo-dark.png" alt="XenCapital Logo" width="180">
  <br>
  <h3>Gestión Inteligente de Finanzas Personales</h3>

  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js">
    <img src="https://img.shields.io/badge/React-19-blue" alt="React">
    <img src="https://img.shields.io/badge/Tailwind-4-cyan" alt="Tailwind">
    <img src="https://img.shields.io/badge/PostgreSQL-15-blue" alt="Postgres">
  </p>
</div>

---

## 📖 Descripción

**XenCapital** es una plataforma web integral diseñada para el control financiero personal. Permite a los usuarios registrar, categorizar y visualizar sus flujos de dinero, gestionar deudas y optimizar sus ahorros mediante una interfaz moderna, rápida y segura.

El sistema está construido con un enfoque en **privacidad y rendimiento**, utilizando las últimas tecnologías del ecosistema React.

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura moderna basada en **Server Components**:

*   **Frontend**: Next.js 16 (App Router), React 19, TailwindCSS v4.
*   **Backend**: Server Actions (API-less design), Prisma ORM.
*   **Base de Datos**: PostgreSQL.
*   **Autenticación**: NextAuth.js v5 con sesiones encriptadas y persistencia en BD.
*   **Seguridad**: Validaciones con Zod, Rate Limiting, Sanitización de inputs.
*   **Despliegue**: Soporte nativo para PM2 o Docker (opcional).

## 📂 Estructura del Proyecto

```bash
src/
├── app/                  # Rutas y páginas (App Router)
│   ├── (dashboard)/      # Layout principal autenticado
│   │   ├── admin/        # Panel de administración de usuarios
│   │   ├── gastos/       # Gestión de gastos
│   │   ├── ingresos/     # Gestión de ingresos
│   │   ├── inversiones/  # Portafolio de inversiones
│   │   ├── ahorros/      # Metas y análisis de ahorro
│   │   ├── prestamos/    # Control de préstamos a terceros
│   │   └── settings/     # Perfil y configuración
│   ├── actions/          # Server Actions (Lógica de backend)
│   └── api/              # Endpoints (Auth, etc)
├── components/           # Componentes React reutilizables
│   └── ui/               # Componentes base de diseño
├── lib/                  # Utilidades y configuración (Prisma, Auth)
└── types/                # Definiciones de TypeScript
```

## ✨ Funcionalidades Clave

1.  **Dashboard en Tiempo Real**: Visualización inmediata de balance, tendencias y actividad reciente.
2.  **Gestión de Transacciones**: Registro rápido de Ingresos y Gastos con clasificación por categorías y colores.
3.  **Sistema de Inversiones**: Tracking de activos (ETFs, Crypto, Stocks) con cálculo de rendimiento.
4.  **Ahorros y Metas**: Configuración de objetivos de ahorro mensual (ej. Regla del 20%).
5.  **Deudas y Préstamos**:
    *   **Préstamos**: Dinero que has prestado a amigos/familiares.
    *   **Plazos**: Compras a crédito o cuotas pendientes.
6.  **Gastos Compartidos**: División automática de gastos grupales basada en ingresos o partes iguales.
7.  **Seguridad**: Panel de administración para gestión de usuarios y roles.

## 🚀 Instalación y Despliegue

Para instalar el proyecto en tu máquina local o servidor de producción, consulta la guía detallada:

👉 **[GUÍA DE INSTALACIÓN PASO A PASO](INSTALLATION.md)**

---
© 2026 XenCapital - Desarrollado por XenLor.
