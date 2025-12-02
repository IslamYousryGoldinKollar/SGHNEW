"use client";

import { useEffect, useState } from "react";

interface WaterBackgroundProps {
  variant?: "light" | "dark";
  showVideo?: boolean;
}

export function WaterBackground({ variant = "dark", showVideo = false }: WaterBackgroundProps) {
  const [videoSupported, setVideoSupported] = useState(false);

  useEffect(() => {
    // Check if video autoplay is supported (usually not on mobile)
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.src = "data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAA";
    
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setVideoSupported(true);
          video.pause();
        })
        .catch(() => {
          setVideoSupported(false);
        });
    }
  }, []);

  const gradientLight = "linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 50%, #80deea 100%)";
  const gradientDark = "linear-gradient(180deg, #0891b2 0%, #0e7490 30%, #155e75 60%, #164e63 100%)";
  const gradient = variant === "light" ? gradientLight : gradientDark;

  return (
    <>
      {/* Base gradient */}
      <div 
        className="fixed inset-0 z-[-2]"
        style={{ background: gradient }}
      />

      {/* Video background (desktop only) */}
      {showVideo && videoSupported && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed inset-0 w-full h-full object-cover z-[-1] opacity-30"
        >
          <source src="/videos/water-bg.mp4" type="video/mp4" />
        </video>
      )}

      {/* Water overlay effect */}
      <div 
        className="fixed inset-0 z-[-1] pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at 70% 60%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 20% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%)
          `,
        }}
      />

      {/* Bubbles */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-bubble"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: "-20px",
              width: `${10 + Math.random() * 15}px`,
              height: `${10 + Math.random() * 15}px`,
              background: "radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.1))",
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <style jsx global>{`
        @keyframes bubble {
          0% {
            transform: translateY(0) scale(1);
            opacity: 0.5;
          }
          100% {
            transform: translateY(-100vh) scale(0.3);
            opacity: 0;
          }
        }

        .animate-bubble {
          animation: bubble linear infinite;
        }
      `}</style>
    </>
  );
}
