# Guía de Despliegue - Control de Gastos

Esta guía detalla los pasos para desplegar la aplicación en un servidor de producción utilizando Docker.

## Requisitos Previos

El servidor debe tener instalado:
- **Docker**
- **Docker Compose**
- **Git** (opcional, si clonas el repo) o capacidad para subir archivos (SCP/SFTP).

## Pasos para el Despliegue

1. **Subir Archivos**
   Sube el archivo `deploy.zip` a tu servidor y descomprímelo:
   ```bash
   unzip deploy.zip -d control-gastos
   cd control-gastos
   ```

2. **Ejecutar Script de Despliegue**
   El script `deploy.sh` automatiza todo el proceso:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   El script te pedirá:
   - **Dominio**: El dominio donde se alojará la app (ej: `gastos.midominio.com`).
   - **Puerto**: El puerto para la app (por defecto `3000`).
   - **Contraseña DB**: Una contraseña segura para la base de datos PostgreSQL.

3. **Verificación**
   Una vez finalizado, la aplicación estará corriendo en el puerto seleccionado.
   - Accede a `http://tu-dominio:3000` (o el puerto que hayas elegido).
   - Inicia sesión con el usuario administrador por defecto (creado por el seed):
     - Usuario: `admin`
     - Contraseña: `admin` (¡Cámbiala inmediatamente!)

## Gestión Post-Despliegue

### Ver Logs
```bash
docker-compose logs -f app
```

### Reiniciar Servicios
```bash
docker-compose restart
```

### Actualizar Aplicación
Si subes nuevos cambios (nuevo `deploy.zip`):
```bash
./deploy.sh
```
(El script reconstruirá los contenedores).

## Copias de Seguridad y Restauración

### Crear Copia de Seguridad (Exportar BBDD)
Para exportar la base de datos completa a un archivo `.sql`:
```bash
chmod +x backup.sh
./backup.sh
```
Esto generará un archivo `backup_YYYYMMDD_HHMMSS.sql`. Puedes descargarlo a tu ordenador local usando SCP o SFTP.

### Restaurar Copia de Seguridad (Importar BBDD)
Para restaurar una base de datos desde un archivo `.sql`:
```bash
chmod +x restore.sh
./restore.sh archivo_backup.sql
```
**⚠️ PRECAUCIÓN**: Esto borrará los datos actuales y los reemplazará con los del backup.

## Solución de Problemas

- **Error de Permisos**: Asegúrate de dar permisos de ejecución con `chmod +x deploy.sh`.
- **Puerto Ocupado**: Si el puerto 3000 está en uso, elige otro durante la configuración.
- **Base de Datos**: Los datos se persisten en el volumen `postgres_data`. No se perderán al reiniciar contenedores.
