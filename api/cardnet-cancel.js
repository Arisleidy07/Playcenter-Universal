// api/cardnet-cancel.js
export default async function handler(req, res) {
  try {
    let session = null;

    if (req.method === "POST") {
      let body = "";
      for await (const chunk of req) {
        body += chunk;
      }
      const params = new URLSearchParams(body);
      session = params.get("SESSION");
    } else {
      session = req.query.SESSION;
    }

    if (session) {
      res.writeHead(302, { Location: `/payment/cancel?session=${session}` });
      res.end();
    } else {
      res.writeHead(302, { Location: "/payment/cancel" });
      res.end();
    }
  } catch (err) {
    console.error("❌ Error en cardnet-cancel:", err);
    res.writeHead(302, { Location: "/payment/cancel" });
    res.end();
  }
}
