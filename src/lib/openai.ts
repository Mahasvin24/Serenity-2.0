import OpenAI from "openai";
import Groq from "groq-sdk";

// Speech to text function that accepts a file directly
export const speechToText = async (
  audioFile: File
): Promise<{ text: string }> => {
  try {
    // Create form data to send the file
    const formData = new FormData();
    formData.append("file", audioFile);
    formData.append("model", "distil-whisper-large-v3-en");

    // Make the API request
    const response = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${
            process.env.NEXT_PUBLIC_GROQ_API_KEY ||
            "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"
          }`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error(`Speech to text error: ${response.status}`);
    }

    const transcription = await response.json();
    return transcription;
  } catch (error) {
    console.error("Error in speech to text:", error);
    throw error;
  }
};

// Text to speech function that returns a playable audio URL
export const textToSpeech = async (textToSay: string): Promise<string> => {
  try {
    const groq = new Groq({
      apiKey:
        process.env.NEXT_PUBLIC_GROQ_API_KEY ||
        "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",
      dangerouslyAllowBrowser: true,
    });

    const model = "playai-tts";
    const voice = "Celeste-PlayAI";
    const responseFormat = "wav";

    const response = await groq.audio.speech.create({
      model: model,
      voice: voice,
      input: textToSay,
      response_format: responseFormat,
    });

    // Create a blob URL for the audio that can be played directly in the browser
    const blob = new Blob([await response.arrayBuffer()], {
      type: "audio/wav",
    });

    // Create and return a URL that can be used with an audio element
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Error in text to speech:", error);
    throw error;
  }
};
