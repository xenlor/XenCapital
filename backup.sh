#!/bin/bash

# Cargar variables de entorno si existen
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${TIMESTAMP}.sql"

echo "📦 Creando copia de seguridad: $BACKUP_FILE"

# Usar las variables de entorno para el usuario y la base de datos
# Si no están definidas, usar valores por defecto (postgres/control_gastos)
DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-control_gastos}

docker-compose exec -T postgres pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Copia de seguridad creada exitosamente: $BACKUP_FILE"
    echo "   Para descargarla a tu máquina local, usa SCP o SFTP:"
    echo "   scp usuario@tu-vps:/ruta/a/$BACKUP_FILE ."
else
    echo "❌ Error al crear la copia de seguridad"
    rm "$BACKUP_FILE"
fi
