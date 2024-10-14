import OpenAi from "../utils/openai";
import { prompt } from "./prompt.constants";

const openaai = new OpenAi(prompt);
export async function getAction(promptUser) {
  const text = await openaai.getConversation(
    `Crea un modelo 3D de: ${promptUser}`,
    true
  );

  try {
    const parsedResponse = JSON.parse(text);
    return parsedResponse;
  } catch (error) {
    console.error("Error parsing JSON response:", error);
    return null;
  }
}
