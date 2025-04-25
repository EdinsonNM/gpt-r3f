import PropTypes from "prop-types";
import { useState, useEffect, useRef } from "react";

function OpenAITranscription({ onTranscript }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const streamRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    initializeAudio();
    return () => cleanup();
  }, []);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
  };

  const initializeAudio = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = audioStream;
      
      const context = new AudioContext();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(audioStream);
      const processor = context.createScriptProcessor(4096, 1, 1);
      
      source.connect(processor);
      processor.connect(context.destination);

      const recorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = async () => {
        if (audioChunksRef.current.length > 0 && !isProcessing) {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          // Limpiar los chunks para la próxima grabación
          audioChunksRef.current = [];
          
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.wav');
          formData.append('model', 'whisper-1');

          try {
            const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
              },
              body: formData,
            });

            const data = await response.json();
            if (data.text && data.text.trim()) {
              const newTranscript = data.text.trim();
              setTranscript(newTranscript);
              
              // Enviar la transcripción al componente padre
              onTranscript(newTranscript);
              
              // Limpiar el transcript después de un tiempo
              setTimeout(() => {
                setTranscript("");
              }, 5000);
            }
          } catch (error) {
            console.error('Transcription error:', error);
          } finally {
            setIsProcessing(false);
          }
        }
      };

      processor.onaudioprocess = (e) => {
        if (isProcessing) return;

        const inputData = e.inputBuffer.getChannelData(0);
        const volume = Math.max(...inputData.map(Math.abs));
        
        if (volume > 0.1) {
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }
          if (recorder.state !== 'recording') {
            // Limpiar los chunks antes de empezar una nueva grabación
            audioChunksRef.current = [];
            recorder.start();
            setListening(true);
          }
        } else if (recorder.state === 'recording') {
          silenceTimerRef.current = setTimeout(() => {
            recorder.stop();
            setListening(false);
          }, 3000);
        }
      };

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setListening(false);
    }
  };

  const startConversation = () => {
    if (!listening && !isProcessing) {
      // Si ya tiene permiso del micrófono, activar escucha
      if (streamRef.current) {
        const recorder = mediaRecorderRef.current;
        audioChunksRef.current = [];
        if (recorder && recorder.state !== 'recording') {
          recorder.start();
          setListening(true);
        }
      } else {
        // Reinicializar el audio si no hay permisos
        initializeAudio();
      }
    }
  };

  const stopConversation = () => {
    if (listening) {
      const recorder = mediaRecorderRef.current;
      if (recorder && recorder.state === 'recording') {
        recorder.stop();
        setListening(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center space-x-2">
        <button
          onClick={startConversation}
          disabled={listening || isProcessing}
          className={`px-4 py-2 rounded-lg text-white font-medium ${
            listening || isProcessing
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 transition-colors"
          }`}
        >
          Iniciar conversación
        </button>
        
        {listening && (
          <button
            onClick={stopConversation}
            className="px-4 py-2 rounded-lg text-white font-medium bg-red-500 hover:bg-red-600 transition-colors"
          >
            Detener
          </button>
        )}
      </div>
      
      <div className={`w-4 h-4 rounded-full ${listening ? 'bg-red-500 animate-pulse' : isProcessing ? 'bg-yellow-500' : 'bg-gray-400'}`} />
      {transcript && (
        <div className="mt-3 text-white bg-black bg-opacity-50 px-4 py-2 rounded-lg max-w-md text-center">
          {transcript}
        </div>
      )}
    </div>
  );
}

OpenAITranscription.propTypes = {
  onTranscript: PropTypes.func,
};

export default OpenAITranscription; 