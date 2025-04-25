export const voices = [
  {name: "Daniela Eleven Labs", voice_id: "ajOR9IDAaubDK5qtLUqQ"},
  {name: "Edinson", voice_id: "UyNeF3M6NUtWcGxKDvG3"},
  {name: "Alvia", voice_id: "g811CobCo5EJJTiktJOs"},
  {name: "Sebas", voice_id: "YClRIXArhwtIuDj7bG7z"},
  {name: "Luz", voice_id: "u4ThkQirbimXl9xY8rLA"},
]

let currentAudioContext = null;
let currentSource = null;

export function generateSpeech(message, voiceId = voices[0].voice_id) {
  console.log("generateSpeech called with voiceId:", voiceId);
  console.log("Available voices:", voices.map(v => `${v.name}: ${v.voice_id}`).join(', '));
  
  // Asegurarnos de que el voiceId es válido
  const validVoiceId = voices.some(v => v.voice_id === voiceId) 
    ? voiceId 
    : voices[0].voice_id;
  
  if (validVoiceId !== voiceId) {
    console.warn(`Voice ID ${voiceId} not found, using default voice: ${validVoiceId}`);
  }
  
  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${validVoiceId}`;
  console.log("Calling Eleven Labs API with URL:", apiUrl);
  
  return fetch(
    apiUrl,
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
  )
  .then((response) => {
    if (!response.ok) {
      console.error("Error from Eleven Labs API:", response.status, response.statusText);
      return response.text().then(text => {
        console.error("Response body:", text);
        throw new Error(`Eleven Labs API error: ${response.status} ${response.statusText}`);
      });
    }
    return response.blob();
  })
  .then(blob => {
    console.log("Successfully generated speech with voice ID:", validVoiceId);
    return blob;
  })
  .catch(error => {
    console.error("Error generating speech:", error);
    throw error;
  });
}

export async function generateAndPlaySpeech(blob) {
  try {
    console.log("generateAndPlaySpeech called with blob size:", blob.size);
    
    // Detener cualquier audio que esté reproduciéndose
    if (currentSource) {
      console.log("Stopping current audio playback");
      currentSource.stop();
      currentSource.disconnect();
    }
    if (currentAudioContext) {
      console.log("Closing current audio context");
      await currentAudioContext.close();
    }

    // Crear nuevo contexto y fuente
    console.log("Creating new audio context");
    currentAudioContext = new AudioContext();
    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await currentAudioContext.decodeAudioData(arrayBuffer);

    console.log("Starting audio playback");
    currentSource = currentAudioContext.createBufferSource();
    currentSource.buffer = audioBuffer;
    currentSource.connect(currentAudioContext.destination);
    currentSource.start();

    // Limpiar cuando termine
    currentSource.onended = () => {
      console.log("Audio playback ended");
      currentSource.disconnect();
      currentAudioContext.close();
      currentSource = null;
      currentAudioContext = null;
    };
  } catch (error) {
    console.error("Error playing speech:", error);
  }
}
