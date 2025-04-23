"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

// Add type declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: {
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
    length: number; // Add length property
  };
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new(): SpeechRecognition;
}

interface Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

interface VoiceInputProps {
  onTextCaptured: (text: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

export const VoiceInput = ({ 
  onTextCaptured, 
  isListening,
  setIsListening 
}: VoiceInputProps) => {
  const [error, setError] = useState<string | null>(null);

  // Check if browser supports speech recognition
  const SpeechRecognition = 
    typeof window !== "undefined" 
      ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition 
      : null;

  const handleStartListening = useCallback(() => {
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setIsListening(true);
    setError(null);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let finalTranscript = '';

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
          onTextCaptured(finalTranscript);
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`Error occurred in recognition: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (finalTranscript) {
        onTextCaptured(finalTranscript);
      }
    };

    try {
      recognition.start();
    } catch (err) {
      setError("Error starting speech recognition");
      setIsListening(false);
    }

    return () => {
      recognition.stop();
    };
  }, [SpeechRecognition, onTextCaptured, setIsListening]);

  const handleStopListening = useCallback(() => {
    setIsListening(false);
    
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.stop();
    }
  }, [SpeechRecognition, setIsListening]);

  // Pulse animation for the mic button when active
  const pulseVariants = {
    inactive: { 
      scale: 1,
      boxShadow: "0 0 0 rgba(229, 62, 62, 0)" 
    },
    active: {
      scale: [1, 1.05, 1],
      boxShadow: [
        "0 0 0 rgba(229, 62, 62, 0)",
        "0 0 0 10px rgba(229, 62, 62, 0.1)",
        "0 0 0 rgba(229, 62, 62, 0)"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "loop" as const
      }
    }
  };

  return (
    <div>
      <motion.div
        variants={pulseVariants}
        animate={isListening ? "active" : "inactive"}
      >
        <Button
          type="button"
          size="icon"
          variant="outline"
          onClick={isListening ? handleStopListening : handleStartListening}
          className={`rounded-full h-10 w-10 ${isListening ? 'bg-red-50 border-red-500 text-red-500 hover:bg-red-100' : 'hover:bg-gray-100'}`}
          aria-label={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5" />
          )}
        </Button>
      </motion.div>
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};