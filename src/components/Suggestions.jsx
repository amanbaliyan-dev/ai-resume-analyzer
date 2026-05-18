import { useState } from "react";

import { generateAIResponse } from "../services/openrouter";

import { extractTextFromPDF } from "../services/extractText";

function Suggestions({ resumeFile, setAtsScore }) {

    const [loading, setLoading] = useState(false);

    const [suggestions, setSuggestions] = useState([]);

    const generateSuggestions = async () => {

        if (!resumeFile) {
            alert("Please upload a resume first.");
            return;
        }

        try {

            setLoading(true);

            const extractedText = await extractTextFromPDF(resumeFile);

            const prompt = `
Analyze this resume and provide:

1. ATS score out of 100
2. 4 short resume improvement suggestions

Return response ONLY in this format:

Score: 85

Suggestions:
- suggestion 1
- suggestion 2
- suggestion 3
- suggestion 4

Resume:
${extractedText}
`;

            const response = await generateAIResponse(prompt);

            console.log(response);

            // Extract score
            const scoreMatch = response.match(/Score:\s*(\d+)/i);

            const score = scoreMatch ? scoreMatch[1] : 75;

            setAtsScore(score);

            // Extract suggestions
            const suggestionMatches = response.match(/-\s(.+)/g);

            if (suggestionMatches) {

                const cleanedSuggestions = suggestionMatches.map((item) =>
                    item.replace("- ", "")
                );

                setSuggestions(cleanedSuggestions);
            }

        } catch (error) {

            console.error(error);

        } finally {

            setLoading(false);
        }
    };

    return (
        <section className="pb-20 md:pb-28 flex flex-col items-center">

            <h2 className="text-3xl md:text-5xl font-bold text-center mb-8 md:mb-14">
                AI Suggestions
            </h2>

            <button
                onClick={generateSuggestions}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 px-6 md:px-8 py-3 rounded-xl mb-10 md:mb-12 font-medium transition-all duration-300 w-full md:w-auto"
            >
                {loading ? "Analyzing Resume..." : "Generate AI Suggestions"}
            </button>

            <div className="w-full max-w-3xl flex flex-wrap gap-5 justify-center">

                {suggestions.length > 0 ? (

                    suggestions.map((item, index) => (

                        <div
                            key={index}
                            className="bg-[#0d1324] border border-gray-800 rounded-2xl px-5 py-4 md:px-6 md:py-5 text-base md:text-lg hover:border-purple-500 transition-all duration-300 w-full md:w-auto text-left"
                        >
                            {item}
                        </div>
                    ))

                ) : (

                    <div className="text-gray-500">
                        AI suggestions will appear here...
                    </div>

                )}

            </div>

        </section>
    );
}

export default Suggestions;