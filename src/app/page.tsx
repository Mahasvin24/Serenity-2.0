"use client"

import { useEffect, useRef, useState } from "react";
import { Chat } from "@/components/chat";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [audioEnabled, setAudioEnabled] = useState(false);

  useEffect(() => {
    const handleUserInteraction = () => {
      const video = videoRef.current;
      if (video && !audioEnabled) {
        video.muted = false;
        video.volume = 1;
        video.play().catch((e) => console.error("Playback error:", e));
        setAudioEnabled(true);
      }
      // Remove listener after first interaction
      window.removeEventListener("click", handleUserInteraction);
    };

    window.addEventListener("click", handleUserInteraction);
    return () => {
      window.removeEventListener("click", handleUserInteraction);
    };
  }, [audioEnabled]);

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-[-1]"
      >
        <source src="/movie1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Chat Component */}
      <div className="relative z-10">
        <Chat />
      </div>
    </div>
  );
}
