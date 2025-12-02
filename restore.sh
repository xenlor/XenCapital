#!/bin/bash

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color

echo -e "${GREEN}=== Restaurar Base de Datos ===${NC}"

# Configuración
BACKUP_DIR="./backups"

# Verificar si hay backups disponibles
if [ ! -d "$BACKUP_DIR" ] || [ -z "$(ls -A $BACKUP_DIR/*.sql 2>/dev/null)" ]; then
    echo -e "${RED}✗ No hay backups disponibles${NC}"
    exit 1
fi

# Listar backups disponibles
echo -e "${YELLOW}Backups disponibles:${NC}"
select BACKUP_FILE in $BACKUP_DIR/backup_*.sql; do
    if [ -n "$BACKUP_FILE" ]; then
        break
    else
        echo -e "${RED}Opción inválida${NC}"
    fi
done

# Obtener variables de entorno
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Extraer información de DATABASE_URL
DB_USER=$(echo $DATABASE_URL | sed -n 's/.*:\/\/\([^:]*\):.*/\1/p')
DB_PASS=$(echo $DATABASE_URL | sed -n 's/.*:\/\/[^:]*:\([^@]*\)@.*/\1/p')
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')
DB_NAME=$(echo $DATABASE_URL | sed -n 's/.*\/\([^?]*\).*/\1/p')

echo -e "${YELLOW}¿Estás seguro de restaurar desde $BACKUP_FILE? (y/n)${NC}"
read -r confirmation

if [ "$confirmation" != "y" ]; then
    echo -e "${RED}Cancelado${NC}"
    exit 0
fi

echo -e "${YELLOW}Restaurando...${NC}"
PGPASSWORD=$DB_PASS psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME < "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Base de datos restaurada correctamente${NC}"
else
    echo -e "${RED}✗ Error al restaurar la base de datos${NC}"
    exit 1
fi
