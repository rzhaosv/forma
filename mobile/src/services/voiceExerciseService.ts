/**
 * Voice Exercise Logging Service
 * Records voice → Whisper transcription → GPT-4o extracts exercise data
 */
import { startRecording, stopRecording } from './voiceLogService';
export { startRecording, stopRecording };

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export interface VoiceExerciseResult {
  success: boolean;
  transcript?: string;
  exerciseName?: string;
  category?: 'cardio' | 'strength' | 'flexibility' | 'sports' | 'other';
  durationMinutes?: number;
  intensity?: 'low' | 'moderate' | 'high' | 'very_high';
  caloriesBurned?: number;
  error?: string;
}

const transcribeAudio = async (audioUri: string): Promise<string> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_')) {
    throw new Error('OpenAI API key is not configured.');
  }

  const formData = new FormData();
  // @ts-ignore
  formData.append('file', { uri: audioUri, name: 'exercise_log.m4a', type: 'audio/m4a' });
  formData.append('model', 'whisper-1');

  const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Transcription failed');
  return data.text;
};

const extractExerciseData = async (text: string): Promise<VoiceExerciseResult> => {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_')) {
    throw new Error('OpenAI API key is not configured.');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a fitness coach assistant. Extract exercise information from the user's voice log.

Return ONLY a JSON object with this structure:
{
  "success": true,
  "exerciseName": "Running",
  "category": "cardio",
  "durationMinutes": 30,
  "intensity": "moderate",
  "caloriesBurned": 280
}

Categories: cardio, strength, flexibility, sports, other
Intensity: low, moderate, high, very_high
Estimate calories burned based on a 70kg person.
If the input is not about exercise or is unclear, return { "success": false }.`,
        },
        { role: 'user', content: text },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || 'Analysis failed');
  return JSON.parse(data.choices[0].message.content);
};

export const analyzeVoiceExercise = async (audioUri: string): Promise<VoiceExerciseResult> => {
  try {
    const transcript = await transcribeAudio(audioUri);
    if (!transcript?.trim()) {
      return { success: false, error: 'No speech detected. Please try again.' };
    }
    const result = await extractExerciseData(transcript);
    return { ...result, transcript };
  } catch (error) {
    console.error('Voice exercise analysis failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};
