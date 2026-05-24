import { NextResponse } from "next/server";
import OpenAI from "openai";

// Inicializa a OpenAI apenas se a chave estiver configurada
const openai = process.env.OPENAI_API_KEY 
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) 
  : null;

export async function POST(req: Request) {
  try {
    const { imageUrl, targetWidth, targetHeight } = await req.json();

    if (!imageUrl) {
      return NextResponse.json({ error: "No image URL provided" }, { status: 400 });
    }

    // Se não tiver chave da OpenAI (modo de desenvolvimento/mock)
    if (!openai) {
      console.log("[Smart Crop] Mocking response since no OPENAI_API_KEY is found.");
      // Simulamos um pequeno delay de IA
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return NextResponse.json({
        cropX: 0,
        cropY: 0,
        scale: 1.0,
        focus: "center (mock)"
      });
    }

    // Chamada real para OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this image. The user wants to crop it into a ${targetWidth}x${targetHeight} polaroid frame. 
              Identify the main subject (e.g. face, person, or main object). 
              Return ONLY a JSON object with the following fields:
              - cropX: recommended X offset (number)
              - cropY: recommended Y offset (number)
              - scale: recommended scale multiplier to fill the target frame perfectly (number, usually >= 1.0)
              Do not return markdown, just the raw JSON.` 
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 300,
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON safely
    try {
      const jsonStr = content?.replace(/```json/g, "").replace(/```/g, "").trim() || "{}";
      const cropData = JSON.parse(jsonStr);
      return NextResponse.json(cropData);
    } catch (e) {
      console.error("Failed to parse OpenAI response", content);
      return NextResponse.json({ error: "Failed to process AI crop" }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Smart Crop Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
