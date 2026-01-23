import { Audio } from 'expo-av';
import { FoodRecognitionResult, IdentifiedFood } from './foodRecognitionService';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const startRecording = async (): Promise<Audio.Recording | null> => {
    try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') {
            throw new Error('Microphone permission not granted');
        }

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
        });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        return recording;
    } catch (err) {
        console.error('Failed to start recording', err);
        throw err;
    }
};

export const stopRecording = async (recording: Audio.Recording): Promise<string | null> => {
    try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        return uri;
    } catch (err) {
        console.error('Failed to stop recording', err);
        return null;
    }
};

const transcribeAudio = async (audioUri: string): Promise<string> => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_')) {
        const status = !OPENAI_API_KEY ? 'UNDEFINED' : `STARTS_WITH_${OPENAI_API_KEY.substring(0, 3)}`;
        throw new Error(`OpenAI API Key is missing or invalid (${status}). Check EAS secrets.`);
    }

    const formData = new FormData();
    // @ts-ignore: React Native FormData expects explicit name/type/uri object
    formData.append('file', {
        uri: audioUri,
        name: 'voice_log.m4a',
        type: 'audio/m4a',
    });
    formData.append('model', 'whisper-1');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'multipart/form-data',
        },
        body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Transcription failed');
    }

    return data.text;
};

const extractNutritionFromText = async (text: string): Promise<FoodRecognitionResult> => {
    if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('YOUR_')) {
        throw new Error('OpenAI API Key is missing or invalid. Check EAS secrets.');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: `You are a nutritionist with access to USDA nutrition data. Analyze the user's meal description and extract food items with accurate nutritional info.
                    
                    IMPORTANT GUIDELINES:
                    - Use USDA standard nutrition values for accuracy
                    - For raw chicken breast: use ~23g protein per 100g (6.5g per oz)
                    - For cooked chicken breast: use ~31g protein per 100g (8.8g per oz)
                    - Pay attention to "raw" vs "cooked" in descriptions
                    - Be conservative with estimates - it's better to slightly underestimate than overestimate
                    
                    Return ONLY a JSON object with this structure:
                    {
                        "success": true,
                        "foods": [
                            {
                                "name": "Food Name",
                                "confidence": 90,
                                "serving_size": "e.g. 1 cup or 8 oz",
                                "calories": 0,
                                "protein_g": 0,
                                "carbs_g": 0,
                                "fat_g": 0
                            }
                        ],
                        "total_calories": 0
                    }
                    If the input is not about food or unintelligible, return { "success": false }.`
                },
                { role: 'user', content: text }
            ],
            response_format: { type: 'json_object' }
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.error?.message || 'Analysis failed');
    }

    const result = JSON.parse(data.choices[0].message.content);
    return {
        ...result,
        analysis_time_ms: 0, // Placeholder
    };
};

export const analyzeVoiceLog = async (audioUri: string): Promise<FoodRecognitionResult> => {
    const startTime = Date.now();
    try {
        console.log('Transcribing audio:', audioUri);
        const transcript = await transcribeAudio(audioUri);
        console.log('Transcript:', transcript);

        if (!transcript || transcript.trim().length === 0) {
            return { success: false, foods: [], total_calories: 0, analysis_time_ms: Date.now() - startTime };
        }

        console.log('Analyzing text...');
        const result = await extractNutritionFromText(transcript);

        return {
            ...result,
            analysis_time_ms: Date.now() - startTime,
        };
    } catch (error) {
        console.error('Voice analysis failed:', error);
        return {
            success: false,
            foods: [],
            total_calories: 0,
            analysis_time_ms: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
};
