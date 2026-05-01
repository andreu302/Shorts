import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // API Routes
  app.use(express.json());

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", message: "ShortsAI Engine is running" });
  });

  // Simulating a video post to YouTube
  app.post("/api/post-video", (req, res) => {
    const { prompt } = req.body;
    console.log(`[Backend] Simulating upload to YouTube for: ${prompt}`);
    setTimeout(() => {
      res.json({ 
        success: true, 
        videoUrl: "https://youtube.com/shorts/placeholder",
        message: "Vídeo postado com sucesso no YouTube Shorts!" 
      });
    }, 2000);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 ShortsAI Server running at http://localhost:${PORT}`);
  });
}

startServer();
