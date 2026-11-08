import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

async function startServer() {
  const app = express();
  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI TOC Chat Endpoint
  app.post('/api/chat-toc', async (req, res) => {
    try {
      const messages = req.body.messages;
      const planningContext = req.body.planningContext || req.body.planning || {};

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server.',
        });
      }

      if (!Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required.' });
      }

      const systemInstruction = `당신은 처음 책을 쓰는 성인 예비 작가를 돕는 따뜻하고 친절한 베테랑 출판 기획자/글쓰기 코치입니다.
수강생은 '나만의 전자책 기획 카드'를 작성하고 있으며, 당신의 목표는 수강생과 대화를 나누며 '3~5개의 큰 장으로 이루어진 목차 뼈대'를 함께 완성하는 것입니다.

[현재 수강생의 기획 카드 정보]
- 작성자: ${planningContext?.authorName || '예비 작가'}
- 가제 (임시 제목): ${planningContext?.title || '(아직 미입력)'}
- 관심 주제: ${planningContext?.topic || '(아직 미입력)'}
- 나의 경험: ${planningContext?.experience || '(아직 미입력)'}
- 예상 독자: ${planningContext?.targetReader || '(아직 미입력)'}
- 핵심 메시지: ${planningContext?.coreMessage || '(아직 미입력)'}
- 현재 작성된 목차: ${JSON.stringify(planningContext?.tableOfContents || [])}

[대화 원칙 - 엄격 준수]
1. 한 번에 완성된 목차를 내놓지 마세요. 반드시 "한 번에 질문 하나씩"만 묻습니다.
2. 처음 책을 쓰는 성인이 편안하게 답할 수 있도록 글씨와 어조는 쉽고, 따뜻하고, 격려하는 어조여야 합니다.
3. 첫 질문 단계:
   수강생이 입력한 주제와 경험, 독자, 메시지를 짚어주며, 먼저 "이번 책에서 꼭 넣고 싶은 사례나 아이디어"가 무엇인지 짧게 물어보세요.
4. 목차 뼈대 제안 단계:
   수강생이 꼭 넣고 싶은 사례나 아이디어를 답한 뒤에는, 이를 반영하여 3~5개의 큰 장으로 구성된 목차 뼈대(초안)를 제안해주세요.
5. 수정 단계:
   수강생이 '이 내용 추가', '순서 변경', '이 장 삭제', '더 쉽게', '3장으로 줄여줘' 등의 피드백을 주면 이전 대화와 입력 내용을 모두 고려하여 목차를 수정해 제안하세요.
6. 절대 수강생의 경험을 지어내지 마세요. 부족한 정보가 있으면 짧게 질문하세요.
7. 본문이나 원고 작성 칸은 다루지 않으며, 오직 '목차 뼈대'에만 집중합니다.
8. [관련 도서 참고 시 엄격 지침]:
   - 출처에서 판매 순위를 공식적으로 확인하지 못했다면 '베스트셀러' 또는 '흥행 순위'라고 표현하지 마세요.
   - 책의 본문이나 세부 목차를 길게 복사하지 마세요.
   - 오직 '독자에게 말을 거는 방식(문체/어조)', '장 전개 방식(도입-전개-마무리 구성)'처럼 일반적인 구성 아이디어만 설명하고, 수강생 자신의 고유한 경험에 맞는 새로운 목차를 만들도록 이끌어주세요.

[출력 형식 가이드]
수강생에게 전할 친절하고 명확한 대화 답변을 작성하세요.
만약 이번 답변에서 3~5개 장으로 구성된 목차를 제안하거나 수정한 경우, 답변 본문 속에 각 장을 읽기 쉽게 번호로 보여주고, 답변 맨 마지막 줄에 시스템이 자동 인식할 수 있도록 아래와 같은 JSON 블록을 반드시 포함하세요:
\`\`\`toc_json
[
  "1장. ...",
  "2장. ...",
  "3장. ...",
  "4장. ...",
  "5장. ..."
]
\`\`\`
(단, 목차를 제안하는 것이 아니라 단순 질문이나 추가 확인을 하는 턴에는 \`\`\`toc_json 블록을 절대 넣지 마세요.)
`;

      // Convert conversation messages to Gemini contents format
      const contents = messages.map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }));

      let response;
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastError;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });
          if (response?.text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Model ${modelName} encountered error, trying next option...`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }

      if (!response) {
        throw lastError || new Error('AI 모델 응답을 생성하지 못했습니다.');
      }

      const replyText = response.text || '';

      // Parse optional toc_json block
      let suggestedChapters: string[] | null = null;
      const tocMatch = replyText.match(/```toc_json\s*([\s\S]*?)\s*```/);
      if (tocMatch) {
        try {
          const parsed = JSON.parse(tocMatch[1]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            suggestedChapters = parsed.map((item) => String(item).trim());
          }
        } catch (e) {
          console.error('Failed to parse toc_json:', e);
        }
      }

      // Clean out the raw toc_json codeblock from the user-facing text
      const cleanReply = replyText.replace(/```toc_json[\s\S]*?```/g, '').trim();

      res.json({
        reply: cleanReply,
        suggestedChapters,
      });
    } catch (error: any) {
      console.error('Error generating TOC response:', error);
      res.status(500).json({
        error: error.message || 'AI 목차 생성 중 오류가 발생했습니다.',
      });
    }
  });

  // Real-time Book Search Grounding Endpoint (관련 책 살펴보기)
  app.post('/api/search-books', async (req, res) => {
    const today = new Date();
    const inquiryDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;
    const { topic, field, experience, targetReader, coreMessage } = req.body || {};
    const searchTopic = (topic || field || '도서 기획 출판').trim();

    try {
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
          success: false,
          query: searchTopic,
          inquiryDate,
          books: [],
          errorMessage: '서버에 GEMINI_API_KEY가 설정되어 있지 않습니다.',
        });
      }

      const prompt = `당신은 출판 기획 전문가입니다.
수강생이 작성 중인 전자책 기획의 주제 및 분야에 맞는 최근 국내 서점(교보문고, 예스24, 알라딘 등)의 출간 도서를 실시간 Google 검색을 통해 조회하고 분석해 주세요.

[수강생 기획 내용]
- 관심 주제: ${searchTopic}
- 세부 분야 및 경험: ${field || experience || '(미정)'}
- 예상 독자: ${targetReader || '일반 독자'}
- 전하고 싶은 핵심 메시지: ${coreMessage || '(미정)'}

[엄격 준수 지침]
1. Google 검색을 통해 현재 국내 서점이나 포털에서 확인 가능한 실제 출간 도서 2~3권을 찾아주세요.
2. [절대 금지 - 매우 중요]:
   출처에서 판매 순위를 공식적으로 확인하지 못했다면, 절대로 '베스트셀러' 또는 '흥행 순위', '1위'라고 표기하거나 단어를 사용하지 마세요.
3. [절대 금지]:
   책의 본문이나 세부 목차를 길게 복사하지 마세요.
4. 일반적인 구성 아이디어 분석:
   - 독자에게 말을 거는 방식: 이 책이 독자에게 친근하게 다가가는 어조, 문체, 소통 방식 (1~2문장)
   - 장 전개 방식: 3~5개 장처럼 큰 뼈대를 어떻게 전개해 나갔는지의 유기적 구조 특징 (1~2문장)
5. 수강생을 위한 조언 (adviceForAuthor):
   수강생이 남의 책을 모방하지 않고, 자신의 고유한 경험을 살려 독창적인 목차를 만들기 위한 따뜻하고 실천적인 가이드.
6. 만약 검색 결과 적합한 책을 찾지 못했다면 빈 배열로 응답하세요.

반드시 다음 JSON 형식으로만 응답해 주세요:
\`\`\`json
{
  "books": [
    {
      "title": "확인된 책 제목",
      "author": "저자명",
      "sourceUrl": "서점 또는 도서 상세 링크 URL",
      "publisher": "출판사명 (확인된 경우)",
      "toneInsight": "독자에게 말을 거는 방식 (1~2문장)",
      "structureInsight": "장 전개 방식의 구조적 특징 (1~2문장)"
    }
  ],
  "generalInsights": {
    "toneSummary": "유사 분야 도서들이 독자에게 말을 거는 전반적인 방식 요약",
    "structureSummary": "독자의 흥미를 끄는 효과적인 장 전개 구조 요약",
    "adviceForAuthor": "수강생 자신의 경험에 맞는 새로운 목차 구성을 위한 조언"
  }
}
\`\`\``;

      let response;
      const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
      let lastError;

      for (const modelName of modelsToTry) {
        try {
          response = await ai.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              tools: [{ googleSearch: {} }],
              temperature: 0.3,
            },
          });
          if (response?.text) break;
        } catch (err: any) {
          lastError = err;
          console.warn(`Search books with ${modelName} error:`, err?.message || err);
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
      }

      // If Google Search grounding failed (e.g. temporary search tool quota limits),
      // try a fallback attempt with gemini-3.1-flash-lite to check published books knowledge base
      if (!response || !response.text) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-3.1-flash-lite',
            contents: prompt + "\n참고: 검색 도구 일시 연결 실패 시, 이미 널리 알려진 실제 출간 도서(국내 서점 검색 가능한 실제 서적) 중 확인된 2권을 엄격하게 선별해 안내하고 교보문고 검색 링크(https://search.kyobobook.co.kr/search?keyword=...)를 sourceUrl로 제공해 주세요. 절대 베스트셀러나 순위를 지어내지 마세요.",
            config: {
              temperature: 0.2,
            },
          });
        } catch (fallbackErr: any) {
          console.warn('Fallback books generation error:', fallbackErr?.message || fallbackErr);
        }
      }

      if (!response || !response.text) {
        return res.json({
          success: false,
          query: searchTopic,
          inquiryDate,
          books: [],
          errorMessage: '검색 연결에 실패하였거나 결과를 불러오지 못했습니다. 검색 없이도 나만의 고유한 경험으로 목차 만들기를 계속 진행하실 수 있습니다.',
        });
      }

      const text = response.text;
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const groundingSources = (chunks || [])
        .filter((c: any) => c.web?.uri)
        .map((c: any) => ({
          title: c.web.title || '도서 정보 출처',
          uri: c.web.uri,
        }));

      let parsedData: any = null;
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          console.error('Failed to parse search books json:', e);
        }
      } else {
        try {
          parsedData = JSON.parse(text);
        } catch (e) {
          // non-json response
        }
      }

      const rawBooks = Array.isArray(parsedData?.books) ? parsedData.books : [];
      const books = rawBooks.map((b: any, idx: number) => {
        let sourceUrl = b.sourceUrl;
        if (!sourceUrl || !sourceUrl.startsWith('http')) {
          if (groundingSources[idx]?.uri) {
            sourceUrl = groundingSources[idx].uri;
          } else if (groundingSources[0]?.uri) {
            sourceUrl = groundingSources[0].uri;
          } else {
            sourceUrl = `https://search.kyobobook.co.kr/search?keyword=${encodeURIComponent(b.title || searchTopic)}`;
          }
        }
        return {
          title: String(b.title || '제목 미상').trim(),
          author: String(b.author || '저자 미상').trim(),
          sourceUrl,
          inquiryDate,
          publisher: b.publisher ? String(b.publisher).trim() : undefined,
          toneInsight: b.toneInsight ? String(b.toneInsight).trim() : undefined,
          structureInsight: b.structureInsight ? String(b.structureInsight).trim() : undefined,
        };
      });

      res.json({
        success: books.length > 0,
        query: searchTopic,
        inquiryDate,
        books,
        generalInsights: parsedData?.generalInsights || null,
        groundingSources,
        errorMessage: books.length === 0 ? '수강생의 주제와 직접 일치하는 최근 확인 가능한 책을 찾지 못했습니다. 검색 없이도 나만의 고유한 경험으로 목차를 구성하실 수 있습니다.' : undefined,
      });
    } catch (error: any) {
      console.error('Error in /api/search-books:', error);
      res.json({
        success: false,
        query: searchTopic,
        inquiryDate,
        books: [],
        errorMessage: '검색 연결에 실패했습니다. 검색 없이도 나만의 고유한 경험으로 목차 대화를 계속하실 수 있습니다.',
      });
    }
  });

  // Setup Vite middleware for development, or static serve for production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
