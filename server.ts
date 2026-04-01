import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API route to collect submissions
  app.post("/api/submit", (req, res) => {
    const { name, rollNumber, timestamp } = req.body;
    const submission = { name, rollNumber, timestamp, ip: req.ip };
    
    console.log("New Prank Victim:", submission);

    // Store in a local file for now
    const filePath = path.join(process.cwd(), "submissions.json");
    let submissions = [];
    if (fs.existsSync(filePath)) {
      try {
        submissions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      } catch (e) {
        submissions = [];
      }
    }
    submissions.push(submission);
    fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

    // Note: To connect to a real Google Sheet, you would normally use 
    // the googleapis library with a service account.
    // For this prank, we log it to the server console and save to submissions.json.
    
    res.json({ success: true });
  });

  // API route to get all submissions
  app.get("/api/submissions", (req, res) => {
    const filePath = path.join(process.cwd(), "submissions.json");
    if (fs.existsSync(filePath)) {
      try {
        const submissions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        res.json(submissions);
      } catch (e) {
        res.status(500).json({ error: "Failed to read submissions" });
      }
    } else {
      res.json([]);
    }
  });

  // API route to delete all submissions
  app.delete("/api/submissions", (req, res) => {
    const filePath = path.join(process.cwd(), "submissions.json");
    fs.writeFileSync(filePath, JSON.stringify([], null, 2));
    res.json({ success: true });
  });

  // API route to delete a specific submission by index
  app.delete("/api/submissions/:index", (req, res) => {
    const index = parseInt(req.params.index);
    const filePath = path.join(process.cwd(), "submissions.json");
    if (fs.existsSync(filePath)) {
      try {
        let submissions = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        // We reverse the list in the frontend, so we need to handle the index carefully
        // But it's easier to just send the original index or use a unique ID.
        // For simplicity, let's assume the frontend sends the correct index from the original array.
        if (index >= 0 && index < submissions.length) {
          submissions.splice(index, 1);
          fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
          res.json({ success: true });
        } else {
          res.status(400).json({ error: "Invalid index" });
        }
      } catch (e) {
        res.status(500).json({ error: "Failed to delete submission" });
      }
    } else {
      res.status(404).json({ error: "No submissions found" });
    }
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
