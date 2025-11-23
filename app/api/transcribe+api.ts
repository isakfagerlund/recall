import { StatusError } from 'expo-server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { audio: base64Audio, format } = body;

    if (!base64Audio || typeof base64Audio !== 'string') {
      throw new StatusError(400, 'Missing or invalid audio data');
    }

    const apiKey = process.env.OPEN_AI_KEY;
    if (!apiKey) {
      throw new StatusError(500, 'OpenAI API key not configured');
    }

    // Convert base64 string to Buffer
    const buffer = Buffer.from(base64Audio, 'base64');

    // Validate buffer is not empty
    if (buffer.length === 0) {
      throw new StatusError(400, 'Audio file is empty');
    }

    // Determine the audio format (default to m4a if not specified)
    const audioFormat = format ?? 'm4a';
    const fileName = `audio.${audioFormat}`;

    // Create FormData for OpenAI API with the correct file format
    const formData = new FormData();
    const blob = new Blob([buffer], { type: `audio/${audioFormat}` });
    formData.append('file', blob, fileName);
    formData.append('model', 'whisper-1');

    // Call OpenAI's transcription API directly
    // This gives us full control over the file format
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
        const errorData = await response.json();
        errorMessage = errorData.error?.message ?? `HTTP ${response.status}`;
      } catch {
        errorMessage = await response.text();
      }
      throw new StatusError(
        response.status,
        `OpenAI API error: ${errorMessage}`
      );
    }

    const result = await response.json();
    return Response.json({ text: result.text });
  } catch (error) {
    if (error instanceof StatusError) {
      throw error;
    }
    console.error('Error transcribing audio:', error);
    const message =
      error instanceof Error ? error.message : 'Failed to transcribe audio';
    throw new StatusError(500, message);
  }
}
