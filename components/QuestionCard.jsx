"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, Square, Volume2, VolumeX, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  isSubmitting = false,
}) {
  const [answerText, setAnswerText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTextRef = useRef("");

  const maxChars = 4000;
  const charsRemaining = maxChars - answerText.length;
  const isAnswerValid = answerText.trim().length > 0 && charsRemaining >= 0;

  // Check Web Speech API support and cleanup on unmount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      if (streamRef.current) {
        try {
          streamRef.current.getTracks().forEach((t) => t.stop());
        } catch (_) {}
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Stop active speech and audio when question changes
  useEffect(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      try {
        mediaRecorderRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (_) {}
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [question?.id, questionNumber]);

  // Fallback audio recorder for Firefox & non-Chromium browsers using Azure Speech
  const startAzureMediaRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Audio recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType =
        typeof MediaRecorder !== "undefined" &&
        MediaRecorder.isTypeSupported("audio/webm; codecs=opus")
          ? "audio/webm; codecs=opus"
          : typeof MediaRecorder !== "undefined" &&
            MediaRecorder.isTypeSupported("audio/ogg; codecs=opus")
          ? "audio/ogg; codecs=opus"
          : "";

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });

        if (audioBlob.size === 0) return;

        setIsTranscribing(true);
        const toastId = toast.loading("Transcribing your answer via Azure Speech...");

        try {
          const res = await fetch("/api/speech/transcribe", {
            method: "POST",
            headers: {
              "Content-Type": audioBlob.type || "audio/webm",
            },
            body: audioBlob,
          });

          const data = await res.json().catch(() => ({}));
          toast.dismiss(toastId);

          if (!res.ok) {
            if (data.error?.code === "AZURE_SPEECH_NOT_CONFIGURED") {
              toast.error(
                "Azure Speech Key is needed for Firefox. Add AZURE_SPEECH_KEY in .env.local, or open in Microsoft Edge for free built-in speech!",
                { duration: 8000 }
              );
            } else {
              toast.error(data.error?.message || "Failed to transcribe audio via Azure.");
            }
            return;
          }

          if (data.text) {
            setAnswerText((prev) => {
              const prefix = prev ? prev.trim() + " " : "";
              return (prefix + data.text).slice(0, maxChars);
            });
            toast.success("Voice transcribed via Azure Speech!");
          } else {
            toast.info("No speech detected. Please try speaking clearly into your mic.");
          }
        } catch (err) {
          toast.dismiss(toastId);
          console.error("Transcription fetch error:", err);
          toast.error("Failed to connect to Azure Speech endpoint.");
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsListening(true);
      toast.info("Microphone recording. Speak clearly, then click 'Stop Mic' when finished.");
    } catch (err) {
      console.error("Microphone access error in Firefox:", err);
      toast.error("Microphone access was denied. Please allow microphone permissions.");
      setIsListening(false);
    }
  };

  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
        try {
          mediaRecorderRef.current.stop();
        } catch (_) {}
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      typeof window !== "undefined"
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : null;

    // In Chrome / Edge / Safari: Use native real-time Web Speech API
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        startTextRef.current = answerText;

        recognition.onstart = () => {
          setIsListening(true);
          toast.info("Microphone active. Speak your answer clearly.");
        };

        recognition.onresult = (event) => {
          let sessionTranscript = "";
          for (let i = 0; i < event.results.length; i++) {
            sessionTranscript += event.results[i][0].transcript;
          }

          const base = startTextRef.current ? startTextRef.current.trim() + " " : "";
          const combined = (base + sessionTranscript.trim()).slice(0, maxChars);
          setAnswerText(combined);
        };

        recognition.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          if (event.error === "not-allowed") {
            toast.error(
              "Microphone access was denied. Please allow microphone permissions in your browser."
            );
            setIsListening(false);
          } else if (event.error !== "no-speech") {
            toast.error(`Speech recognition: ${event.error}`);
            setIsListening(false);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        toast.error("Could not access microphone.");
        setIsListening(false);
      }
    } else {
      // In Firefox & other browsers: Use HTML5 MediaRecorder + Azure Speech Service
      startAzureMediaRecording();
    }
  };

  const toggleSpeakQuestion = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      toast.error("Text-to-speech is not supported in this browser.");
      return;
    }

    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead =
      question?.questionText ||
      question?.question ||
      question?.question_text ||
      "";
    if (!textToRead) return;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleKeyDown = (e) => {
    // Ctrl + Enter or Cmd + Enter submits
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      if (isAnswerValid && !isSubmitting) {
        e.preventDefault();
        handleSubmit();
      }
    }
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
      setIsListening(false);
    }
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isAnswerValid && !isSubmitting) {
      onSubmitAnswer(answerText);
    }
  };

  return (
    <Card className="bg-[#111936] border-[#232C52] text-slate-100 shadow-lg">
      <CardHeader className="pb-3 border-b border-[#232C52]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="border-[#4F7CFF]/40 bg-[#4F7CFF]/10 text-[#4F7CFF] font-semibold text-xs"
            >
              {question?.topic || "General"}
            </Badge>
            <span className="text-xs font-semibold text-slate-400">
              Category: {question?.category || "Technical"}
            </span>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleSpeakQuestion}
            className={`h-7 px-2.5 text-xs gap-1.5 transition-colors ${
              isSpeaking
                ? "bg-[#4F7CFF]/20 text-[#4F7CFF] border border-[#4F7CFF]/40 animate-pulse"
                : "text-slate-400 hover:text-white hover:bg-[#1E2958]"
            }`}
            title={isSpeaking ? "Stop reading question" : "Listen to question aloud"}
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                Stop Audio
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                Read Aloud
              </>
            )}
          </Button>
        </div>
        <CardTitle className="text-lg sm:text-xl font-bold text-white mt-3 leading-relaxed">
          {question?.questionText ||
            question?.question ||
            question?.question_text ||
            "Loading question..."}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="candidate-answer"
                className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
              >
                Your Response
              </label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={toggleListening}
                disabled={isSubmitting}
                className={`h-7 px-2.5 text-xs gap-1.5 font-medium transition-all ${
                  isListening
                    ? "bg-red-500/20 border-red-500/50 text-red-400 hover:bg-red-500/30 hover:text-red-300 animate-pulse"
                    : "bg-[#161F42] border-[#232C52] text-slate-300 hover:text-white hover:bg-[#1E2958]"
                }`}
                title={
                  isListening
                    ? "Click to stop recording"
                    : "Speak your answer into the microphone"
                }
              >
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    <Square className="w-3 h-3 fill-current" />
                    Stop Dictation
                  </>
                ) : (
                  <>
                    <Mic className="w-3.5 h-3.5 text-[#4F7CFF]" />
                    Voice Dictation
                  </>
                )}
              </Button>
            </div>

            {isListening && (
              <div className="mb-2 px-3.5 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-red-300 text-xs flex items-center justify-between gap-2 shadow-inner">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-medium">
                    Microphone is active. Speak clearly into your mic — your words are being typed live.
                  </span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={toggleListening}
                  className="h-6 px-2 text-xs text-red-300 hover:text-white hover:bg-red-500/20"
                >
                  Stop
                </Button>
              </div>
            )}

            <Textarea
              id="candidate-answer"
              rows={7}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              placeholder="Structure your answer clearly, or click 'Speak Answer (Mic)' below to speak into your microphone... (Ctrl + Enter to submit)"
              className="w-full bg-[#0B1020] border-[#232C52] text-slate-100 placeholder:text-slate-500 rounded-lg focus:border-[#4F7CFF] focus:ring-1 focus:ring-[#4F7CFF] resize-y text-sm leading-relaxed p-4"
              maxLength={maxChars}
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-slate-400">
                Press{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-[#161F42] border border-[#232C52] text-[11px] font-mono text-slate-300">
                  Ctrl+Enter
                </kbd>{" "}
                to submit
              </span>
              <span
                className={
                  charsRemaining < 200 ? "text-amber-400" : "text-slate-400"
                }
              >
                {answerText.length} / {maxChars}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#232C52]/60">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={toggleListening}
                disabled={isSubmitting || isTranscribing}
                className={`font-semibold px-4 py-2 gap-2 text-xs sm:text-sm transition-all shadow-md ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 text-white animate-pulse ring-2 ring-red-400/50"
                    : isTranscribing
                    ? "bg-[#182247] border border-[#4F7CFF]/40 text-slate-300"
                    : "bg-[#182247] hover:bg-[#202C5E] border border-[#4F7CFF]/50 text-slate-100 hover:text-white"
                }`}
                title={
                  isListening
                    ? "Click to stop recording"
                    : isTranscribing
                    ? "Azure Speech is processing audio..."
                    : "Speak your answer using the microphone"
                }
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4F7CFF]" />
                    Transcribing with Azure...
                  </>
                ) : isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                    <Square className="w-3.5 h-3.5 fill-current" />
                    Stop Mic
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#4F7CFF]" />
                    Speak Answer (Mic)
                  </>
                )}
              </Button>

              {isListening && (
                <span className="text-xs text-red-400 font-medium animate-pulse hidden sm:inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Listening...
                </span>
              )}

              {!speechSupported && (
                <span className="text-[11px] text-[#4F7CFF] bg-[#4F7CFF]/10 border border-[#4F7CFF]/30 px-2 py-0.5 rounded hidden sm:inline-flex items-center gap-1 font-medium">
                  Azure Speech Enabled
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={!isAnswerValid || isSubmitting}
              className="bg-[#4F7CFF] hover:bg-[#4F7CFF]/90 text-white font-semibold px-6 gap-2"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? "Evaluating your answer..." : "Submit Answer"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

