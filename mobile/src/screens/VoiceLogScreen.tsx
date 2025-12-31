import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../hooks/useTheme';
import { startRecording, stopRecording, analyzeVoiceLog } from '../services/voiceLogService';

export default function VoiceLogScreen() {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [pulseAnim] = useState(new Animated.Value(1));

    useEffect(() => {
        return () => {
            if (recording) {
                stopRecording(recording);
            }
        };
    }, []);

    useEffect(() => {
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording]);

    const handleToggleRecording = async () => {
        if (isRecording) {
            if (!recording) return;
            setIsRecording(false);
            setIsProcessing(true);

            const uri = await stopRecording(recording);
            setRecording(null);

            if (uri) {
                try {
                    const result = await analyzeVoiceLog(uri);
                    console.log('Voice analysis result:', JSON.stringify(result));

                    if (result && result.success && Array.isArray(result.foods) && result.foods.length > 0) {
                        // Navigate to results with mocked data
                        navigation.navigate('FoodResults' as never, {
                            result: result
                        } as never);
                    } else {
                        Alert.alert('Error', 'Could not understand the meal. Please try again.');
                    }
                } catch (error: any) {
                    console.log('Voice analysis error:', error);
                    Alert.alert('Error', error.message || 'Voice analysis failed');
                } finally {
                    setIsProcessing(false);
                }
            }
        } else {
            try {
                const newRecording = await startRecording();
                setRecording(newRecording);
                setIsRecording(true);
            } catch (err) {
                Alert.alert('Error', 'Could not start recording. Please check permissions.');
            }
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => navigation.goBack()}
                disabled={isProcessing}
            >
                <Ionicons name="close" size={28} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>
                    {isProcessing ? 'Analyzing...' : isRecording ? 'Listening...' : 'Tap to Record'}
                </Text>

                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    {isProcessing
                        ? 'Making sense of your meal...'
                        : isRecording
                            ? 'Describe your meal naturally, e.g., "I had a grilled chicken salad"'
                            : 'Tell us what you ate'}
                </Text>

                <View style={styles.micContainer}>
                    {isProcessing ? (
                        <ActivityIndicator size="large" color={colors.primary} />
                    ) : (
                        <TouchableOpacity onPress={handleToggleRecording}>
                            <Animated.View style={[
                                styles.micButton,
                                { backgroundColor: isRecording ? colors.error : colors.primary },
                                { transform: [{ scale: pulseAnim }] }
                            ]}>
                                <Ionicons
                                    name={isRecording ? "stop" : "mic"}
                                    size={40}
                                    color="white"
                                />
                            </Animated.View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
        padding: 10,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 50,
        maxWidth: '80%',
    },
    micContainer: {
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
});
