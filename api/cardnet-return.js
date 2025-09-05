export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      // CardNet envía los datos en el body (x-www-form-urlencoded)
      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }

      // Convertir body a querystring
      const query = new URLSearchParams(body).toString();

      // Redirigir al frontend React
      res.writeHead(302, { Location: `/payment/success?${query}` });
      res.end();
    } catch (err) {
      console.error("Error en cardnet-return:", err);
      res.writeHead(302, { Location: "/payment/cancel" });
      res.end();
    }
  } else {
    // Si CardNet entra con GET, igual redirigimos
    res.writeHead(302, { Location: "/payment/success" });
    res.end();
  }
}
