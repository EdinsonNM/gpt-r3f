import { useState, useCallback, useEffect, useRef } from "react";
import { getAction } from "./openai-generator";
import { Canvas } from "@react-three/fiber";
import { voices } from "../utils/text-to-speech";

import VirtualAssistant from "./components/virtual-assistant";
import OpenAITranscription from "./components/openai-transcription";
import { generateAndPlaySpeech, generateSpeech } from "../utils/text-to-speech";

// Usar localStorage para persistir la selección de voz
const getSavedVoice = () => {
  const savedVoice = localStorage.getItem('selectedVoice');
  return savedVoice || voices[0].voice_id;
};

function AssistantAI() {
  // Usar useRef para mantener una referencia estable de la voz seleccionada
  const voiceIdRef = useRef(getSavedVoice());
  const [selectedVoice, setSelectedVoice] = useState(voiceIdRef.current);
  const [action, setAction] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [currentResponse, setCurrentResponse] = useState("");

  // Guardar la voz seleccionada en localStorage cuando cambie
  useEffect(() => {
    console.log("Voice changed to:", selectedVoice);
    localStorage.setItem('selectedVoice', selectedVoice);
    voiceIdRef.current = selectedVoice;
  }, [selectedVoice]);

  const handleTranscript = useCallback(async (transcript) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setAction({});
    
    try {
      // Guardar la transcripción del usuario en el historial
      const newHistory = [...conversationHistory, { role: 'user', content: transcript }];
      setConversationHistory(newHistory);
      
      const action = await getAction(transcript);
      setAction(action);
      
      if (action.message) {
        // Limpiar la respuesta anterior
        setCurrentResponse(action.message);
        
        // Agregar la respuesta al historial
        setConversationHistory(prev => [...prev, { role: 'assistant', content: action.message }]);
        
        // Usar la referencia para asegurar que siempre tenemos el valor más reciente
        const currentVoiceId = voiceIdRef.current;
        console.log("Generating speech with voice:", currentVoiceId);
        const blob = await generateSpeech(action.message, currentVoiceId);
        await generateAndPlaySpeech(blob);
      }
    } catch (error) {
      console.error("Error processing transcript:", error);
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, conversationHistory]);

  const handleVoiceChange = useCallback(async (e) => {
    const newVoiceId = e.target.value;
    console.log("Voice selection changed to:", newVoiceId);
    
    // Actualizar el estado y la referencia
    setSelectedVoice(newVoiceId);
    voiceIdRef.current = newVoiceId;
    
    // Si hay un mensaje actual, regenerar el audio con la nueva voz
    if (currentResponse && !isProcessing) {
      try {
        console.log("Regenerating speech with new voice:", newVoiceId);
        const blob = await generateSpeech(currentResponse, newVoiceId);
        await generateAndPlaySpeech(blob);
      } catch (error) {
        console.error("Error regenerating speech:", error);
      }
    }
  }, [currentResponse, isProcessing]);

  return (
    <main className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 w-screen h-screen">
      <Canvas gl={{ alpha: true }} camera={{ fov: 45, position: [0, 2, 10] }}>
        <ambientLight />
        <directionalLight position={[10, 10, 25]} intensity={1} />
        <directionalLight position={[-10, 10, 25]} intensity={1} />
        <directionalLight position={[-10, 10, -25]} intensity={1} />
        <VirtualAssistant {...action} />
      </Canvas>
      <div className="fixed bottom-0 left-0 w-full pb-28 flex flex-col justify-center items-center">
        <div className="mb-4 pointer-events-auto">
          <select 
            value={selectedVoice}
            onChange={handleVoiceChange}
            className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg"
            disabled={isProcessing}
          >
            {voices.map((voice) => (
              <option key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </option>
            ))}
          </select>
        </div>
        <OpenAITranscription onTranscript={handleTranscript} />
      </div>
    </main>
  );
}

export default AssistantAI;
