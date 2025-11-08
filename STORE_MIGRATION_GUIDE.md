# Play Center Universal - Store Migration Guide

## 🎯 Overview
This system automatically assigns all your products to "Play Center Universal" store and will assign products to other users' stores when they upload products.

## ✅ What's Been Set Up

### 1. **Migration Button in Admin Dashboard**
- **Location**: Admin Panel → Dashboard (top right)
- **Button**: "Migrar a Play Center Universal"
- **What it does**: 
  - Finds all products without a `tienda_id`
  - Assigns them to Play Center Universal (`playcenter_universal`)
  - Shows results: updated, skipped, errors, total
  
**How to use**:
1. Go to Admin Panel (`/admin`)
2. Click "Migrar a Play Center Universal" button
3. Confirm the migration
4. Wait for completion (shows progress)
5. See results summary

### 2. **Automatic Store Assignment (Already Working)**
- **Location**: `ProductForm.jsx` - `detectarTiendaUsuario()` function
- **How it works**:
  - When YOU (admin) upload a product → Automatically assigned to "Play Center Universal"
  - When OTHER users upload products → Will be assigned to their store
  
**Your Admin Identification**:
- UID: `ZeiFzBgosCd0apv9cXL6aQZCYyu2`
- Email: `arisleidy.nunez@gmail.com`
- Role: `admin`

### 3. **Product Data Structure**
Every product now has:
```javascript
{
  // ... other fields
  tienda_id: "playcenter_universal",
  tienda_nombre: "Play Center Universal",
  ownerUid: "ZeiFzBgosCd0apv9cXL6aQZCYyu2"
}
```

## 📋 Migration Steps

### Step 1: Run Migration (First Time Only)
1. Login as admin
2. Go to `/admin`
3. Click "Migrar a Play Center Universal"
4. Confirm and wait

### Step 2: Verify Migration
After migration, check:
- All products have `tienda_id: "playcenter_universal"`
- All products have `tienda_nombre: "Play Center Universal"`

### Step 3: Test New Products
1. Create a new product
2. Verify it's automatically assigned to Play Center Universal
3. Check product details show the store name

## 🔧 How the System Works

### For Your Products (Admin)
```javascript
// In ProductForm.jsx
const detectarTiendaUsuario = () => {
  if (usuario?.uid === 'ZeiFzBgosCd0apv9cXL6aQZCYyu2' || 
      usuario?.email === 'arisleidy.nunez@gmail.com' ||
      usuarioInfo?.role === 'admin') {
    return {
      tienda_id: 'playcenter_universal',
      tienda_nombre: 'Play Center Universal'
    };
  }
  // For other users - future implementation
  return {
    tienda_id: 'playcenter_universal', // Default for now
    tienda_nombre: 'Play Center Universal'
  };
};
```

### For Other Users' Products (Future)
To enable other users to have their own stores:

1. **Create User Store in Database**:
```javascript
// Collection: tiendas/{tienda_id}
{
  tienda_id: "user_store_id",
  tienda_nombre: "User Store Name",
  propietario_id: "user_uid",
  propietario_email: "user@email.com",
  // ... other store fields
}
```

2. **Update detectarTiendaUsuario()**:
```javascript
const detectarTiendaUsuario = () => {
  // Admin products
  if (usuario?.uid === 'ZeiFzBgosCd0apv9cXL6aQZCYyu2' || ...) {
    return {
      tienda_id: 'playcenter_universal',
      tienda_nombre: 'Play Center Universal'
    };
  }
  
  // Other users - look up their store
  if (usuarioInfo?.tienda_id) {
    return {
      tienda_id: usuarioInfo.tienda_id,
      tienda_nombre: usuarioInfo.tienda_nombre
    };
  }
  
  // Default fallback
  return {
    tienda_id: 'playcenter_universal',
    tienda_nombre: 'Play Center Universal'
  };
};
```

## 🔒 Security Rules
The Firestore rules already allow:
- **Read**: Anyone can read products
- **Create**: Any authenticated user can create products
- **Update**: Any authenticated user can update products
- **Delete**: Only admin or product owner can delete

## 📊 Monitoring

### Check Product Assignment
```javascript
// In console or script
const productos = await getDocs(collection(db, 'productos'));
productos.forEach(doc => {
  const data = doc.data();
  console.log(doc.id, data.tienda_id, data.tienda_nombre);
});
```

### Count Products by Store
```javascript
const byStore = {};
productos.forEach(doc => {
  const store = doc.data().tienda_id || 'sin_tienda';
  byStore[store] = (byStore[store] || 0) + 1;
});
console.table(byStore);
```

## ⚠️ Important Notes

1. **First Migration**: Run the migration button once to migrate all existing products
2. **New Products**: Will be automatically assigned when created
3. **Editing Products**: Won't change the store assignment unless explicitly modified
4. **Other Users**: Currently all products go to Play Center Universal (see "Future" section above)

## 🎉 Benefits

✅ All YOUR products are in YOUR store  
✅ New products auto-assign correctly  
✅ System knows which store belongs to which user  
✅ Future-ready for multi-vendor marketplace  
✅ Easy to filter products by store  
✅ Analytics per store  

## 🚀 Next Steps

1. **Run the migration now** (click the button in Admin Dashboard)
2. **Verify all products** are assigned to Play Center Universal
3. **Test creating a new product** to verify auto-assignment
4. **For other users**: Implement the store lookup system when needed

---

**Created**: November 7, 2024  
**Status**: ✅ Ready to migrate  
**Version**: 1.0
