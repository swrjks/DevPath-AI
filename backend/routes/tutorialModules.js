const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { YoutubeTranscript } = require('youtube-transcript');

// Set up simple local database using a JSON file
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}
const dbPath = path.join(dataDir, 'modules.json');
const attemptsDbPath = path.join(dataDir, 'quiz_attempts.json');

// Initialize database if it doesn't exist
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify([]), 'utf-8');
}
if (!fs.existsSync(attemptsDbPath)) {
  fs.writeFileSync(attemptsDbPath, JSON.stringify([]), 'utf-8');
}

const getModulesDB = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const saveModulesDB = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');

const getAttemptsDB = () => JSON.parse(fs.readFileSync(attemptsDbPath, 'utf-8'));
const saveAttemptsDB = (data) => fs.writeFileSync(attemptsDbPath, JSON.stringify(data, null, 2), 'utf-8');

// Load env specific to the backend folder
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper to extract video ID from URL
const extractVideoId = (url) => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : false;
};

// GET: Fetch all modules
router.get('/', (req, res) => {
  try {
    const modules = getModulesDB();
    res.json(modules);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch modules' });
  }
});

// GET: Fetch all quiz attempts
router.get('/quiz/attempts', (req, res) => {
  try {
    const attempts = getAttemptsDB();
    res.json(attempts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz attempts' });
  }
});

// GET: Fetch specific module
router.get('/:id', (req, res) => {
  try {
    const modules = getModulesDB();
    const mod = modules.find(m => m.id === req.params.id);
    if (!mod) return res.status(404).json({ error: 'Module not found' });
    res.json(mod);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch module' });
  }
});

// GET: Fetch or Generate Quiz for a Module
router.get('/:id/quiz', async (req, res) => {
  try {
    const modules = getModulesDB();
    const moduleIndex = modules.findIndex(m => m.id === req.params.id);
    if (moduleIndex === -1) return res.status(404).json({ error: 'Module not found' });
    
    const mod = modules[moduleIndex];
    if (mod.quiz) {
      return res.json(mod.quiz);
    }

    // Generate Quiz using OpenAI
    const prompt = `Based on the following learning module content, generate a highly engaging multiple-choice quiz. 
    
    Module Title: ${mod.title}
    Content: ${mod.content.raw_markdown}
    
    Respond strictly in JSON format matching this exact interface:
    {
      "title": "Module Quiz",
      "difficulty": "intermediate",
      "timeLimit": 300,
      "questions": [
        {
          "id": "q1",
          "type": "multiple_choice",
          "question": "What is...?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "explanation": "Option A is correct because..."
        }
      ]
    }
    
    Notes: Generate 5-10 high-quality questions. Ensure correctAnswer is an integer index (0-3).`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an expert curriculum designer. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const quizData = JSON.parse(response.choices[0].message.content);
    
    // Save to DB so we don't regenerate it
    modules[moduleIndex].quiz = quizData;
    saveModulesDB(modules);

    res.json(quizData);
  } catch (error) {
    console.error("Quiz generation error:", error);
    res.status(500).json({ error: 'Failed to generate module quiz' });
  }
});

// DELETE: Remove specific module
router.delete('/:id', (req, res) => {
  try {
    let modules = getModulesDB();
    modules = modules.filter(m => m.id !== req.params.id);
    saveModulesDB(modules);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete module' });
  }
});

// POST: Save a quiz attempt
router.post('/:id/quiz/attempt', (req, res) => {
  try {
    const { score, totalQuestions, passed } = req.body;
    const attempts = getAttemptsDB();
    const newAttempt = {
      id: uuidv4(),
      moduleId: req.params.id,
      score,
      totalQuestions,
      passed,
      timestamp: new Date().toISOString()
    };
    attempts.unshift(newAttempt);
    saveAttemptsDB(attempts);
    res.json(newAttempt);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save quiz attempt' });
  }
});

router.post('/analyze-video', async (req, res) => {
  try {
    const { videoUrl } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: 'Missing videoUrl' });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // 1. Fetch transcript using youtube-transcript
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      // Combine the text of all chunks
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (err) {
      console.warn("Transcript disabled or unavailable for this video:", err.message);
      // If no transcript is available, we will fallback to a generated summary based on the link.
      transcriptText = "Transcript unavailable. Please generate a highly educational summary based on the URL context and standard programming knowledge.";
    }

    // 2. Limit transcript length to avoid token limits
    const maxContextLength = 3000 * 4; // Roughly 3000 words
    if (transcriptText.length > maxContextLength) {
      transcriptText = transcriptText.substring(0, maxContextLength) + "...";
    }

    // 3. Use the exact structured prompt logic from Scanner-main
    const prompt = `Create a comprehensive learning module from this video segment:

Video URL: ${videoUrl}
Content Transcript: ${transcriptText}

Generate a structured learning module with:
1. Engaging module title (concise, descriptive)
2. Clear learning objectives (3-5 specific, measurable points)
3. Detailed explanation of concepts (200-500 words)
4. Code examples with annotations (if technical content)
5. Common pitfalls and best practices (3-5 points)
6. Real-world applications (2-3 examples)

Respond strictly in JSON format with keys:
- title: string
- description: string (2-3 sentences)
- learning_objectives: array of strings
- detailed_content: string (main explanation)
- code_examples: array of objects with 'code' and 'explanation'
- common_pitfalls: array of strings
- best_practices: array of strings
- real_world_applications: array of strings
- key_concepts: array of strings (3-5 main concepts)`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use mini for speed, or gpt-3.5-turbo if you prefer
      messages: [
        { 
          role: "system", 
          content: "You are an expert educational content creator. Create engaging, comprehensive learning modules that help developers learn effectively. Output valid JSON." 
        },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const moduleDataRaw = response.choices[0].message.content;
    const moduleData = JSON.parse(moduleDataRaw);

    // 4. Transform the structured JSON into Markdown for the frontend renderer
    let markdownSummary = `# ${moduleData.title || 'Module Overview'}\n\n`;
    
    if (moduleData.description) {
      markdownSummary += `*${moduleData.description}*\n\n`;
    }

    if (moduleData.learning_objectives && moduleData.learning_objectives.length > 0) {
      markdownSummary += `## Learning Objectives\n`;
      moduleData.learning_objectives.forEach(obj => markdownSummary += `- ${obj}\n`);
      markdownSummary += `\n`;
    }

    if (moduleData.key_concepts && moduleData.key_concepts.length > 0) {
      markdownSummary += `## Key Concepts\n`;
      markdownSummary += `**${moduleData.key_concepts.join(' • ')}**\n\n`;
    }

    if (moduleData.detailed_content) {
      markdownSummary += `## Detailed Explanation\n${moduleData.detailed_content}\n\n`;
    }

    if (moduleData.code_examples && moduleData.code_examples.length > 0) {
      markdownSummary += `## Code Examples\n`;
      moduleData.code_examples.forEach((ex, idx) => {
        markdownSummary += `${ex.explanation || `Example ${idx + 1}`}\n`;
        markdownSummary += `\`\`\`javascript\n${ex.code}\n\`\`\`\n\n`;
      });
    }

    if (moduleData.best_practices && moduleData.best_practices.length > 0) {
      markdownSummary += `## Best Practices\n`;
      moduleData.best_practices.forEach(bp => markdownSummary += `- ✅ ${bp}\n`);
      markdownSummary += `\n`;
    }

    if (moduleData.common_pitfalls && moduleData.common_pitfalls.length > 0) {
      markdownSummary += `## Common Pitfalls\n`;
      moduleData.common_pitfalls.forEach(pf => markdownSummary += `- ❌ ${pf}\n`);
      markdownSummary += `\n`;
    }

    if (moduleData.real_world_applications && moduleData.real_world_applications.length > 0) {
      markdownSummary += `## Real World Applications\n`;
      moduleData.real_world_applications.forEach(app => markdownSummary += `- 🌍 ${app}\n`);
      markdownSummary += `\n`;
    }

    // 5. Save the generated structured module directly to local JSON "database"
    const newModule = {
      id: uuidv4(),
      title: moduleData.title || `Module ${new Date().toISOString()}`,
      description: moduleData.description || 'A comprehensive learning module spawned from YouTube content.',
      difficulty: 'intermediate',
      estimated_time_minutes: 30,
      category: 'General',
      source_video_id: videoId,
      source_url: videoUrl,
      created_at: new Date().toISOString(),
      content: {
        raw_markdown: markdownSummary.trim(), // Storing raw markdown as requested by the frontend previously
        learning_objectives: moduleData.learning_objectives || [],
        key_concepts: moduleData.key_concepts || [],
        detailed_content: moduleData.detailed_content || '',
        code_examples: moduleData.code_examples || [],
        practice_tasks: moduleData.learning_objectives?.map((obj, i) => ({
          title: `Objective ${i + 1}`,
          description: `Implement the concept: ${obj}`,
          requirements: [obj],
          starter_code: '# Write your implementation here\\npass\\n',
          hints: ['Try breaking the problem down.']
        })) || []
      }
    };

    const modulesDB = getModulesDB();
    modulesDB.unshift(newModule); // Add to the top
    saveModulesDB(modulesDB);

    // 6. Return the newly formatted Markdown back
    res.json({ 
      summary: markdownSummary.trim(),
      moduleData: newModule // Exposing full module just in case frontend wants it
    });

  } catch (error) {
    console.error("OpenAI API or Transcript error:", error);
    res.status(500).json({ error: 'Failed to analyze video correctly - ' + (error.message || error) });
  }
});

router.post('/ask-video-question', async (req, res) => {
  try {
    const { videoUrl, question, chatHistory = [] } = req.body;

    if (!videoUrl || !question) {
      return res.status(400).json({ error: 'Missing videoUrl or question' });
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // 1. Fetch transcript context
    let transcriptText = '';
    try {
      const transcript = await YoutubeTranscript.fetchTranscript(videoId);
      transcriptText = transcript.map(t => t.text).join(' ');
    } catch (err) {
      transcriptText = "Transcript unavailable. Provide the best possible educational answer based on general programming knowledge related to the video URL.";
    }

    // Cap transcript length to avoid token limits
    const maxContextLength = 3000 * 4;
    if (transcriptText.length > maxContextLength) {
      transcriptText = transcriptText.substring(0, maxContextLength) + "...";
    }

    // 2. Build Message Array for Chat
    const messages = [
      { 
        role: "system", 
        content: `You are an expert, friendly AI mentor teaching a developer about a programming video. 
        Here is the transcript of the video they are watching:
        <transcript>
        ${transcriptText}
        </transcript>
        
        Answer their questions directly using context from this video. Be highly educational, concise, and format your answers with markdown if code is involved.` 
      }
    ];

    // Append history
    chatHistory.forEach(msg => {
      messages.push({
        role: msg.role === 'ai' ? 'assistant' : 'user',
        content: msg.content
      });
    });

    // Append the new question
    messages.push({ role: 'user', content: question });

    // 3. Ask OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      temperature: 0.7,
    });

    res.json({ answer: response.choices[0].message.content });

  } catch (error) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: 'Failed to answer question' });
  }
});

module.exports = router;
