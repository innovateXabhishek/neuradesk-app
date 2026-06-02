const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GROQ_API_KEY;
const MODEL = process.env.NEURA_MODEL || "llama-3.1-8b-instant";

const server = http.createServer(async (req, res) => {
  if (req.method === "POST" && req.url === "/api/chat") {
    if (!API_KEY || API_KEY.includes("your_")) {
      res.writeHead(500, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Real GROQ_API_KEY missing" }));
    }

    let body = "";
    req.on("data", c => body += c);
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const messages = [];

        if (parsed.system) {
          messages.push({ role: "system", content: parsed.system });
        }

        for (const m of parsed.messages || []) {
          messages.push({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || "")
          });
        }

        const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: MODEL,
            messages,
            temperature: 0.4,
            max_tokens: 700
          })
        });

        const data = await groqRes.json();
        console.log("GROQ:", JSON.stringify(data, null, 2));

        if (!groqRes.ok) {
          res.writeHead(500, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({
            content: [{ type: "text", text: `Groq error: ${data.error?.message || "Unknown error"}` }]
          }));
        }

        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          content: [{ type: "text", text: data.choices?.[0]?.message?.content || "No response from Groq" }]
        }));
      } catch (e) {
        console.error(e);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({
          content: [{ type: "text", text: `Server error: ${e.message}` }]
        }));
      }
    });
    return;
  }

  const file = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const fp = path.join(__dirname, "public", path.normalize(file).replace(/^(\.\.[\/\\])+/, ""));

  fs.readFile(fp, (err, content) => {
    if (err) {
      res.writeHead(404);
      return res.end("Not found");
    }
    res.writeHead(200);
    res.end(content);
  });
});

server.listen(PORT, () => {
  console.log(`NEURADESK running → http://localhost:${PORT}`);
  console.log("Provider: Groq");
  console.log(`Model: ${MODEL}`);
  console.log(API_KEY && !API_KEY.includes("your_") ? "Groq key loaded ✓" : "Groq key missing");
});
