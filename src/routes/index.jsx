import { Routes, Route } from "react-router-dom";
import GeneratorAi from "../generator-ai/generator-ai";
import AssistantAI from "../assistant-ai/assistant-ai";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<GeneratorAi />} />
      <Route path="/generator" element={<GeneratorAi />} />
      <Route path="/assistant" element={<AssistantAI />} />
    </Routes>
  );
}

export default AppRoutes; 