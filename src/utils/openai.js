import OpenAI from "openai";

const openAi = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

class OpenAi {
  constructor(systemPrompt) {
    this.systemPrompt = systemPrompt;
    this.conversation = [{ role: "system", content: this.systemPrompt }];
  }

  async getConversation(promptUser, hasMemory = false) {
    if (hasMemory) {
      this.conversation.push({ role: "user", content: promptUser });
    } else {
      this.conversation = [{ role: "system", content: this.systemPrompt }];
      this.conversation.push({ role: "user", content: promptUser });
    }
    const completion = await openAi.chat.completions.create({
      model: "gpt-4.1-2025-04-14",
      temperature: 0.2,
      messages: this.conversation,
      //max_tokens: 1000,
    });
    const text = completion.choices[0]?.message?.content?.trim() ?? "";

    return text;
  }
}

export default OpenAi;
