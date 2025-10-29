#!/bin/bash

# 🔧 Script de Configuración Automática de Firebase Functions
# Domain: pcu.com.do

echo "🚀 Configurando Firebase Functions para pcu.com.do..."
echo ""

# 1. SendGrid API Key
echo "📧 Configurando SendGrid API Key..."
# IMPORTANTE: Reemplaza TU_SENDGRID_API_KEY con tu API key real
firebase functions:config:set sendgrid.apikey="TU_SENDGRID_API_KEY"

# 2. Email remitente verificado
echo "✉️  Configurando email remitente..."
firebase functions:config:set mail.from="no-reply@pcu.com.do"

# 3. URL del sitio
echo "🌐 Configurando URL del sitio..."
firebase functions:config:set site.url="https://pcu.com.do"

# 4. API Key para funciones admin
echo "🔐 Configurando API Key de admin..."
firebase functions:config:set admin.apikey="PCU-ADMIN-2024-SECURE-KEY-XYZ789"

# 5. Secret para unsubscribe
echo "🔑 Configurando secret para unsubscribe..."
firebase functions:config:set unsubscribe.secret="PCU-UNSUBSCRIBE-SECRET-2024"

echo ""
echo "✅ Configuración completada!"
echo ""
echo "📋 Verificando configuración..."
firebase functions:config:get

echo ""
echo "🔄 Próximos pasos:"
echo "1. cd functions && npm install"
echo "2. firebase deploy --only functions"
echo ""
