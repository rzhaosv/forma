import { Audio } from 'expo-av';
import { FoodRecognitionResult, IdentifiedFood } from './foodRecognitionService';

// Mock result for voice log analysis
const MOCK_VOICE_RESULT: FoodRecognitionResult = {
    success: true,
    foods: [
        {
            name: 'Grilled Chicken Salad',
            confidence: 95,
            serving_size: '1 bowl',
            calories: 450,
            protein_g: 45,
            carbs_g: 12,
            fat_g: 22,
        },
    ],
    total_calories: 450,
    analysis_time_ms: 1500,
};

export const startRecording = async (): Promise<Audio.Recording | null> => {
    try {
        const permission = await Audio.requestPermissionsAsync();
        if (permission.status !== 'granted') return null;

        await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true,
        });

        const { recording } = await Audio.Recording.createAsync(
            Audio.RecordingOptionsPresets.HIGH_QUALITY
        );

        return recording;
    } catch (err) {
        console.error('Failed to start recording', err);
        return null;
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

export const analyzeVoiceLog = async (audioUri: string): Promise<FoodRecognitionResult> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return MOCK_VOICE_RESULT;
};
