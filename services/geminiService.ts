
import { GoogleGenAI, Type, GenerateContentResponse, Part } from '@google/genai';
import type { Question, CombinedFileContent, QuestionCounts } from '../types';
import { COGNITIVE_LEVELS } from '../constants';

const formatQuestionRequests = (counts: QuestionCounts): string => {
  let requestText = '';
  
  const d1Counts = Object.entries(counts.multipleChoice)
    .map(([key, count]) => ({ key, count }))
    .filter(item => item.count > 0);
  
  if (d1Counts.length > 0) {
    requestText += `\n*   **Câu hỏi trắc nghiệm (D1):**\n`;
    d1Counts.forEach(item => {
      const level = COGNITIVE_LEVELS.find(l => l.key === item.key);
      if (level) {
        requestText += `        *   Tạo ${item.count} câu ở cấp độ **${level.code}**.\n`;
      }
    });
  }

  if (counts.trueFalse > 0) {
    requestText += `*   **Câu hỏi Đúng/Sai (D2):**\n`;
    requestText += `        *   Tạo ${counts.trueFalse} câu.\n`;
  }

  const d3Counts = Object.entries(counts.essay)
    .map(([key, count]) => ({ key, count }))
    .filter(item => item.count > 0);

  if (d3Counts.length > 0) {
    requestText += `\n*   **Câu hỏi tự luận (D3):**\n`;
    d3Counts.forEach(item => {
      const level = COGNITIVE_LEVELS.find(l => l.key === item.key);
      if (level) {
        requestText += `        *   Tạo ${item.count} câu ở cấp độ **${level.code}**.\n`;
      }
    });
  }

  return requestText;
};


export const generateQuestions = async (
  ai: GoogleGenAI,
  fileContent: CombinedFileContent,
  questionCounts: QuestionCounts
): Promise<Question[]> => {

  const prompt = `
Bạn là một AI chuyên gia trong việc tạo ra các câu hỏi kiểm tra kiến thức về Tin học theo tiêu chuẩn giáo dục Việt Nam.
Dựa vào nội dung tài liệu được cung cấp, hãy tạo ra một bộ câu hỏi.

**Yêu cầu:**

1.  **Phân tích tài liệu:** Đọc và hiểu các chủ đề và thông tin chính trong nội dung được cung cấp.
2.  **Tạo câu hỏi:** Tạo chính xác số lượng câu hỏi sau:
    ${formatQuestionRequests(questionCounts)}
3.  **Gán metadata và Tuân thủ Cấp độ Nhận thức:** Với MỖI câu hỏi, bạn PHẢI:
    *   **Gán một chỉ báo Năng lực:** Chọn một trong các mã sau: [NLa, NLb, NLc, NLd, NLe].
    *   **Gán một cấp độ Nhận thức và đảm bảo yêu cầu của cấp độ đó:**
        *   **Biết:** Câu hỏi yêu cầu học sinh **nhận ra, liệt kê, kể ra**.
        *   **Hiểu:** Câu hỏi yêu cầu học sinh **giải thích, phân biệt, so sánh**.
        *   **Vận dụng:** Câu hỏi yêu cầu học sinh **thực hiện, sử dụng, thiết kế, xây dựng**.
    *   **Viết giải thích Năng lực:** Cung cấp một câu giải thích ngắn gọn (khoảng 15-25 từ) lý do tại sao câu hỏi này đánh giá được Năng lực bạn đã chọn. Lời giải thích phải rõ ràng và trực tiếp liên quan đến nội dung câu hỏi.
4.  **Yêu cầu định dạng cụ thể cho từng loại câu hỏi:**
    *   Tất cả câu hỏi và câu trả lời phải bằng tiếng Việt.
    *   **Câu hỏi trắc nghiệm (D1):**
        *   Phải có 4 lựa chọn (ví dụ: "A. Lựa chọn 1", "B. Lựa chọn 2", ...).
        *   Chỉ có một đáp án đúng.
        *   Trường 'answer' chỉ chứa ký tự của đáp án đúng (ví dụ: "A").
        *   Trường 'options' chứa đầy đủ 4 lựa chọn.
        *   **Chất lượng đáp án (CỰC KỲ QUAN TRỌNG):** Các lựa chọn A, B, C, D phải **ngắn gọn, súc tích** và có độ dài, cấu trúc **tương đồng nhau**.
        *   **QUY TẮC BẮT BUỘC (RÀNG BUỘC CỨNG):** Tuyệt đối không để đáp án đúng dài hơn hoặc chi tiết hơn các phương án gây nhiễu. Tất cả 4 phương án A, B, C, D phải có độ dài tương đồng nhau (số lượng từ chênh lệch không quá 2 từ). Nếu đáp án đúng là một cụm từ dài, các phương án gây nhiễu cũng phải là các cụm từ có độ dài tương ứng. Tránh việc đáp án đúng là câu đầy đủ trong khi các câu gây nhiễu chỉ là từ đơn lẻ.
    *   **Câu hỏi Đúng/Sai (D2):**
        *   Đây là dạng câu hỏi phức hợp, yêu cầu đánh giá tính đúng/sai của các mệnh đề liên quan đến một tình huống.
        *   **Phần dẫn ('questionText'):**
            *   Phải mô tả một tình huống, bối cảnh, hoặc giả định thực tế, có ý nghĩa. **QUAN TRỌNG: Phần này chỉ chứa nội dung tình huống, tuyệt đối không được chứa các lệnh hỏi** như "Hãy xác định các phát biểu sau là Đúng hay Sai" hoặc các câu tương tự. Lệnh hỏi đã được ngầm hiểu qua loại câu hỏi.
            *   Độ dài nên từ 4-10 dòng.
            *   Nội dung cần rõ ràng, súc tích, tránh các thông tin gây nhiễu hoặc ẩn ý.
        *   **Các mệnh đề ('options'):**
            *   Phải cung cấp chính xác 4 mệnh đề (A, B, C, D) để đánh giá.
            *   Các mệnh đề không nên quá dài, cần có độ dài tương đương nhau và đảm bảo tính đơn trị (mỗi mệnh đề chỉ có một ý rõ ràng, không thể hiểu theo nhiều cách).
            *   **Quan trọng:** 4 mệnh đề này PHẢI bao quát đủ cả 3 cấp độ nhận thức (Biết, Hiểu, Vận dụng). Sẽ có ít nhất một mệnh đề cho mỗi cấp độ.
            *   **Yêu cầu metadata cho từng mệnh đề:** Mỗi mệnh đề PHẢI bắt đầu bằng ký hiệu cho cả cấp độ và năng lực. Định dạng bắt buộc là **(Cấp độ, Năng lực)**.
                *   \`Cấp độ\` là một trong các ký tự: B (Biết), H (Hiểu), V (Vận dụng).
                *   \`Năng lực\` là một trong các mã: [NLa, NLb, NLc, NLd, NLe].
                *   Ví dụ đúng: "A. (V, NLc) Mệnh đề mức độ vận dụng."
                *   Ví dụ sai: "A. (V) Mệnh đề..." (thiếu mã năng lực).
        *   'cognitiveLevel' tổng thể của câu hỏi D2 nên được đặt là 'Vận dụng' vì nó là dạng câu hỏi tổng hợp.
        *   'answer' PHẢI là một chuỗi JSON (JSON string). Ví dụ: '{"A":"Đúng","B":"Sai","C":"Đúng","D":"Sai"}'.
        *   **Cân bằng đáp án (RÀNG BUỘC BẮT BUỘC):** Trong 4 mệnh đề A, B, C, D, **PHẢI có cả mệnh đề "Đúng" và mệnh đề "Sai"**. Tuyệt đối không được để cả 4 mệnh đề đều là "Đúng" hoặc cả 4 mệnh đề đều là "Sai". Phải có ít nhất một mệnh đề "Đúng" và ít nhất một mệnh đề "Sai".
    *   **Câu hỏi Tự luận (D3):**
        *   'questionText' là đề bài tự luận.
        *   'options' phải là một mảng rỗng: [].
        *   'answer' phải là một chuỗi văn bản chứa gợi ý trả lời chi tiết hoặc dàn ý chấm điểm.

**Định dạng đầu ra:**

Trả về phản hồi dưới dạng một đối tượng JSON duy nhất tuân thủ nghiêm ngặt schema đã được cung cấp. Không bao gồm bất kỳ văn bản, giải thích hoặc định dạng markdown nào bên ngoài đối tượng JSON.
`;

  const schema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        description: "Danh sách các câu hỏi được tạo ra",
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.NUMBER, description: "Số thứ tự câu hỏi" },
            competency: { type: Type.STRING, description: "Mã năng lực (NLa, NLb, ...)" },
            competencyExplanation: { type: Type.STRING, description: "Giải thích ngắn gọn tại sao câu hỏi phù hợp với năng lực đã chọn." },
            cognitiveLevel: { type: Type.STRING, description: "Cấp độ nhận thức (Biết, Hiểu, Vận dụng)" },
            questionType: { type: Type.STRING, description: "Loại câu hỏi (D1, D2 hoặc D3)" },
            questionText: { type: Type.STRING, description: "Nội dung câu hỏi. Với D2 là câu dẫn. Với D3 là đề bài tự luận." },
            options: {
              type: Type.ARRAY,
              description: "Các lựa chọn cho D1, các mệnh đề A,B,C,D cho D2, hoặc mảng rỗng cho D3.",
              items: { type: Type.STRING }
            },
            answer: { type: Type.STRING, description: "Đáp án. D1: ký tự (A,B,C,D). D2: chuỗi JSON. D3: gợi ý trả lời." },
          },
          required: ["id", "competency", "competencyExplanation", "cognitiveLevel", "questionType", "questionText", "answer", "options"]
        },
      }
    },
    required: ["questions"],
  };

  const model = "gemini-2.5-flash";

  const contentParts: Part[] = [{ text: prompt }];
  
  if (fileContent.text.trim()) {
      contentParts.push({ text: `\n--- NỘI DUNG TÀI LIệu VĂN BẢN ---\n${fileContent.text}` });
  }

  fileContent.images.forEach(image => {
    contentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.content,
      },
    });
  });

  const response: GenerateContentResponse = await ai.models.generateContent({
    model: model,
    contents: { parts: contentParts },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature: 0.8,
    }
  });

  const jsonText = response.text.trim();
  const parsedJson = JSON.parse(jsonText);

  if (parsedJson && parsedJson.questions) {
    // Post-process to ensure correct answer format for D1
    const questions = parsedJson.questions as Question[];
    questions.forEach(q => {
        if (q.questionType === 'D1' && q.answer.length > 1) {
            const match = q.answer.match(/([A-D])/i);
            if (match) {
                q.answer = match[1].toUpperCase();
            }
        }
    });
    return questions;
  }

  throw new Error("Không thể phân tích phản hồi từ API.");
};