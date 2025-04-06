// This file contains the API integration functions that you can customize
// to connect with your backend LLM service
import Groq from "groq-sdk";

type Message = {
  content: string;
  role: "user" | "assistant";
};

export async function sendMessage(
  messages: Message[],
  model: string = "llama-3.3-70b-versatile"
): Promise<string> {
  try {
    const groq = new Groq({
      apiKey: "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",
      dangerouslyAllowBrowser: true,
    });

    const response = await groq.chat.completions.create({
      messages: messages,
      model: model || "llama-3.3-70b-versatile",
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("API error:", error);
    return "Sorry, I encountered an error while processing your request.";
  }
}
