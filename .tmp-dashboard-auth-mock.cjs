const http = require("http");
const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:5055");
  if (url.pathname === "/api/users/me") {
    const cookie = String(req.headers.cookie || "");
    if (cookie.includes("studio_session_token=valid-admin")) {
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({
        id: "admin-1",
        email: "admin@northernstepstudio.com",
        role: "admin",
        display_name: "Studio Admin"
      }));
      return;
    }
    res.writeHead(401, { "content-type": "application/json" });
    res.end("null");
    return;
  }

  if (url.pathname === "/admin/login") {
    res.writeHead(200, { "content-type": "text/plain" });
    res.end("mock admin login");
    return;
  }

  if (url.pathname === "/api/logout") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.writeHead(404, { "content-type": "text/plain" });
  res.end("not found");
});

server.listen(5055, "127.0.0.1", () => {
  console.log("mock-auth-ready");
});
