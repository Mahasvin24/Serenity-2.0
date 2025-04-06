import Groq from "groq-sdk";

type Message = {
  content: string;
  role: "user" | "assistant";
};

const MEMORY_KEY = "global_chat_memory";

function loadMemory(): string {
  if (typeof window === "undefined") {
    console.warn("localStorage not available (server-side)");
    return "";
  }

  return localStorage.getItem(MEMORY_KEY) || "";
}

function appendMemory(userMessages: Message[]) {
  if (typeof window === "undefined") return;

  const current = loadMemory();
  const newEntries = userMessages
    .filter((m) => m.role === "user" && m.content.toLowerCase().trim() !== "clear memory")  // Exclude 'clear memory' command
    .map((m) => `- ${m.content.trim()}`)
    .join("\n");

  const updated = current ? `${current.trim()}\n${newEntries}` : newEntries;

  localStorage.setItem(MEMORY_KEY, updated);
  console.log("[Memory Saved]:", updated);
}

function clearMemory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MEMORY_KEY);
  console.log("[Memory Cleared]");
}

export async function sendMessage(
  messages: Message[],
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  try {
    const lastUserMsg = messages
      .slice()
      .reverse()
      .find((m) => m.role === "user")?.content.toLowerCase().trim();

    if (lastUserMsg === "clear memory") {
      clearMemory();
      return "Memory has been cleared.";
    }

    // Append user messages to memory, excluding 'clear memory'
    appendMemory(messages);

    const sharedMemory = loadMemory();
    const customInstruction = `Be a compassionate listener and emotional support. Acknowledge my feelings, ask thoughtful questions to help me reflect, and offer occasional advice only when helpful. Keep the tone casual and responses short like a real conversation. Check in on how I’m feeling every now and then, and offer breathing exercises if the conversation dies down or I have nothing to say. If my discussion is not relevant to mental health or human well being at all, say that you are not built to answer those kinds of questions and redirect back to questions about their well being.`;

    const fullMessages: Message[] = [
      {
        role: "system",
        content: `${customInstruction}\n\nHere is what the user has shared previously:\n${sharedMemory}`,
      },
      ...messages,
    ];

    const groq = new Groq({
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });

    const response = await groq.chat.completions.create({
      messages: fullMessages,
      model,
    });

    return response.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("API error:", err);
    return "Sorry, I encountered an error while processing your request.";
  }
}
