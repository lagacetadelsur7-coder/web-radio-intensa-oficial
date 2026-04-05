import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { nick, content, user_level = "Oyente del Nilo" } = await req.json();

    if (!nick || !content) {
      return NextResponse.json(
        { error: "Nickname and content are required." },
        { status: 400 }
      );
    }

    // Moderate the content via Gemini if API Key is available
    if (process.env.GEMINI_API_KEY) {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        Analiza el siguiente comentario de un chat público de radio.
        Evalúa si es tóxico, incluye insultos fuertes, spam obvio, o discurso de odio.
        Responde ÚNICAMENTE con la palabra "SAFE" si es aceptable, o "REJECT" si es tóxico o inaceptable.
        Comentario: "${content}"
      `;
      
      try {
        const result = await model.generateContent(prompt);
        const text = result.response.text().trim().toUpperCase();
        
        if (text.includes("REJECT")) {
          return NextResponse.json(
            { error: "El mensaje ha sido bloqueado por el Nilo por violar las normas de la comunidad." },
            { status: 403 }
          );
        }
      } catch (err) {
        console.warn("Gemini validation error, proceeding with caution:", err);
      }
    }

    // Insert into Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("chat_messages")
      .insert([
        { nick, content, user_level, status: "approved" }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Mensaje enviado con éxito", data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal Server Error", details: err.message },
      { status: 500 }
    );
  }
}
