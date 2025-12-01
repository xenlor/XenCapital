# Guía de Despliegue, Escalabilidad y Seguridad (OWASP)

Esta guía detalla los pasos para llevar tu aplicación `control-gastos` a un entorno de producción profesional, seguro y escalable.

## 1. Despliegue en Producción (Vercel)

La forma más recomendada y sencilla de desplegar una aplicación Next.js es utilizando **Vercel**.

### Pasos para el despliegue:
1.  **Sube tu código a GitHub**: Asegúrate de que tu proyecto esté en un repositorio remoto.
2.  **Crea una cuenta en Vercel**: Ve a [vercel.com](https://vercel.com) y regístrate con tu cuenta de GitHub.
3.  **Importa el proyecto**: En el dashboard de Vercel, haz clic en "Add New..." -> "Project" y selecciona tu repositorio `control-gastos`.
4.  **Configuración de Build**: Vercel detectará automáticamente que es un proyecto Next.js.
    *   **Framework Preset**: Next.js
    *   **Build Command**: `next build`
    *   **Output Directory**: `.next`
5.  **Variables de Entorno**: Aquí es donde configurarás tu base de datos de producción (ver sección 2).

## 2. Base de Datos Escalable (PostgreSQL)

Actualmente usas SQLite, que es excelente para desarrollo local pero no ideal para producción (especialmente en entornos serverless como Vercel, donde el sistema de archivos es efímero).

### Migración a PostgreSQL:
Recomendamos usar **Supabase**, **Neon** o **Vercel Postgres**.

1.  **Crea una base de datos**: Por ejemplo, en [Supabase](https://supabase.com).
2.  **Obtén la URL de conexión**: Será algo como `postgres://user:password@host:port/db`.
3.  **Actualiza `prisma/schema.prisma`**:
    ```prisma
    datasource db {
      provider = "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
4.  **Configura la variable de entorno**:
    *   En tu archivo `.env` local: `DATABASE_URL="tu_url_de_postgres"`
    *   En Vercel (Settings -> Environment Variables): Añade `DATABASE_URL`.
5.  **Genera y migra**:
    *   Ejecuta `npx prisma generate`
    *   Ejecuta `npx prisma db push` (o `migrate deploy` para producción) para crear las tablas en la nueva DB.

## 3. Control de Usuarios (Autenticación)

Para gestionar usuarios, registros, logins y proteger rutas, la mejor opción es integrar una solución de autenticación robusta.

### Opciones Recomendadas:
*   **Clerk** (Más fácil de implementar, UI lista para usar).
*   **Auth.js (NextAuth)** (Más control, open source).
*   **Supabase Auth** (Si ya usas Supabase para la DB, es ideal).

### Implementación con Clerk (Ejemplo):
1.  Instalar: `npm install @clerk/nextjs`
2.  Configurar Middleware (`middleware.ts`) para proteger rutas.
3.  Envolver la app en `<ClerkProvider>`.
4.  Usar componentes `<SignIn />`, `<SignUp />`, `<UserButton />`.
5.  **Vincular datos**: En tu esquema de Prisma, deberás añadir un campo `userId` (String) a tus modelos (`Gasto`, `Ingreso`, etc.) para asociar cada registro al usuario autenticado.

## 4. Seguridad (OWASP Top 10)

Para cumplir con estándares de seguridad, implementa las siguientes medidas:

### A01: Broken Access Control (Control de Acceso Roto)
*   **Solución**: Asegúrate de que cada consulta a la base de datos incluya el `userId`.
    *   *Mal*: `prisma.gasto.findMany()` (Trae gastos de todos).
    *   *Bien*: `prisma.gasto.findMany({ where: { userId: currentUserId } })`.
*   Usa Middleware para bloquear acceso a `/dashboard` si no hay sesión activa.

### A02: Cryptographic Failures (Fallos Criptográficos)
*   **Solución**: Nunca guardes contraseñas en texto plano. Al usar servicios como Clerk o Auth.js, ellos manejan el hashing seguro (bcrypt/argon2) por ti.
*   Usa siempre **HTTPS** (Vercel lo activa por defecto).

### A03: Injection (Inyección SQL/NoSQL)
*   **Solución**: Al usar **Prisma ORM**, ya estás protegido contra inyección SQL clásica, ya que Prisma usa consultas parametrizadas por defecto. Nunca concatenes strings directamente en consultas `prisma.$queryRaw`.

### A04: Insecure Design (Diseño Inseguro)
*   **Validación de Inputs**: Usa **Zod** para validar todos los datos que llegan desde los formularios antes de procesarlos en los Server Actions.
    ```typescript
    const schema = z.object({
      monto: z.number().positive(),
      descripcion: z.string().min(1)
    });
    ```

### A05: Security Misconfiguration (Mala Configuración)
*   **Headers de Seguridad**: Configura `next.config.js` para añadir headers HTTP seguros (HSTS, X-Frame-Options, X-Content-Type-Options).
*   No expongas claves secretas (`API_KEYS`, `DATABASE_URL`) en el código cliente (nunca uses el prefijo `NEXT_PUBLIC_` para secretos).

### A09: Security Logging and Monitoring
*   Conecta tu proyecto de Vercel a un sistema de logs (como Axiom o Datadog) para monitorear errores y accesos sospechosos.

## Resumen del Plan de Acción

1.  [ ] **Preparar DB**: Crear proyecto en Supabase/Neon y obtener Connection String.
2.  [ ] **Actualizar Prisma**: Cambiar provider a `postgresql` y migrar esquema.
3.  [ ] **Integrar Auth**: Instalar Clerk/Auth.js y configurar `userId` en los modelos.
4.  [ ] **Refactorizar Actions**: Actualizar todas las consultas DB para filtrar por `userId`.
5.  [ ] **Desplegar**: Subir a GitHub y conectar con Vercel.

## 5. Migración al VPS (Docker)

Esta es la guía específica si decides usar tu propio servidor (VPS) con Docker en lugar de Vercel.

### Archivos Necesarios
Debes tener en tu servidor **todo el código fuente**, excepto las carpetas generadas automáticamente.

**SÍ Copiar:**
*   `src/`
*   `public/`
*   `prisma/`
*   `package.json` y `package-lock.json`
*   `next.config.ts`
*   `tsconfig.json`
*   `Dockerfile`
*   `docker-compose.yml`
*   `.dockerignore`

**NO Copiar (Se generan allá):**
*   `node_modules`
*   `.next`
*   `.git` (si copias manual)

### Pasos para Desplegar

#### Opción A: Usando Git (Recomendado)
1.  Conéctate a tu VPS por SSH.
2.  Clona tu repositorio: `git clone https://github.com/tu-usuario/control-gastos.git`
3.  Entra a la carpeta: `cd control-gastos`

#### Opción B: Copia Manual (SCP / FileZilla)
1.  Sube los archivos listados arriba a una carpeta `/var/www/control-gastos` (o donde prefieras).

#### Ejecución (Para ambas opciones)
1.  **Crea el archivo de entorno**:
    ```bash
    nano .env
    ```
    Pega tus variables de producción:
    ```env
    DATABASE_URL="postgres://admin:password@postgres:5432/control_gastos"
    AUTH_SECRET="tu_secreto_super_seguro_generado_con_openssl"
    NEXTAUTH_URL="http://tu-dominio.com"
    ```
    *(Nota: Si usas la DB interna de Docker, la URL es la de arriba. Si usas Supabase, pon la de Supabase).*

2.  **Levanta los servicios**:
    ```bash
    docker-compose up -d --build
    ```

3.  **Verifica**:
    Tu app debería estar corriendo en `http://tu-ip:3000`.

