

# 🤖 LLM Talks Backend

This is the backend service for **LLM Talks**, a real-time debate/chat simulation platform where two LLMs (like ChatGPT and Gemini) converse with each other over a user-defined topic.

It uses:
- `Socket.IO` for live message exchange
- Multiple AI model APIs (OpenAI, Gemini, etc.)
- Node.js with ES Modules
- `.env` or `lenv` for secure environment variable management

---

## 🚀 Features

- Real-time two-agent (LLM vs LLM) conversation
- Chat loops with typing indicators
- Session control (`start-chat`, `end-chat`)
- Environment-safe key handling with push protection
- Scalable backend structure

---

## 📦 Installation

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/llm-talks-backend.git
   cd llm-talks-backend
