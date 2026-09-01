// AI proxy client
//
// All OpenAI traffic goes through our authenticated Vercel proxy
// (api/openai.js) instead of calling OpenAI directly with a key baked into
// the app bundle. The proxy verifies the caller's Firebase ID token, so
// AI features require a signed-in user (which the app guarantees — every AI
// feature lives behind sign-up).

import * as FileSystem from 'expo-file-system/legacy';
import { auth } from '../config/firebase';

const AI_PROXY_URL =
  process.env.EXPO_PUBLIC_AI_PROXY_URL ?? 'https://tryforma.app/api/openai';

const getIdToken = async (): Promise<string> => {
  // `auth` comes from config/firebase untyped (assigned in a try/catch there)
  const user = (auth as { currentUser?: { getIdToken(): Promise<string> } })?.currentUser;
  if (!user) {
    throw new Error('Sign in required to use AI features');
  }
  return user.getIdToken();
};

const callProxy = async (endpoint: 'chat' | 'transcription', payload: object) => {
  const token = await getIdToken();
  const response = await fetch(AI_PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ endpoint, payload }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`AI request failed (${response.status}): ${body.slice(0, 200)}`);
  }
  return response.json();
};

/**
 * Chat completions through the proxy. `payload` is a standard OpenAI
 * chat.completions request body; the response is OpenAI's JSON verbatim.
 */
export const proxyChatCompletion = async (payload: object): Promise<any> =>
  callProxy('chat', payload);

/**
 * Whisper transcription through the proxy. Reads the local audio file and
 * sends it as base64; returns OpenAI's transcription JSON ({ text }).
 */
export const proxyTranscription = async (
  audioUri: string,
  mimeType: string = 'audio/m4a',
  fileName: string = 'audio.m4a'
): Promise<any> => {
  const audioBase64 = await FileSystem.readAsStringAsync(audioUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  return callProxy('transcription', { audioBase64, mimeType, fileName });
};
