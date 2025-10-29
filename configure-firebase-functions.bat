@echo off
REM 🔧 Script de Configuración Automática de Firebase Functions
REM Domain: pcu.com.do

echo 🚀 Configurando Firebase Functions para pcu.com.do...
echo.

REM 1. SendGrid API Key
echo 📧 Configurando SendGrid API Key...
REM IMPORTANTE: Reemplaza TU_SENDGRID_API_KEY con tu API key real
call firebase functions:config:set sendgrid.apikey="TU_SENDGRID_API_KEY"

REM 2. Email remitente verificado
echo ✉️  Configurando email remitente...
call firebase functions:config:set mail.from="no-reply@pcu.com.do"

REM 3. URL del sitio
echo 🌐 Configurando URL del sitio...
call firebase functions:config:set site.url="https://pcu.com.do"

REM 4. API Key para funciones admin
echo 🔐 Configurando API Key de admin...
call firebase functions:config:set admin.apikey="PCU-ADMIN-2024-SECURE-KEY-XYZ789"

REM 5. Secret para unsubscribe
echo 🔑 Configurando secret para unsubscribe...
call firebase functions:config:set unsubscribe.secret="PCU-UNSUBSCRIBE-SECRET-2024"

echo.
echo ✅ Configuración completada!
echo.
echo 📋 Verificando configuración...
call firebase functions:config:get

echo.
echo 🔄 Próximos pasos:
echo 1. cd functions
echo 2. npm install
echo 3. cd ..
echo 4. firebase deploy --only functions
echo.
pause
