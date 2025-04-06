"use client";
import type React from "react";
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bot,
  Send,
  Settings,
  User,
  X,
  Mic,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage } from "@/components/chat-message";
import { ConversationList } from "@/components/conversation-list";
import { SettingsPanel } from "@/components/settings-panel";
import { cn } from "@/lib/utils";
import { useMobile } from "@/hooks/use-mobile";
import { sendMessage } from "@/lib/api";
import { speechToText, textToSpeech } from "@/lib/openai";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type Conversation = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
};

export function Chat() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: "1",
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    },
  ]);
  const [currentConversationId, setCurrentConversationId] =
    useState<string>("1");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isMobile = useMobile();

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const currentConversation =
    conversations.find((c) => c.id === currentConversationId) ||
    conversations[0];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/wav",
        });
        const audioFile = new File([audioBlob], "audio.wav", {
          type: "audio/wav",
        });

        try {
          setIsLoading(true);
          // Save file and get transcription
          const transcription = await speechToText(audioFile);
          setInputValue(transcription.text);

          // If you want to auto-send the message:
          // await handleSendMessage(transcription.text);
        } catch (error) {
          console.error("Error processing speech:", error);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      // Stop all tracks on the stream
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    }
  };

  // Function to play audio from URL
  const playAudioFromUrl = async (url: string) => {
    if (!audioRef.current) return;

    try {
      // Stop any currently playing audio
      audioRef.current.pause();
      audioRef.current.src = url;
      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing audio:", error);
    }
  };

  const handleSendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || inputValue;
    if (!messageToSend.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageToSend,
      role: "user",
      timestamp: new Date(),
    };

    // Update conversation with user message
    const updatedConversations = conversations.map((conv) => {
      if (conv.id === currentConversationId) {
        return {
          ...conv,
          messages: [...conv.messages, userMessage],
          title:
            conv.messages.length === 0
              ? messageToSend.slice(0, 30)
              : conv.title,
        };
      }
      return conv;
    });

    setConversations(updatedConversations);
    setInputValue("");
    setIsLoading(true);

    try {
      // Prepare messages in the format expected by the API
      const currentConv = updatedConversations.find(
        (conv) => conv.id === currentConversationId
      );
      const apiMessages =
        currentConv?.messages.map((msg) => ({
          content: msg.content,
          role: msg.role,
        })) || [];

      // Call API with all messages for context
      const responseContent = await sendMessage(
        apiMessages,
        "llama-3.3-70b-versatile"
      );

      // Create assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        content: responseContent,
        role: "assistant",
        timestamp: new Date(),
      };

      // Update conversation with assistant response
      const finalConversations = updatedConversations.map((conv) => {
        if (conv.id === currentConversationId) {
          return {
            ...conv,
            messages: [...conv.messages, assistantMessage],
          };
        }
        return conv;
      });

      setConversations(finalConversations);

      // Convert response to speech if audio is enabled
      if (audioEnabled) {
        try {
          const audioUrl = await textToSpeech(responseContent);
          playAudioFromUrl(audioUrl);
        } catch (speechError) {
          console.error("Error generating speech:", speechError);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: "New conversation",
      messages: [],
      createdAt: new Date(),
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newConversation.id);
    setSidebarOpen(false);
  };
 
  const deleteConversation = (id: string) => {
    const updatedConversations = conversations.filter((conv) => conv.id !== id);
    setConversations(updatedConversations);
    if (id === currentConversationId) {
      setCurrentConversationId(updatedConversations[0]?.id || "");
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black/30">
      <div className="bg-black/35 border-white border-r-[1.5px]">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <User className="h-5 w-5" />
      </Button>
      {/* Settings toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-4 z-50"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="h-5 w-5" />
      </Button>
      {/* Sidebar */}
      <AnimatePresence >
        <div className="bg-background/10 ">
        {(sidebarOpen || !isMobile) && (
          <motion.div
            initial={isMobile ? { x: -300 } : false}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className={cn(
              "fixed inset-y-0 left-0 z-40 w-72 bg-background md:relative",
              isMobile ? "shadow-xl" : ""
            )}
          >
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            )}
            <div className="flex h-full flex-col p-4 bg-black">
              <Button className="mb-4" onClick={createNewConversation}>
                New Conversation
              </Button>
              <ConversationList
                conversations={conversations}
                currentId={currentConversationId}
                onSelect={(id) => {
                  setCurrentConversationId(id);
                  if (isMobile) setSidebarOpen(false);
                }}
                onDelete={deleteConversation}
              />
            </div>
          </motion.div>
        )}
        </div>
      </AnimatePresence>
      </div>
      {/* Settings Panel */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setSettingsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-md rounded-lg bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Settings</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSettingsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <SettingsPanel />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden ">
        <main className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-y-auto p-4">
              {currentConversation?.messages.length === 0 ? (
                <div className="flex h-full items-center justify-center text-white">
                  <div className="max-w-md text-center bg-black/55 p-16 rounded-lg">
                    <h2 className="mb-2 text-2xl font-bold">
                      Welcome to Serenity
                    </h2>
                    <p className="text-muted-foreground text-white">
                      Start a conversation with the AI assistant. You can type
                      or use voice commands.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-20 text-white">
                  {currentConversation?.messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))}
                  {isLoading && (
                    <div className="flex items-center space-x-2">
                      <Bot className="h-8 w-8 rounded-full bg-black/10 p-1 text-primary text-black" />
                      <div className="animate-pulse text-muted-foreground">
                        Thinking...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <div className="border-t-[1.5px] bg-black/25 p-4">
              <div className="mx-auto flex max-w-3xl items-end gap-2">
                <Textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                  className="min-h-[60px] resize-none text-white"
                  rows={1}
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  size="icon"
                  className="mx-2 px-7 h-[60px] shrink-0"
                >
                  <Send className="h-5 w-5" />
                </Button>
                <Button
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  variant="outline"
                  size="icon"
                  className="mx-2 px-7 h-[60px] shrink-0"
                >
                  {audioEnabled ? (
                    <Volume2 className="h-5 w-5" />
                  ) : (
                    <VolumeX className="h-5 w-5" />
                  )}
                </Button>
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  size="icon"
                  className={`mx-2 px-7 h-[60px] shrink-0 ${
                    isRecording ? "bg-red-500 hover:bg-red-600" : ""
                  }`}
                >
                  <Mic className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
