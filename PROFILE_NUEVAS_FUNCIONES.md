# NUEVAS FUNCIONES PARA AGREGAR A PROFILE.JSX

Agregar después de la función `fetchStats`:

```javascript
const fetchMiTienda = async () => {
  try {
    setLoadingTienda(true);
    console.log('🔍 Buscando tienda para usuario:', usuario.uid);
    
    // Buscar tienda donde el usuario sea propietario
    const tiendasQuery = query(
      collection(db, 'tiendas'),
      where('propietario_id', '==', usuario.uid)
    );
    
    const tiendasSnap = await getDocs(tiendasQuery);
    
    if (!tiendasSnap.empty) {
      const tiendaData = { id: tiendasSnap.docs[0].id, ...tiendasSnap.docs[0].data() };
      console.log('✅ Tienda encontrada:', tiendaData);
      setMiTienda(tiendaData);
    } else {
      console.log('❌ No se encontró tienda para este usuario');
      setMiTienda(null);
    }
  } catch (err) {
    console.error('Error fetchMiTienda:', err);
    setMiTienda(null);
  } finally {
    setLoadingTienda(false);
  }
};

const loadNotificaciones = () => {
  const saved = localStorage.getItem(`notificaciones_${usuario.uid}`);
  if (saved) {
    setNotificaciones(JSON.parse(saved));
  }
  const savedIdioma = localStorage.getItem(`idioma_${usuario.uid}`);
  if (savedIdioma) {
    setIdioma(savedIdioma);
  }
};

const handleNotificacionChange = (tipo) => {
  const nuevas = { ...notificaciones, [tipo]: !notificaciones[tipo] };
  setNotificaciones(nuevas);
  localStorage.setItem(`notificaciones_${usuario.uid}`, JSON.stringify(nuevas));
  toast('Preferencias de notificaciones actualizadas', 'success');
};

const handleIdiomaChange = (nuevoIdioma) => {
  setIdioma(nuevoIdioma);
  localStorage.setItem(`idioma_${usuario.uid}`, nuevoIdioma);
  toast('Idioma actualizado', 'success');
};

const handleCambiarPassword = async () => {
  setPasswordError('');
  
  if (!passwordForm.actual || !passwordForm.nueva || !passwordForm.confirmar) {
    setPasswordError('Todos los campos son requeridos');
    return;
  }
  
  if (passwordForm.nueva !== passwordForm.confirmar) {
    setPasswordError('Las contraseñas no coinciden');
    return;
  }
  
  if (passwordForm.nueva.length < 6) {
    setPasswordError('La contraseña debe tener al menos 6 caracteres');
    return;
  }
  
  setLoading(true);
  try {
    // Re-autenticar usuario
    const credential = EmailAuthProvider.credential(
      usuario.email,
      passwordForm.actual
    );
    await reauthenticateWithCredential(usuario, credential);
    
    // Cambiar contraseña
    await updatePassword(usuario, passwordForm.nueva);
    
    setPasswordForm({ actual: '', nueva: '', confirmar: '' });
    setCambiarPasswordOpen(false);
    toast('Contraseña actualizada correctamente', 'success');
  } catch (err) {
    console.error('Error cambiar contraseña:', err);
    if (err.code === 'auth/wrong-password') {
      setPasswordError('La contraseña actual es incorrecta');
    } else {
      setPasswordError('Error al cambiar contraseña: ' + err.message);
    }
  } finally {
    setLoading(false);
  }
};
```
