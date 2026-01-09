const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

app.post('/api/analyze', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.length < 100) {
      return res.status(400).json({ error: 'Invalid text provided' });
    }

    const prompt = `You are a legal expert. Analyze the following legal document/policy and provide:

1. A crisp 3-4 line summary that captures the essence
2. 2-3 critical points users must know

Format your response EXACTLY as JSON:
{
  "summary": "Your 3-4 line summary here",
  "critical_points": [
    "First critical point",
    "Second critical point",
    "Third critical point"
  ]
}

Legal Document:
${text}`;

    const response = await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful legal analyst. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('Groq API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    res.json(result);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Analysis failed' });
  }
});

<<<<<<< HEAD
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
=======
module.exports = app;

 
>>>>>>> 35709967036f66e254a0afd782f9ec885267cca4
