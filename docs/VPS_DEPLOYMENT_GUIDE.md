# Guía Maestra de Despliegue en VPS

Esta guía cubre todo el proceso para llevar tu aplicación `control-gastos` desde tu ordenador hasta un servidor VPS (Ubuntu/Debian) con dominio propio y HTTPS.

## Prerrequisitos
*   Un servidor VPS (DigitalOcean, Hetzner, AWS, etc.) con Ubuntu 20.04 o superior.
*   Un dominio (ej: `misgastos.com`) apuntando a la IP de tu VPS (Registros A).
*   Acceso SSH al servidor (`ssh root@tu-ip`).

---

## Paso 1: Preparar el Servidor

**Nota:** Como ya tienes Nginx y Certbot instalados por tus otras webs, **puedes saltarte la instalación**. Solo asegúrate de tener Docker instalado.

```bash
# Verificar si Docker está instalado
docker --version

# Si NO lo tienes:
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl enable --now docker
```

---

## Paso 2: Subir los Archivos

Tienes dos opciones. Elige la que prefieras.

### Opción A: Usando Git (Recomendado)
Si subiste tu código a GitHub/GitLab:
```bash
cd /var/www
git clone https://github.com/tu-usuario/control-gastos.git
    ```

2.  Pega el siguiente contenido (ajusta los valores):
    ```env
    # Base de datos (Interna de Docker)
    DATABASE_URL="postgres://admin:adminpassword@postgres:5432/control_gastos"
    
    # Seguridad (Genera uno largo)
    AUTH_SECRET="x_tu_secreto_super_seguro_x"
    
    # URL Pública
    NEXTAUTH_URL="https://gastos.xenlor.dev"
    ```
    *Guarda con `Ctrl+O`, `Enter` y sal con `Ctrl+X`.*

---

## Paso 4: Despliegue con Docker

⚠️ **Importante:** Esta configuración usa el puerto **3000**. Asegúrate de que tus otras webs (n8n, etc.) no estén usando este puerto. Si lo usan, cambia el `3000:3000` en `docker-compose.yml` por otro (ej: `3001:3000`) y actualiza la config de Nginx.

Levanta la aplicación y la base de datos:

```bash
# Construir y levantar en segundo plano
docker-compose up -d --build
```

Verifica que esté corriendo:
```bash
docker ps
```
Deberías ver dos contenedores: `control-gastos-app` y `control-gastos-db`.

---

## Paso 5: Inicializar Base de Datos

Ahora que la base de datos está viva, necesitamos crear las tablas y el primer usuario.

1.  **Crear Tablas (Migración):**
    ```bash
    docker-compose exec app npx prisma db push
    ```

2.  **Crear Usuario Inicial (Seed):**
    Si tienes un script `prisma/seed.ts`, ejecútalo:
    ```bash
    docker-compose exec app npx prisma db seed
    ```
    *Si no tienes seed, tendrás que registrarte desde la web una vez esté pública.*

---

## Paso 6: Configurar Nginx (Servidor Web)

Docker está corriendo en el puerto `3000`, pero queremos entrar por el puerto `80` (Web normal) y con tu dominio.

1.  Crea la configuración de Nginx:
    ```bash
    nano /etc/nginx/sites-available/control-gastos
    ```

2.  Pega esto:
    ```nginx
    server {
        server_name gastos.xenlor.dev;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  Activa el sitio y reinicia Nginx:
    ```bash
    ln -s /etc/nginx/sites-available/control-gastos /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default  # (Opcional: borra el default si molesta)
    nginx -t # Verifica errores
    systemctl restart nginx
    ```

---

## Paso 7: Activar HTTPS (Candado Verde)

Usa Certbot para obtener un certificado SSL gratuito de Let's Encrypt.

```bash
certbot --nginx -d gastos.xenlor.dev
```
Sigue las instrucciones en pantalla (pon tu email, acepta términos).

---

## ¡Listo! 🚀

Entra a `https://gastos.xenlor.dev` y deberías ver tu aplicación funcionando.
