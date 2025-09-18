import { TextPair } from './types';

// This reads the main backend URL from the environment variable set by Render
const API_BASE_URL = import.meta.env.VITE_MAIN_BACKEND_URL;
if (!API_BASE_URL) {
    console.error("VITE_MAIN_BACKEND_URL is not set!");
}

async function getAuthToken() {
    // In a real app, you might get this from a more secure place
    return localStorage.getItem('access_token');
}

// --- Functions for managing training data ---

export async function fetchExamples(): Promise<TextPair[]> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}admin/style_editor_data/styleexample//`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to fetch examples');
    const data = await response.json();
    // Map backend fields to frontend fields
    return data.map((item: any) => ({
        id: item.id.toString(),
        raw: item.before_text,
        edited: item.after_text
    }));
}

export async function addExample(pair: Omit<TextPair, 'id'>): Promise<TextPair> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/style-examples/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(pair)
    });
    if (!response.ok) throw new Error('Failed to add example');
    const data = await response.json();
    return {
        id: data.id.toString(),
        raw: data.before_text,
        edited: data.after_text
    };
}

export async function deleteExample(id: string): Promise<void> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/style-examples/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Failed to delete example');
}


// --- Function for AI editing ---

export async function callPredictAPI(rawText: string): Promise<string> {
    const token = await getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/style-examples/predict/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ raw_text: rawText })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Prediction API failed');
    }
    const data = await response.json();
    return data.edited_text;
}