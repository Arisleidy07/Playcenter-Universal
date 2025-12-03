export async function subirImagenCloudinary(file) {
  const url = "https://api.cloudinary.com/v1_1/dprojkgqf/image/upload";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "perfil_usuarios");
  formData.append("folder", "muestras/comercio electrónico"); // <--- clave según tu preset

  // console.log("Archivo que se va a subir:", file);
  // console.log("Preset usado:", "perfil_usuarios");
  // console.log("Carpeta folder usada:", "muestras/comercio electrónico");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    // console.error("Error Cloudinary:", errorText);
    throw new Error("❌ Error al subir la imagen a Cloudinary");
  }

  const data = await res.json();
  // console.log("Respuesta de Cloudinary:", data);
  return data.secure_url;
}
