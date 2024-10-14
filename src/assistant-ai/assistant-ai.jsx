import { useState } from "react";
import { getAction } from "./openai-generator";
import { Canvas } from "@react-three/fiber";

import VirtualAssistant from "./components/virtual-assistant";
import SpeechRecognition from "./components/speech-recognition";
import { generateAndPlaySpeech, generateSpeech } from "../utils/text-to-speech";

function AssistantAI() {
  const [action, setAction] = useState({});
  const handleTranscript = (transcript) => {
    setAction({});
    getAction(transcript).then((action) => {
      generateSpeech(action.message).then((blob) => {
        setAction(action);
        generateAndPlaySpeech(blob);
      });
    });
  };

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
        <SpeechRecognition onTranscript={handleTranscript} />
      </div>
    </main>
  );
}
export default AssistantAI;
