import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import fetch from 'node-fetch'; // We need this to make API calls

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Gemini AI Setup ---
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error("FATAL ERROR: GEMINI_API_KEY is not set.");
    process.exit(1);
}
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// This is the internal URL to our main Django backend
// It's automatically provided by Render.
const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL;

// --- API Routes ---

// This function forwards requests to the main backend, adding the user's auth token
const forwardRequest = async (req, res, path, method, body = null) => {
    if (!MAIN_BACKEND_URL) {
        return res.status(500).json({ message: "Main backend service URL is not configured." });
    }

    // Forward the authorization header from the original request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header is missing." });
    }

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${MAIN_BACKEND_URL}${path}`, options);
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error(`Error forwarding request to ${path}:`, error);
        res.status(500).json({ message: 'Failed to communicate with the main backend service.' });
    }
};

app.get('/api/pairs', (req, res) => forwardRequest(req, res, '/api/style-examples/', 'GET'));
app.post('/api/pairs', (req, res) => forwardRequest(req, res, '/api/style-examples/', 'POST', req.body));
app.delete('/api/pairs/:id', (req, res) => forwardRequest(req, res, `/api/style-examples/${req.params.id}/`, 'DELETE'));

// The main endpoint for AI editing
app.post('/api/predict', async (req, res) => {
    // The examples are now passed directly from the frontend
    const { raw_text, examples } = req.body;

    if (!raw_text || !Array.isArray(examples)) {
        return res.status(400).json({ message: 'Invalid request body.' });
    }

    try {
        const examplePrompts = examples.map(p => `Original: ${p.raw}\nEdited: ${p.edited}`).join('\n\n');
        const prompt = `
          You are an expert Arabic text editor...
          Original: ${raw_text}
          Edited:
        `;

        const result = await model.generateContent(prompt);
        const editedText = result.response.text();
        res.json({ edited_text: editedText });
    } catch (error) {
        console.error("Error in /api/predict:", error);
        res.status(500).json({ message: "An error occurred with the AI model." });
    }
});

app.listen(PORT, () => {
    console.log(`Style-editor backend is running on http://localhost:${PORT}`);
});