#!/bin/bash

# Script para aplicar configuración CORS a Firebase Storage
# Solo permite acceso desde localhost y PC1

echo "🔒 APLICANDO CONFIGURACIÓN CORS SEGURA"
echo "====================================="

# Verificar que estamos en el directorio correcto
if [ ! -f "cors.json" ]; then
    echo "❌ Error: cors.json no encontrado"
    exit 1
fi

# Verificar que gsutil esté instalado
if ! command -v gsutil &> /dev/null; then
    echo "⚠️  gsutil no encontrado. Instalando Google Cloud SDK..."
    echo "Visita: https://cloud.google.com/sdk/docs/install"
    echo "O ejecuta: curl https://sdk.cloud.google.com | bash"
    exit 1
fi

# Obtener el nombre del bucket de Firebase
BUCKET_NAME="playcenter-universal.firebasestorage.app"

echo "🔍 Verificando bucket: gs://$BUCKET_NAME"

# Aplicar configuración CORS
echo "🚀 Aplicando configuración CORS..."
gsutil cors set cors.json gs://$BUCKET_NAME

if [ $? -eq 0 ]; then
    echo "✅ CORS configurado correctamente"
    
    # Verificar configuración aplicada
    echo "🔍 Verificando configuración CORS..."
    gsutil cors get gs://$BUCKET_NAME
    
    echo ""
    echo "✅ CONFIGURACIÓN CORS APLICADA EXITOSAMENTE"
    echo ""
    echo "🔒 ACCESO PERMITIDO SOLO DESDE:"
    echo "   - http://localhost:5173"
    echo "   - http://localhost:5174"
    echo "   - http://127.0.0.1:5173"
    echo "   - http://127.0.0.1:5174"
    echo "   - http://PC1:5173"
    echo "   - http://PC1:5174"
    echo ""
    echo "🚫 ACCESO DENEGADO DESDE:"
    echo "   - Cualquier otro dominio"
    echo "   - IPs públicas"
    echo "   - Servidores externos"
    echo ""
    echo "🎯 Firebase Storage ahora es PRIVADO y SEGURO"
else
    echo "❌ Error aplicando CORS"
    echo "Verifica que tengas permisos en el proyecto Firebase"
    exit 1
fi
