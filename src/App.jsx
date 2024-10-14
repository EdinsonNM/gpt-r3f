import { Button } from "flowbite-react";
import AssistantAI from "./assistant-ai/assistant-ai";
import GeneratorAi from "./generator-ai/generator-ai";
import { useState } from "react";

function App() {
  const [example, setExample] = useState(0);
  return (
    <main className="w-screen h-screen relative  pointer-events-none">
      {example === 0 && <GeneratorAi />}
      {example === 1 && <AssistantAI />}
      <div className="absolute top-0 left-0 px-4 py-4 pointer-events-auto">
        <Button.Group>
          <Button
            onClick={() => setExample(0)}
            color="gray pointer-events-auto"
          >
            Ejemplo 1
          </Button>
          <Button
            onClick={() => setExample(1)}
            color="gray pointer-events-auto"
          >
            Ejemplo 2
          </Button>
        </Button.Group>
      </div>
    </main>
  );
}

export default App;
