import { GoogleGenerativeAI } from '@google/generative-ai';
import { OpenAI } from 'openai';



const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
  
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LLM_PROVIDERS = {
    chatgpt: {
        name: 'ChatGPT (Free - GPT 3.5)',
        model: 'gpt-3.5-turbo',
        generate: async (message) => {
          try {
            const chat = await openai.chat.completions.create({
              model: 'gpt-3.5-turbo', // ✅ Free-tier model
              messages: [
                {
                  role: 'system',
                  content:
                    'You are a chatbot having a friendly, human-like conversation. Respond in 1-2 short sentences and always ask a relevant follow-up question like a human chatting casually.'
                },
                {
                  role: 'user',
                  content: message
                }
              ]
            });
    
            return chat.choices?.[0]?.message?.content || 'No response from ChatGPT';
          } catch (error) {
            const status = error?.response?.status;
            const msg = error?.response?.data?.error?.message || error.message;
            console.error(`❌ ChatGPT API Error [${status ?? 'unknown'}]:`, msg);
    
            if (status === 429) {
              return '⚠️ Rate limit reached for ChatGPT Free (gpt-3.5). Please wait and try again.';
            }
    
            return '❌ Failed to get a response from ChatGPT.';
          }
        }
      },
  
    gemini: {
        name: 'gemini-1.5-flash (Google)',
        model: 'gemini-1.5-flash',
        generate: async (message) => {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
          const result = await model.generateContent({
            contents: [
              {
                parts: [
                  {
                    text:
                      'You are a chatbot having a friendly, human-like conversation. Respond in 1-2 short sentences and always ask a relevant follow-up question like a human chatting casually.\n\n' +
                      message
                  }
                ]
              }
            ]
          });
    
          return result.response?.text() || 'No response from Gemini';
        }
      }
  };
  



const test =  async function (req, res) {      
 try{
    return res.status(200).json({message : "TEST SUCCESS"})

 }catch(error){
    res.status(500).json({message : "INTERNAL SERVER ERROR"})
 }
}


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const getLLMResponse = async (botName, message, retries = 3) => {
  const bot = LLM_PROVIDERS["gemini"];
  if (!bot) throw new Error(`Invalid bot name: ${botName}`);

  try {
    delay(2000);
    return await bot.generate(message); 
  } catch (error) {
    const status = error?.response?.status;
    const msg = error?.response?.data || error.message;

    console.error(`❌ Error from ${bot.name} [${status ?? 'unknown'}]:`, msg);

    if (status === 429 && retries > 0) {
      console.warn(`⚠️ Rate limited by ${bot.name}. Retrying in 4 seconds... (${retries} left)`);
      await delay(4000);
      return await getLLMResponse(botName, message, retries - 1);
    }

    return `❌ Failed to fetch from ${bot.name}`;
  }
};


export  {    
  test, getLLMResponse
}
