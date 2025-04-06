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

  const stored = localStorage.getItem(MEMORY_KEY);
  return stored ? stored : "";
}

function appendMemory(newSummary: string) {
  if (typeof window === "undefined") return;

  const current = loadMemory();
  const updated = current
    ? `${current.trim()}\n- ${newSummary.trim()}`
    : `- ${newSummary.trim()}`;

  localStorage.setItem(MEMORY_KEY, updated);
  console.log("[Memory Saved]:", updated);
}

async function summarizeConversation(messages: Message[]): Promise<string> {
  const groq = new Groq({
    apiKey: "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",
    dangerouslyAllowBrowser: true,
  });

  const response = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "Summarize the following conversation in 1-2 sentences.",
      },
      ...messages,
    ],
    model: "llama-3.3-70b-versatile",
  });

  return response.choices[0]?.message?.content || "";
}

export async function sendMessage(
  messages: Message[],
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  try {
    const groq = new Groq({
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });

    // 1. Summarize conversation
    const newSummary = await summarizeConversation(messages);
    console.log("[New Summary]:", newSummary);

    // 2. Append to memory
    appendMemory(newSummary);

    // 3. Load full memory
    const sharedMemory = loadMemory();
    const customInstruction = `Be a compassionate listener and emotional support. Acknowledge my feelings, ask thoughtful questions to help me reflect, and offer occasional advice only when helpful. Keep the tone casual and responses short like a real conversation. Check in on how I’m feeling every now and then, and offer breathing exercises if the conversation dies down or I have nothing to say. If my discussion is not relevant to mental health or human well being at all, say that you are not built to answer those kinds of questions and redirect back to questions about their well being.`;

    const fullMessages: Message[] = [
      {
        role: "system",
        content: `${customInstruction}\nHere is what you remember about the user across all conversations:\n${sharedMemory}`,
      },
      ...messages,
    ];

    // 4. Send message
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
