export async function subirImagenCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/dprojkgqf/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "firebase_preset"); // Asegúrate que esté creado como preset sin firmar

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Error al subir la imagen a Cloudinary");
  }

  const data = await res.json();
  return data.secure_url;
}
