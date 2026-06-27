/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up json parsing with higher limit to accommodate base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Gemini SDK safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined in the environment.");
  }
  return new GoogleGenAI({
    apiKey: apiKey || "",
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
};

const ai = getGeminiClient();

// API endpoint for story generation
app.post("/api/generate-story", async (req, res) => {
  try {
    const { generalPrompt, moments, style, length, title } = req.body;

    if (!moments || !Array.isArray(moments)) {
      return res.status(400).json({ error: "No moments provided" });
    }

    // Prepare prompt
    let textPrompt = `You are a warm, highly creative master storyteller and nostalgic family biographer.
Your task is to create a beautiful, cohesive, and deeply personal family story based on the sequence of uploaded family photographs and their accompanying descriptions.

Here are the specific parameters for the story:
- Narrative Style: ${style || "Heartfelt & Warm"}
- Length: ${length || "Medium"} (Short: ~200 words total, Medium: ~500 words, Long: ~1000 words)
${title ? `- Story Title theme: ${title}` : ""}
- General Narrative Context / Prompt: ${generalPrompt || "Our family memories"}

We have provided ${moments.length} photos. Below are the descriptions written by the family for each photo in sequence:
${moments.map((m, idx) => `Photo ${idx + 1} (Index ${idx}): ${m.description || "A special family moment"}`).join("\n")}

Please carefully analyze the provided images together with their descriptions. Craft a unified story with a clear beginning, middle, and end, seamlessly transitioning from one moment/photo to the next. Make sure your tone is descriptive and matches the selected style.

Return your response in structured JSON matching this schema:
{
  "title": "A captivating, beautiful title for the story",
  "dedication": "A heartfelt, touching subtitle or dedication line (e.g., 'Dedicated to Grandma, who keeps our hearts full and our kitchen warm')",
  "chapters": [
    {
      "title": "Optional Chapter or Scene Title",
      "text": "The rich, narrative paragraph(s) of this chapter. Describe the scene beautifully, reflecting both the visual elements of the photo and its emotional meaning.",
      "momentIndex": 0 // MUST match the 0-based index of the photo this chapter relates to. If it's a bridge/transition paragraph that doesn't relate directly to a specific photo, omit this field or set it to null.
    }
  ],
  "conclusion": "A beautiful, memorable closing thought, reflection, or moral for the story."
}

Ensure the story is fully written and does not contain placeholders. Make sure every momentIndex maps correctly to the photos provided in the sequence.`;

    // Compile parts for Gemini API
    const parts: any[] = [{ text: textPrompt }];

    // Add image parts
    moments.forEach((moment: any, index: number) => {
      if (moment.imageBase64 && moment.mimeType) {
        parts.push({
          inlineData: {
            mimeType: moment.mimeType,
            data: moment.imageBase64
          }
        });
      }
    });

    console.log(`Generating story using gemini-3.5-flash for ${moments.length} moments...`);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            dedication: { type: Type.STRING },
            chapters: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  text: { type: Type.STRING },
                  momentIndex: { type: Type.INTEGER }
                },
                required: ["text"]
              }
            },
            conclusion: { type: Type.STRING }
          },
          required: ["title", "dedication", "chapters", "conclusion"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("No response text received from Gemini");
    }

    const storyData = JSON.parse(resultText.trim());
    return res.json(storyData);

  } catch (error: any) {
    console.error("Error generating story:", error);
    return res.status(500).json({ error: error.message || "Failed to generate story" });
  }
});

// Serve frontend build / dev environment
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
