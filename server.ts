import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Gemini
  app.post("/api/generate", async (req, res) => {
    try {
      const { messages, title } = req.body;
      
      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const MODEL_NAME = "gemini-3.8-flash";
      
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: messages.map((m: any) => ({
          role: m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }]
        })),
        config: {
          systemInstruction: "Bạn là kỹ sư QA/QC chuyên nghiệp. Lập hồ sơ kỹ thuật dưới dạng Bảng Thông số kỹ thuật (Spec) chi tiết. Bắt buộc xuất bảng (Markdown) gồm các cột: STT | Chỉ tiêu kiểm tra | Yêu cầu kỹ thuật (Spec/Dung sai) | Tiêu chuẩn áp dụng | Phương pháp kiểm tra. Chỉ xuất bảng và checklist ngắn gọn. KHÔNG chào hỏi, không diễn giải."
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ 
        error: "Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại sau.",
        status: error?.status,
        message: error?.message
      });
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
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
