import { Hono } from 'hono';
import type { Env } from '../types/env';

type TranscribeRequest = {
  audio: string;
  format?: string;
};

const transcribe = new Hono<{ Bindings: Env }>();

transcribe.post('/', async (c) => {
  try {
    const body = await c.req.json<TranscribeRequest>();
    const { audio: base64Audio, format } = body;

    if (!base64Audio || typeof base64Audio !== 'string') {
      return c.json({ error: 'Missing or invalid audio data' }, 400);
    }

    const apiKey = c.env.OPEN_AI_KEY;
    if (!apiKey) {
      return c.json({ error: 'OpenAI API key not configured' }, 500);
    }

    // Convert base64 string to ArrayBuffer/Uint8Array
    // Handle base64 string (remove data URL prefix if present)
    const base64Data = base64Audio.includes(',')
      ? base64Audio.split(',')[1]
      : base64Audio;

    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Validate buffer is not empty
    if (bytes.length === 0) {
      return c.json({ error: 'Audio file is empty' }, 400);
    }

    // Determine the audio format (default to m4a if not specified)
    const audioFormat = format ?? 'm4a';
    const fileName = `audio.${audioFormat}`;

    // Create FormData for OpenAI API with the correct file format
    const formData = new FormData();
    const blob = new Blob([bytes], { type: `audio/${audioFormat}` });
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-1');

    // Call OpenAI's transcription API directly
    const response = await fetch(
      'https://api.openai.com/v1/audio/transcriptions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = (await response.json()) as {
          error?: { message?: string };
        };
        errorMessage = errorData.error?.message ?? `HTTP ${response.status}`;
      } catch {
        errorMessage = await response.text();
      }
      // Use a valid status code (500 for server errors, 400 for client errors)
      const statusCode =
        response.status >= 400 && response.status < 500 ? 400 : 500;
      return c.json({ error: `OpenAI API error: ${errorMessage}` }, statusCode);
    }

    const result = (await response.json()) as { text: string };
    if (!result.text || typeof result.text !== 'string') {
      return c.json({ error: 'Invalid response from OpenAI API' }, 500);
    }

    return c.json({ text: result.text });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to transcribe audio';
    return c.json({ error: message }, 500);
  }
});

export default transcribe;
