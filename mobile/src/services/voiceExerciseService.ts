/**
 * Voice Exercise Logging Service
 * Records voice → Whisper transcription → GPT-4o extracts exercise data
 */
import { startRecording, stopRecording } from './voiceLogService';
import { proxyChatCompletion, proxyTranscription } from './aiProxyService';
export { startRecording, stopRecording };


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
    const data = await proxyTranscription(audioUri, 'audio/m4a', 'exercise_log.m4a');
    if (data.error) throw new Error(data.error?.message || 'Transcription failed');
  return data.text;
};

const extractExerciseData = async (text: string): Promise<VoiceExerciseResult> => {
  const data = await proxyChatCompletion({
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
  });

  if (data.error) throw new Error(data.error?.message || 'Analysis failed');
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
