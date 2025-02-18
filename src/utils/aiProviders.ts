
interface AIResponse {
  text: string;
  error?: string;
}

export const callGroqAI = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('GROQ_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error calling Groq:', error);
    return { text: '', error: 'Errore nella chiamata a Groq' };
  }
};

export const callGeminiAI = async (prompt: string): Promise<AIResponse> => {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('GEMINI_API_KEY')}`,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    });

    const data = await response.json();
    return { text: data.candidates[0].content.parts[0].text };
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return { text: '', error: 'Errore nella chiamata a Gemini' };
  }
};

export const callOllamaAI = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
      }),
    });

    const data = await response.json();
    return { text: data.response };
  } catch (error) {
    console.error('Error calling Ollama:', error);
    return { text: '', error: 'Errore nella chiamata a Ollama' };
  }
};

export const callPerplexityAI = async (prompt: string, model: string): Promise<AIResponse> => {
  try {
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('PERPLEXITY_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: 'Be precise and concise.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return { text: data.choices[0].message.content };
  } catch (error) {
    console.error('Error calling Perplexity:', error);
    return { text: '', error: 'Errore nella chiamata a Perplexity' };
  }
};

export const getAIResponse = async (
  prompt: string, 
  provider: string, 
  model: string
): Promise<AIResponse> => {
  switch (provider) {
    case 'groq':
      return callGroqAI(prompt, model);
    case 'gemini':
      return callGeminiAI(prompt);
    case 'ollama':
      return callOllamaAI(prompt, model);
    case 'perplexity':
      return callPerplexityAI(prompt, model);
    default:
      return { text: '', error: 'Provider non supportato' };
  }
};
