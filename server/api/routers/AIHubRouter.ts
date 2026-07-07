import { Router, Request, Response } from "express";
import { AIService } from "../../services/AIService";

const router = Router();

router.post("/ai-hub/analyze", async (req: Request, res: Response) => {
  const { prompt, file, modelType, enableThinking } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  // Choose the correct Gemini model name based on selection
  let selectedModel = "gemini-3.5-flash";
  if (modelType === "lite") {
    selectedModel = "gemini-3.1-flash-lite";
  } else if (modelType === "pro" || enableThinking) {
    selectedModel = "gemini-3.1-pro-preview";
  }

  const client = AIService.getGeminiClient();

  if (!client) {
    // High-fidelity Simulator Mode
    console.warn(`[AIHub] Running in simulator mode for model: ${selectedModel}`);
    await new Promise((resolve) => setTimeout(resolve, 1800));

    let simulatedResponse = "";
    if (file) {
      const isVideo = file.mimeType.startsWith("video/");
      const fileTypeLabel = isVideo ? "video clip" : "uploaded image";
      simulatedResponse = `### 🔍 Simulated Multimodal Analysis (${selectedModel.toUpperCase()})\n\n` +
        `I have simulated the analysis of your **${fileTypeLabel}** (${file.mimeType}) using the context and prompt: "${prompt}".\n\n` +
        `**Key Observations:**\n` +
        `1. **Visual Pattern Identified:** The material shows structural credit details and entity financial reports.\n` +
        `2. **Leverage & DSCR Metrics:** Document contents suggest stable operational metrics consistent with covenant definitions.\n` +
        `3. **Verification Verdict:** All audited structures conform to Standard Underwriting Guidelines. No risk breaches were identified.\n\n` +
        `*(Note: To connect to the real Gemini model, please configure your **GEMINI_API_KEY** in the Settings > Secrets menu.)*`;
    } else {
      simulatedResponse = `### 🧠 Simulated Analysis (${selectedModel.toUpperCase()})\n\n` +
        `I simulated an intelligence run for your query: "${prompt}".\n\n` +
        `**Model Synthesis:**\n` +
        `- **Target Model Profile:** ${selectedModel}\n` +
        `- **Thinking Mode Activated:** ${enableThinking ? "HIGH (High Reasoning Depth)" : "Standard"}\n\n` +
        `Based on the parameters, the pipeline has checked all covenant metrics, matching your credit guidelines correctly. The swarm remains in stable standby state.\n\n` +
        `*(Note: To run live queries on real LLM nodes, configure your **GEMINI_API_KEY** in the Secrets tab.)*`;
    }

    return res.json({ text: simulatedResponse, model: selectedModel });
  }

  try {
    console.log(`[AIHub] Invoking real Gemini API with model: ${selectedModel}, Thinking: ${enableThinking}`);

    const parts: any[] = [];
    if (file && file.data && file.mimeType) {
      parts.push({
        inlineData: {
          mimeType: file.mimeType,
          data: file.data, // base64 string
        },
      });
    }
    parts.push({ text: prompt });

    // Set up configuration
    const config: any = {
      temperature: enableThinking ? 0.7 : 0.2,
    };

    // Apply thinking configuration if enabled
    if (enableThinking) {
      config.thinkingConfig = {
        thinkingLevel: "HIGH",
      };
      // For thinkingLevel: HIGH, we must not set maxOutputTokens
    }

    const response = await client.models.generateContent({
      model: selectedModel,
      contents: { parts: parts },
      config: config,
    });

    res.json({
      text: response.text || "No response received from Gemini.",
      model: selectedModel,
    });
  } catch (error: any) {
    console.error("[AIHub] Real Gemini API call failed:", error);
    res.status(500).json({
      error: `Gemini invocation failed: ${error.message || error}`,
    });
  }
});

export const AIHubRouter = router;
