import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Random Egyptian names for the bots
const BOT_NAMES = [
  "Ramsés el Grande", "Nefertiti", "Cleopatra VII", "Tutankamón",
  "Horus Vidente", "Anubis Oscuro", "Isis Inmortal", "Set del Desierto",
  "Ojo de Ra", "Escriba Thoth"
];

const BOT_LEVELS = ["Oyente del Nilo", "Voz de la Esfinge", "Oyente del Nilo"];

export async function GET(req: Request) {
  try {
    // 1. Check Auth (Using a secret query param or just leaving it public for testing)
    const { searchParams } = new URL(req.url);
    if (searchParams.get("secret") !== process.env.BOT_SECRET_KEY && process.env.BOT_SECRET_KEY) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API Key missing" }, { status: 500 });
    }

    const supabase = await createClient();

    // 2. Fetch current radio status
    const { data: statusData, error: statusError } = await supabase
      .from("radio_status")
      .select("current_topic")
      .limit(1)
      .single();

    if (statusError || !statusData) {
      return NextResponse.json({ error: "Could not fetch radio status" }, { status: 500 });
    }

    const currentTopic = statusData.current_topic;

    // 3. Generate message with Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      Eres un oyente de una estación de radio temática llamada "Radio Intensa", que tiene un estilo misterioso y egipcio.
      El tema de la transmisión en vivo actualmente es: "${currentTopic}".
      Escribe un comentario o saludo corto y auténtico (1 o 2 oraciones, máximo 50 palabras) sobre este tema para enviar al chat en vivo de la radio. No uses comillas. Haz que suene inmersivo o entusiasmado.
    `;
    
    const result = await model.generateContent(prompt);
    const content = result.response.text().trim().replace(/^['"](.*)['"]$/, '$1'); // clean quotes
    
    // 4. Insert into database
    const nick = BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)];
    const user_level = BOT_LEVELS[Math.floor(Math.random() * BOT_LEVELS.length)];

    const { error } = await supabase
      .from("chat_messages")
      .insert([
        { nick, content, user_level, status: "approved" }
      ])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      message: "Bot message generated successfully",
      bot: nick,
      content
    }, { status: 200 });

  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Internal Server Error", details: errorMessage },
      { status: 500 }
    );
  }
}
