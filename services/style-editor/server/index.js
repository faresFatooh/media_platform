import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const app = express();
const PORT = 3001; // The internal port our server will run on

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Path to our simple JSON database file
const DB_PATH = path.join(process.cwd(), 'db.json');

// --- Gemini AI Setup ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });


// Helper function to read from the database
const readDb = async () => {
    try {
        const data = await fs.readFile(DB_PATH, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        // If the file doesn't exist, create it with initial data
        const initialData = { pairs: [], nextId: 1 };
        await fs.writeFile(DB_PATH, JSON.stringify(initialData, null, 2));
        return initialData;
    }
};

// Helper function to write to the database
const writeDb = (data) => {
    return fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};


// --- API Routes ---

// GET all style pairs
app.get('/api/pairs', async (req, res) => {
    const db = await readDb();
    res.json(db.pairs);
});

// POST a new style pair
app.post('/api/pairs', async (req, res) => {
    const { before, after } = req.body;
    if (!before || !after) {
        return res.status(400).json({ message: 'Both "before" and "after" fields are required.' });
    }
    const db = await readDb();
    const newPair = { id: String(db.nextId++), raw: before, edited: after };
    db.pairs.push(newPair);
    await writeDb(db);
    res.status(201).json(newPair);
});

// DELETE a style pair
app.delete('/api/pairs/:id', async (req, res) => {
    const { id } = req.params;
    const db = await readDb();
    const initialLength = db.pairs.length;
    db.pairs = db.pairs.filter(p => p.id !== id);
    if (db.pairs.length === initialLength) {
        return res.status(404).json({ message: `Pair with id ${id} not found.` });
    }
    await writeDb(db);
    res.json({ message: 'Pair deleted successfully.' });
});

// The main endpoint for AI editing
app.post('/api/predict', async (req, res) => {
    const { raw_text, examples } = req.body;

    if (!raw_text || !Array.isArray(examples)) {
        return res.status(400).json({ message: 'Invalid request body.' });
    }
    
    try {
        const examplePrompts = examples.map(p => `Original: ${p.raw}\nEdited: ${p.edited}`).join('\n\n');
        const prompt = `
          You are an expert Arabic text editor. Your task is to edit the following text based on the provided style examples.
          Maintain the original meaning but improve the style, grammar, and clarity according to the examples.
          
          Here are the examples of the desired style:
          ${examplePrompts}
          
          Now, please edit this text in the same style:
          Original: ${raw_text}
          Edited:
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const editedText = response.text();
        
        res.json({ edited_text: editedText });

    } catch (error) {
        console.error("Error in /api/predict:", error);
        res.status(500).json({ message: "An error occurred while processing the request with the AI model." });
    }
});


// Start server
app.listen(PORT, () => {
    console.log(`Style-editor backend is running on http://localhost:${PORT}`);
});