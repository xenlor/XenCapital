# ⚙️ Guía de Instalación y Despliegue

Esta guía cubre todo lo necesario para poner en marcha **XenCapital**, desde la preparación de la base de datos hasta el despliegue en producción.

---

## 1. Requisitos Previos

Antes de empezar, asegúrate de tener instalado:

*   **Node.js v20** o superior.
*   **PostgreSQL v15** o superior.
*   **Git**.

---

## 2. Configuración de Base de Datos (PostgreSQL)

Si es una instalación nueva, necesitas crear un usuario y una base de datos.
Entra a tu terminal de `psql` (`sudo -u postgres psql`) y ejecuta:

```sql
-- 1. Crear el usuario (cambia 'tu_password_segura' por una real)
CREATE USER xen_user WITH ENCRYPTED PASSWORD 'tu_password_segura';

-- 2. Crear la base de datos
CREATE DATABASE xencapital;

-- 3. Dar permisos
GRANT ALL PRIVILEGES ON DATABASE xencapital TO xen_user;

-- 4. (Opcional) Si usas Postgres 15+, dar permisos al esquema public
\c xencapital
GRANT ALL ON SCHEMA public TO xen_user;
```

---

## 3. Instalación para Desarrollo (Local)

Sigue estos pasos para trabajar en el código o probar la aplicación en tu PC.

### Paso 1: Clonar y Descargar depedencias
```bash
git clone https://github.com/xenlor/control-gastos.git
cd control-gastos
npm install
```

### Paso 2: Variables de Entorno
Copia la plantilla `.env.example` y rellénala con los datos que creaste en el paso de Base de Datos.

```bash
cp .env.example .env
nano .env
```

**Ejemplo de `.env` configurado:**
```ini
DATABASE_URL="postgresql://xen_user:tu_password_segura@localhost:5432/xencapital"
AUTH_SECRET="escribe_aqui_algo_muy_largo_y_aleatorio"
NEXTAUTH_URL="http://localhost:3000"
AUTH_TRUST_HOST="true"

```

### Paso 3: Inicializar Base de Datos
Este comando crea las tablas en tu base de datos vacía.
```bash
npx prisma db push
```

### Paso 4: Iniciar Servidor
```bash
npm run dev
```
La aplicación estará disponible en **http://localhost:3000**.

> **Nota:** El primer usuario que crees manualmente (o vía script) deberá asignarse el rol `ADMIN` en la base de datos si quieres acceder al panel de administración.

---

## 4. Instalación para Producción (Servidor)

Para desplegar en un servidor real (VPS, Raspberry Pi, etc.), recomendamos usar **PM2** para mantener la aplicación activa.

### Paso 1: Construir la Aplicación
Genera los archivos optimizados de producción.
```bash
npm run build
```

### Paso 2: Iniciar con PM2
Si no tienes PM2: `sudo npm install -g pm2`

```bash

pm2 start npm --name "xencapital" -- start
```

### Paso 3: Configurar Inicio Automático
Para que la app se inicie si el servidor se reinicia:
```bash
pm2 save
pm2 startup
```

### (Opcional) Proxy Inverso con Nginx
Para servir la app en un dominio (ej. `mis-finanzas.com`) y usar HTTPS.

Configuración básica de Nginx (`/etc/nginx/sites-available/xencapital`):
```nginx
server {
    server_name mis-finanzas.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```
