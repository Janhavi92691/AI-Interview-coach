const { createServer } = require("http");
const next = require("next");

const port = parseInt(process.env.PORT || process.env.WEBSITES_PORT || "3000", 10);
const hostname = "0.0.0.0";
const dev = false;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => {
      handle(req, res);
    }).listen(port, hostname, () => {
      console.log(`> Next.js production server ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
    process.exit(1);
  });
