import axios from "axios";

export const generateAIResponse = async (prompt) => {
    try {

        const response = await axios({
            method: "POST",

            url: "https://openrouter.ai/api/v1/chat/completions",

            headers: {
                Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,

                "Content-Type": "application/json",

                "HTTP-Referer": "http://localhost:5173",

                "X-Title": "AI Resume Analyzer",
            },

            data: {
                model: "openai/gpt-3.5-turbo",

                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ],
            },
        });

        return response.data.choices[0].message.content;

    } catch (error) {

        console.error("OpenRouter Error:", error.response?.data || error);

        return "Failed to generate AI response.";
    }
};