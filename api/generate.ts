import { GoogleGenAI } from "@google/genai";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

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

    res.status(200).json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: "Đã xảy ra lỗi khi tạo hồ sơ. Vui lòng thử lại sau.",
      status: error?.status,
      message: error?.message
    });
  }
}
