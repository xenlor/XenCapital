# 💰 Control de Gastos

Aplicación web moderna para gestión de finanzas personales con dashboard interactivo, categorización de gastos, tracking de ahorros y informes exportables.

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

## 🔒 Medidas de Seguridad

1. **Autenticación Robusta**
   - Contraseñas hasheadas con bcrypt (10 salt rounds)
   - Sesiones encriptadas con AUTH_SECRET
   - Rate limiting en login (5 intentos/minuto)

2. **Protección de Rutas**
   - Middleware de autenticación en todas las rutas privadas
   - Validación de sesión server-side
   - Cookies HTTP-only y secure en producción

3. **Validación de Datos**
   - Validación con Zod en todos los formularios
   - Sanitización de inputs
   - Typed queries con Prisma ORM

4. **Base de Datos**
   - Credenciales en variables de entorno
   - Contenedor aislado en red Docker
   - Backups automáticos (volumen persistente)

5. **HTTPS Obligatorio**
   - Certificado SSL de Let's Encrypt
   - Redirección automática HTTP → HTTPS
   - Headers de seguridad en Nginx (`X-Forwarded-Proto`, `X-Real-IP`, `X-Forwarded-For`)

## 📋 Requisitos Previos

- **Node.js 20+** (para desarrollo local)
- **Docker & Docker Compose** (para producción)
- **Git** (para clonar el repositorio)
- **Nginx** (para VPS en producción)
- **Dominio con DNS configurado** (para HTTPS en producción)

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

## 🐳 Despliegue en Producción (VPS con Docker)

### Preparación del Servidor

1. **Instalar Docker**
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo systemctl enable --now docker
   ```

2. **Instalar Nginx y Certbot** (si no los tienes)
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx -y
   ```

### Transferencia de Archivos

**Opción A: Git Clone** (recomendado)
```bash
cd /var/www
git clone https://github.com/xenlor/control-gastos.git gastos.tudominio.com
cd gastos.tudominio.com
```

**Opción B: SCP Manual**
```bash
# Desde tu PC
scp -r src public prisma package*.json *.ts *.mjs Dockerfile docker-compose.yml .dockerignore scripts root@tu-vps-ip:/var/www/gastos.tudominio.com
```

### Configuración

1. **Crear archivo `.env`**
   ```bash
   nano .env
   ```
   
   ```env
   # Credenciales de Base de Datos
   POSTGRES_USER="usuario_seguro"
   POSTGRES_PASSWORD="contraseña_muy_segura_123"
   POSTGRES_DB="control_gastos"
   
   # Seguridad de la Aplicación
   AUTH_SECRET="genera_uno_largo_con_openssl_rand_-base64_32"
   
   # URL Pública
   NEXTAUTH_URL="https://gastos.tudominio.com"
   ```

2. **Levantar contenedores**
   ```bash
   docker-compose up -d --build
   ```

3. **Inicializar base de datos**
   ```bash
   docker-compose exec app npx prisma db push
   ```

### Configurar Nginx

1. **Crear configuración**
   ```bash
   sudo nano /etc/nginx/sites-available/control-gastos
   ```
   
   ```nginx
   server {
       server_name gastos.tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       listen 80;
   }
   ```

2. **Activar sitio**
   ```bash
   sudo ln -s /etc/nginx/sites-available/control-gastos /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Configurar HTTPS**
   ```bash
   sudo certbot --nginx -d gastos.tudominio.com
   ```

## 👤 Gestión de Usuarios

### Crear Nuevo Usuario

```bash
docker-compose exec app node scripts/create-user.js
```

El script pedirá:
- Nombre
- Email
- Contraseña

Y creará automáticamente:
- El usuario con contraseña encriptada
- **9 categorías por defecto**: Alimentación, Transporte, Vivienda, Servicios, Ocio, Salud, Ropa, Educación y Otros

### Listar Usuarios

```bash
docker-compose exec app node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.findMany().then(users => {
  console.log(users.map(u => \`\${u.name} (\${u.email})\`).join('\\n'));
  prisma.\$disconnect();
});
"
```

## 📁 Estructura del Proyecto

```
control-gastos/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Páginas de autenticación
│   │   ├── (dashboard)/     # Páginas privadas
│   │   ├── actions/         # Server Actions
│   │   └── api/             # API Routes
│   ├── components/          # Componentes React
│   │   └── ui/             # Componentes UI reutilizables
│   ├── lib/                # Utilidades
│   ├── auth.ts             # Configuración NextAuth
│   ├── auth.config.ts      # Config de autenticación
│   └── middleware.ts       # Middleware de autenticación
├── prisma/
│   ├── schema.prisma       # Esquema de base de datos
│   └── seed.ts             # Datos iniciales
├── scripts/
│   └── create-user.js      # Script de creación de usuarios
├── docs/                   # Documentación
├── Dockerfile              # Imagen Docker
├── docker-compose.yml      # Orquestación Docker
└── README.md               # Este archivo
```

## 🗄️ Modelo de Datos

### Entidades Principales

- **User** - Usuario con autenticación
- **Categoria** - Categorías personalizadas por usuario
- **Ingreso** - Ingresos mensuales
- **Gasto** - Gastos categorizados
- **Ahorro** - Registro de ahorros
- **Prestamo** - Préstamos con plazos
- **GastoCompartido** - Gastos divididos entre miembros

Ver el esquema completo en [`prisma/schema.prisma`](prisma/schema.prisma)

## 🔧 Scripts Disponibles

```bash
npm run dev          # Desarrollo local con hot reload
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
```

## 🐛 Debugging

### Ver logs de la aplicación
```bash
docker-compose logs -f app
```

### Ver logs de la base de datos
```bash
docker-compose logs -f postgres
```

### Acceder a la base de datos
```bash
docker-compose exec postgres psql -U tu_usuario -d control_gastos
```

### Reiniciar servicios
```bash
docker-compose restart
```

## 🔄 Actualizaciones

Para actualizar la aplicación en producción:

```bash
# 1. Detener servicios
docker-compose down

# 2. Actualizar código
git pull origin main

# 3. Reconstruir y levantar
docker-compose up -d --build

# 4. Aplicar migraciones si las hay
docker-compose exec app npx prisma db push
```

## ⚠️ Troubleshooting

### El login no redirige correctamente
- Verifica que `NEXTAUTH_URL` en `.env` tenga el dominio correcto con HTTPS
- Asegúrate de que Nginx esté enviando los headers `X-Forwarded-Proto` correctamente
- Limpia las cookies del navegador

### Error "Cannot find module"
- Ejecuta `docker-compose up -d --build` para reconstruir la imagen
- Verifica que todos los archivos estén en el servidor

### La base de datos no se conecta
- Verifica que las credenciales en `.env` coincidan con las de `docker-compose.yml`
- Comprueba que el contenedor de PostgreSQL esté corriendo: `docker ps`

## 📄 Licencia

Este proyecto es software privado. Todos los derechos reservados.

## ✉️ Contacto

**Esteban** - [xenlor.dev](https://xenlor.dev)

---

⭐ Desarrollado con Next.js, Prisma y TypeScript
