#!/bin/bash

echo "🔍 Revisando logs recientes de Cloud Functions..."
echo ""

echo "📧 Logs de onOrderCreated (últimos 5 minutos):"
firebase functions:log --only onOrderCreated

echo ""
echo "📊 Estado de todas las functions:"
firebase functions:list

echo ""
echo "✅ Listo!"
