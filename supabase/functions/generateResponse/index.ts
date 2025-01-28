// This import is just for type definitions in Deno + Supabase Edge Functions
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// We'll fetch the environment variable for OpenAI
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// A minimal check just in case the secret isn't found
if (!OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY not set.");
}

// Start the server
Deno.serve(async (req) => {
  // 1. Handle preflight (OPTIONS)
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  // 2. Main try/catch
  try {
    // Parse request body
    const { prompt } = await req.json();

    // (Optional) check environment variable
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY not set");
    }

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful AI assistant..." },
          { role: "user", content: prompt }
        ],
        max_tokens: 1000
      })
    });

    // If OpenAI fails
    if (!response.ok) {
      const err = await response.text();
      return new Response(
        JSON.stringify({ error: `OpenAI API Error: ${err}` }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        }
      );
    }

    // Extract AI text
    const result = await response.json();
    const aiResponse = result.choices?.[0]?.message?.content ?? "";

    // Return success with CORS
    return new Response(JSON.stringify({ response: aiResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (error) {
    // Return error with CORS
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }
});