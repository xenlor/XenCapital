#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Iniciando despliegue de Control de Gastos...${NC}"

# 1. Verificar dependencias
echo -e "\n${BLUE}1. Verificando dependencias...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# Detectar versión de Docker Compose
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
    echo -e "${GREEN}✅ Docker Compose v2 detectado.${NC}"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
    echo -e "${GREEN}✅ Docker Compose v1 detectado.${NC}"
else
    echo -e "${RED}❌ Docker Compose no está instalado. Por favor instálalo primero.${NC}"
    exit 1
fi

# 2. Configurar .env
echo -e "\n${BLUE}2. Configurando variables de entorno...${NC}"
if [ -f .env ]; then
    echo -e "${GREEN}✅ Archivo .env encontrado.${NC}"
else
    echo -e "${BLUE}📝 Creando archivo .env...${NC}"
    
    read -p "Introduce el dominio (ej: gastos.midominio.com): " DOMAIN
    read -p "Introduce el puerto para la aplicación (default: 3000): " APP_PORT
    APP_PORT=${APP_PORT:-3000}
    read -s -p "Introduce una contraseña segura para la base de datos: " DB_PASSWORD
    echo ""
    
    # Generar AUTH_SECRET aleatorio
    AUTH_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOL
# Configuración App
APP_PORT="${APP_PORT}"

# Base de Datos
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="${DB_PASSWORD}"
POSTGRES_DB="control_gastos"
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@postgres:5432/control_gastos"

# Seguridad
AUTH_SECRET="${AUTH_SECRET}"
NEXTAUTH_URL="https://${DOMAIN}"
EOL
    
    echo -e "${GREEN}✅ Archivo .env creado exitosamente.${NC}"
fi

# 3. Levantar contenedores
echo -e "\n${BLUE}3. Levantando servicios con Docker...${NC}"
$DOCKER_COMPOSE_CMD up -d --build

echo -e "${BLUE}⏳ Esperando a que la base de datos esté lista (10s)...${NC}"
sleep 10

# 4. Inicializar base de datos
echo -e "\n${BLUE}4. Inicializando base de datos...${NC}"
$DOCKER_COMPOSE_CMD exec -T app npx prisma db push

# 5. Ejecutar Seed (Crear Admin)
echo -e "\n${BLUE}5. Configurando usuario administrador...${NC}"
$DOCKER_COMPOSE_CMD exec -T app node prisma/seed.js

echo -e "\n${BLUE}6. Asegurando rol de administrador...${NC}"
$DOCKER_COMPOSE_CMD exec -T app node scripts/fix-admin.js admin

echo -e "\n${GREEN}✅ ¡Despliegue completado con éxito!${NC}"
echo -e "Tu aplicación debería estar corriendo en http://localhost:3000 (o configurada en tu dominio si usas Nginx)."
