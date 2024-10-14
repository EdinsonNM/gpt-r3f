export function generateSpeech(message) {
  return fetch(
    "https://api.elevenlabs.io/v1/text-to-speech/vqoh9orw2tmOS3mY7D2p",
    {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": import.meta.env.VITE_ELEVEN_API_KEY,
      },
      body: JSON.stringify({
        text: message,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.8,
          style: 0.0,
          use_speaker_boost: true,
        },
      }),
    }
  ).then((response) => response.blob());
}

export async function generateAndPlaySpeech(blob) {
  try {
    const audioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
  } catch (error) {
    console.error("Error:", error);
  }
}
