import { WebSocket, WebSocketServer } from "ws";
import { GoogleGenAI, Modality } from "@google/genai";
import { AIService } from "../../services/AIService";

export function setupLiveWS(wss: WebSocketServer) {
  wss.on("connection", async (clientWs: WebSocket, req) => {
    const url = req.url || "";
    // Only handle routes ending in /api/live
    if (!url.includes("/api/live")) {
      return;
    }

    console.log("[LiveWS] New client connected for real-time voice.");

    const apiKey = process.env.GEMINI_API_KEY;
    const isMock = !apiKey || apiKey === "MY_GEMINI_API_KEY";

    if (isMock) {
      console.warn("[LiveWS] GEMINI_API_KEY is not configured. Starting mock high-fidelity voice session.");
      
      // Send a handshake text to let client know we are in simulator mode
      clientWs.send(
        JSON.stringify({
          status: "connected",
          mode: "simulator",
          text: "Hello! Since your GEMINI_API_KEY is not set yet, we are running in high-fidelity simulator mode. You can talk to me, and I'll respond using browser text-to-speech fallback!",
        })
      );

      clientWs.on("message", (data) => {
        try {
          const message = JSON.parse(data.toString());
          if (message.audio) {
            // Echo back or respond after a brief interval to simulate thinking
          } else if (message.text) {
            // Echo text responses
            setTimeout(() => {
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ text: `Simulator Response: I received your message "${message.text}". Please configure your GEMINI_API_KEY to connect to the live voice model!` }));
              }
            }, 1000);
          }
        } catch (e) {
          console.error("[LiveWS] Simulator error parsing message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("[LiveWS] Simulator connection closed.");
      });

      return;
    }

    // Initialize Real Gemini Live Session
    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      console.log("[LiveWS] Connecting to Google Gemini Live API...");

      // Establish connection to Gemini Live
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Zephyr" },
            },
          },
          systemInstruction: "You are Orchestrix Voice Agent, a highly professional multi-agent supervisor. Answer the user's queries concisely and with a calm, executive demeanor.",
        },
        callbacks: {
          onmessage: (message: any) => {
            // Handle audio output chunk
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.inlineData?.data) {
                  clientWs.send(
                    JSON.stringify({
                      audio: part.inlineData.data,
                    })
                  );
                }
                if (part.text) {
                  clientWs.send(
                    JSON.stringify({
                      text: part.text,
                    })
                  );
                }
              }
            }

            if (message.serverContent?.interrupted) {
              clientWs.send(
                JSON.stringify({
                  interrupted: true,
                })
              );
            }
          },
          onclose: () => {
            console.log("[LiveWS] Gemini Live API connection closed.");
            clientWs.close();
          },
          onerror: (err: any) => {
            console.error("[LiveWS] Gemini Live API error:", err);
            clientWs.send(JSON.stringify({ error: err.message || "Gemini Live API error" }));
          }
        },
      });

      console.log("[LiveWS] Gemini Live API session successfully connected!");
      clientWs.send(JSON.stringify({ status: "connected", mode: "live" }));

      clientWs.on("message", (data) => {
        try {
          const payload = JSON.parse(data.toString());
          if (payload.audio) {
            // Client sends base64 raw PCM at 16kHz
            session.sendRealtimeInput({
              audio: {
                data: payload.audio,
                mimeType: "audio/pcm;rate=16000",
              },
            });
          } else if (payload.text) {
            session.sendRealtimeInput({
              text: payload.text,
            });
          }
        } catch (e: any) {
          console.error("[LiveWS] Error parsing client message:", e);
        }
      });

      clientWs.on("close", () => {
        console.log("[LiveWS] Client disconnected. Closing Gemini Live session.");
        try {
          session.close();
        } catch (e) {
          // ignore
        }
      });

    } catch (err: any) {
      console.error("[LiveWS] Failed to connect to Gemini Live:", err);
      clientWs.send(JSON.stringify({ error: `Connection failed: ${err.message}` }));
      clientWs.close();
    }
  });
}
