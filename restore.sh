#!/bin/bash

if [ -z "$1" ]; then
    echo "Uso: ./restore.sh <archivo_backup.sql>"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Archivo no encontrado: $BACKUP_FILE"
    exit 1
fi

# Cargar variables de entorno
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

DB_USER=${POSTGRES_USER:-postgres}
DB_NAME=${POSTGRES_DB:-control_gastos}

echo "⚠️  ADVERTENCIA: ¡Esto SOBREESCRIBIRÁ la base de datos actual!"
read -p "¿Estás seguro de continuar? (s/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Cancelado."
    exit 1
fi

echo "🔄 Restaurando desde: $BACKUP_FILE"
cat "$BACKUP_FILE" | docker-compose exec -T postgres psql -U "$DB_USER" -d "$DB_NAME"

if [ $? -eq 0 ]; then
    echo "✅ Restauración completada exitosamente."
else
    echo "❌ Error en la restauración."
fi
