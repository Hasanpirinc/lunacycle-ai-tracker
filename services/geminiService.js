import { GoogleGenAI, Modality, Type } from "@google/genai";
import * as cache from '../utils/cache.js';

const CACHE_PREFIX = 'api_cache_';

const getClient = () => {
    return new GoogleGenAI({apiKey: process.env.API_KEY});
}

export const getDailyPregnancyTip = async (week, language) => {
    const cacheKey = `${CACHE_PREFIX}daily_pregnancy_tip_w${week}_${language}`;
    const cachedTip = cache.get(cacheKey);
    if (cachedTip) return cachedTip;

    try {
        const ai = getClient();
        const prompt = `Provide a concise, helpful, and reassuring daily tip for someone who is ${week} weeks pregnant. The tip should be actionable and positive. Respond in the ${language} language. Keep the response under 50 words.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        cache.set(cacheKey, response.text);
        return response.text;
    } catch (error) {
        console.error("Error fetching pregnancy tip:", error);
        return "Sorry, I couldn't fetch a tip right now. Please try again later.";
    }
};

export const getDailyCycleTip = async (cycleInfo, language) => {
    const cacheKey = `${CACHE_PREFIX}daily_cycle_tip_d${cycleInfo.currentDay}_${language}`;
    const cachedTip = cache.get(cacheKey);
    if (cachedTip) return cachedTip;

    try {
        const ai = getClient();
        const { currentPhase, isFertile, isPeriod } = cycleInfo;
        const prompt = `Provide a concise, helpful, and reassuring daily tip for someone in their menstrual cycle. They are currently in the ${currentPhase} phase. It is ${isPeriod ? 'their period' : 'not their period'}. It is ${isFertile ? 'their fertile window' : 'not their fertile window'}. The tip should be actionable and positive. Respond in the ${language} language. Keep the response under 50 words.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });

        cache.set(cacheKey, response.text);
        return response.text;
    } catch (error) {
        console.error("Error fetching cycle tip:", error);
        return "Sorry, I couldn't fetch a tip right now. Please try again later.";
    }
};

export const generateBabySizeImage = async (objectName, language) => {
    const cacheKey = `${CACHE_PREFIX}baby_image_${objectName.replace(/\s+/g, '_')}_${language}`;
    const cachedImage = cache.get(cacheKey);
    if (cachedImage) return cachedImage;

    try {
        const ai = getClient();
        const prompt = `Create a cute, minimalist, and visually appealing illustration of a single ${objectName}. The background should be a soft, solid pastel color. The style should be gentle and suitable for a pregnancy app. No text.`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                cache.set(cacheKey, imageUrl);
                return imageUrl;
            }
        }
        return null;
    } catch (error) {
        console.error("Error generating baby size image:", error);
        return null;
    }
};

export const analyzeDay = async (userData, cycleInfo, symptoms, coords, language) => {
    try {
        const ai = getClient();
        const { currentPhase, isFertile, isPeriod } = cycleInfo;
        const symptomList = symptoms.length > 0 ? symptoms.join(', ') : 'no specific symptoms';

        const prompt = `
            As a compassionate women's health AI assistant for the LunaCycle app, provide a personalized daily analysis for a user.
            The user is in their ${currentPhase} phase. It is ${isPeriod ? 'currently their period' : 'not their period'}.
            It is ${isFertile ? 'currently their fertile window' : 'not their fertile window'}.
            They have logged the following symptoms today: ${symptomList}.
            
            Based on this information and their location, provide:
            1.  A brief, positive, and empathetic analysis of their current state.
            2.  Suggest 1-2 relevant, actionable wellness tips (e.g., nutrition, exercise, self-care).
            3.  If relevant to their symptoms or cycle phase, suggest a type of place nearby that could be helpful (e.g., a relaxing park, a healthy restaurant, a pharmacy).
            
            Keep the tone supportive and encouraging. Respond in Markdown format.
            Respond entirely in the ${language} language.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: coords.latitude,
                            longitude: coords.longitude
                        }
                    }
                }
            }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter(chunk => chunk.maps)
            .map(chunk => ({
                uri: chunk.maps.uri,
                title: chunk.maps.title
            }));

        return {
            analysis: response.text,
            sources: sources
        };
    } catch (error) {
        console.error("Error analyzing day:", error);
        throw new Error("Failed to generate daily analysis. Please check your connection and try again.");
    }
};

export const analyzePregnancyDay = async (userData, pregnancyInfo, symptoms, coords, language) => {
    try {
        const ai = getClient();
        const { currentWeek, trimester } = pregnancyInfo;
        const symptomList = symptoms.length > 0 ? symptoms.join(', ') : 'no specific symptoms';

        const prompt = `
            As a compassionate women's health AI assistant for the LunaCycle app, provide a personalized daily analysis for a pregnant user.
            The user is in week ${currentWeek} of their pregnancy, which is in trimester ${trimester}.
            They have logged the following symptoms today: ${symptomList}.
            
            Based on this information and their location, provide:
            1.  A brief, positive, and empathetic analysis of their current state, relating it to their pregnancy week.
            2.  Suggest 1-2 relevant, actionable wellness tips for this stage of pregnancy (e.g., nutrition, gentle exercise, preparation).
            3.  If relevant to their symptoms or pregnancy stage, suggest a type of place nearby that could be helpful (e.g., a store with maternity clothes, a place for prenatal yoga, a healthy cafe).
            
            Keep the tone supportive, reassuring, and encouraging. Respond in Markdown format.
            Respond entirely in the ${language} language.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                    retrievalConfig: {
                        latLng: {
                            latitude: coords.latitude,
                            longitude: coords.longitude
                        }
                    }
                }
            }
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter(chunk => chunk.maps)
            .map(chunk => ({
                uri: chunk.maps.uri,
                title: chunk.maps.title
            }));

        return {
            analysis: response.text,
            sources: sources
        };
    } catch (error) {
        console.error("Error analyzing pregnancy day:", error);
        throw new Error("Failed to generate daily analysis for pregnancy. Please check your connection and try again.");
    }
};

export const generateSpeech = async (text) => {
    try {
        const ai = getClient();
        if (!text) return null;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech:", error);
        return null;
    }
};

export const getPersonalizedResourceTopics = async (phase, symptoms, language) => {
    const cacheKey = `${CACHE_PREFIX}topics_cycle_${phase}_${language}`;
    const cachedTopics = cache.get(cacheKey);
    if (cachedTopics) return cachedTopics;

    try {
        const ai = getClient();
        const symptomList = symptoms.length > 0 ? `The user is experiencing: ${symptoms.join(', ')}.` : 'The user has not logged any specific symptoms.';
        const prompt = `
            Generate a list of 5 relevant and helpful article topics for a user of a cycle tracking app.
            The user is currently in their ${phase} phase. 
            ${symptomList}
            The topics should be concise, engaging, and directly related to the user's current cycle phase and symptoms.
            Examples: "Managing Cramps During Menstruation", "Boosting Energy in the Follicular Phase", "Understanding Luteal Phase Mood Swings".
            Respond in the ${language} language.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A single resource topic'
                            }
                        }
                    },
                    required: ['topics']
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        const topics = result.topics || [];
        cache.set(cacheKey, topics);
        return topics;
    } catch (error) {
        console.error("Error fetching resource topics:", error);
        return ["Understanding Your Cycle", "Nutrition for Hormonal Health", "Exercise and Your Period"];
    }
};

export const getPersonalizedPregnancyResourceTopics = async (pregnancyInfo, symptoms, language) => {
    const cacheKey = `${CACHE_PREFIX}topics_pregnancy_w${pregnancyInfo.currentWeek}_${language}`;
    const cachedTopics = cache.get(cacheKey);
    if (cachedTopics) return cachedTopics;

    try {
        const ai = getClient();
        const { currentWeek, trimester } = pregnancyInfo;
        const symptomList = symptoms.length > 0 ? `The user is experiencing: ${symptoms.join(', ')}.` : 'The user has not logged any specific symptoms.';

        const prompt = `
            Generate a list of 5 relevant and helpful article topics for a pregnant user of a tracking app.
            The user is in week ${currentWeek} of their pregnancy (trimester ${trimester}).
            ${symptomList}
            The topics should be concise, engaging, and directly related to the user's current pregnancy stage and symptoms.
            Examples: "Nutrition in the First Trimester", "Managing Morning Sickness", "Preparing for Labor in Week 36".
            Respond in the ${language} language.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        topics: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                                description: 'A single resource topic'
                            }
                        }
                    },
                    required: ['topics']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        const topics = result.topics || [];
        cache.set(cacheKey, topics);
        return topics;
    } catch (error) {
        console.error("Error fetching pregnancy resource topics:", error);
        return ["What to Expect in Your Trimester", "Healthy Pregnancy Diet", "Preparing for Your Baby's Arrival"];
    }
};

export const getExerciseRecommendations = async (phase, symptoms, language) => {
    const cacheKey = `${CACHE_PREFIX}exercises_cycle_${phase}_${language}`;
    const cachedExercises = cache.get(cacheKey);
    if (cachedExercises) return cachedExercises;
    
    try {
        const ai = getClient();
        const symptomList = symptoms.length > 0 ? `The user is experiencing: ${symptoms.join(', ')}.` : 'The user has not logged any specific symptoms.';
        const prompt = `
            Generate a list of 2-3 safe and relevant exercise recommendations for a user of a cycle tracking app.
            The user is currently in their ${phase} phase. 
            ${symptomList}
            The recommendations should be concise, actionable, and suitable for the given phase and symptoms. For example, for 'Menstruation' with 'cramps', suggest 'Gentle stretching'.
            Respond in the ${language} language.
            Each recommendation should have a name and a brief description of how to do it and its benefits.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: 'The name of the exercise.'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A brief description of the exercise and why it is recommended.'
                                    }
                                },
                                required: ['name', 'description']
                            }
                        }
                    },
                    required: ['exercises']
                }
            }
        });

        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        const exercises = result.exercises || [];
        cache.set(cacheKey, exercises);
        return exercises;
    } catch (error) {
        console.error("Error fetching exercise recommendations:", error);
        return [];
    }
};

export const getPregnancyExerciseRecommendations = async (pregnancyInfo, symptoms, language) => {
    const cacheKey = `${CACHE_PREFIX}exercises_pregnancy_w${pregnancyInfo.currentWeek}_${language}`;
    const cachedExercises = cache.get(cacheKey);
    if (cachedExercises) return cachedExercises;

    try {
        const ai = getClient();
        const { currentWeek, trimester } = pregnancyInfo;
        const symptomList = symptoms.length > 0 ? `The user is experiencing: ${symptoms.join(', ')}.` : 'The user has not logged any specific symptoms.';

        const prompt = `
            Generate a list of 2-3 safe and relevant exercise recommendations for a pregnant user of a tracking app.
            The user is in week ${currentWeek} of their pregnancy (trimester ${trimester}).
            ${symptomList}
            The recommendations must prioritize safety for the given stage of pregnancy. They should be concise and actionable. For example, for 'First Trimester' with 'fatigue', suggest 'Light walking'.
            Respond in the ${language} language.
            Each recommendation should have a name and a brief description of how to do it and its benefits.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        exercises: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: {
                                        type: Type.STRING,
                                        description: 'The name of the exercise.'
                                    },
                                    description: {
                                        type: Type.STRING,
                                        description: 'A brief description of the exercise and why it is recommended.'
                                    }
                                },
                                required: ['name', 'description']
                            }
                        }
                    },
                    required: ['exercises']
                }
            }
        });
        
        const jsonStr = response.text.trim();
        const result = JSON.parse(jsonStr);
        const exercises = result.exercises || [];
        cache.set(cacheKey, exercises);
        return exercises;
    } catch (error) {
        console.error("Error fetching pregnancy exercise recommendations:", error);
        return [];
    }
};

export const getResourceContent = async (topic, language) => {
    const cacheKey = `${CACHE_PREFIX}resource_${topic.replace(/\s+/g, '_')}_${language}`;
    const cachedContent = cache.get(cacheKey);
    if (cachedContent) return cachedContent;
    
    try {
        const ai = getClient();
        const prompt = `
            You are a helpful, knowledgeable, and friendly health writer for a women's health app.
            Write a short, informative article (2-3 paragraphs) on the following topic: "${topic}".
            The content should be easy to understand, medically sound (but for informational purposes, not medical advice), and encouraging.
            Use Markdown for formatting (e.g., headings, bullet points).
            Respond entirely in the ${language} language.
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        cache.set(cacheKey, response.text);
        return response.text;
    } catch (error) {
        console.error(`Error fetching content for topic "${topic}":`, error);
        return "We're sorry, but we couldn't load this article right now. Please try again later.";
    }
};

export const getChatbotResponse = async (question, userData, context, language) => {
    const ai = getClient();
    let contextString = `The user's name is ${userData.name}. `;
    if (userData.isPregnant && context.pregnancyInfo) {
        const { currentWeek, trimester } = context.pregnancyInfo;
        contextString += `She is currently ${currentWeek} weeks pregnant, in her ${trimester} trimester. `;
    } else if (context.cycleInfo) {
        const { currentDay, currentPhase, daysUntilPeriod } = context.cycleInfo;
        contextString += `She is on day ${currentDay} of her cycle, in the ${currentPhase} phase. Her next period is in ${daysUntilPeriod} days. `;
    }

    if (context.symptoms.length > 0) {
        contextString += `Today, she has logged the following symptoms: ${context.symptoms.join(', ')}. `;
    } else {
        contextString += `She has not logged any symptoms today. `;
    }
    
    const systemInstruction = `
        You are Luna, a compassionate, knowledgeable, and friendly AI assistant for the LunaCycle app. 
        Your goal is to provide personalized, supportive, and reliable information about women's health, menstrual cycles, and pregnancy. 
        Always use the user's provided data to tailor your responses. 
        Refer to the user by their name, which is ${userData.name}.
        Use Google Search to find up-to-date and trustworthy information to answer the user's questions. 
        Always provide your answer in a warm, empathetic, and easy-to-understand manner.
        Respond in Markdown format.
        ALWAYS respond in the ${language} language.
    `;
    
    const prompt = `
        Here is the user's current context: ${contextString}
        The user asks the following question: "${question}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{ googleSearch: {} }],
            },
        });

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const sources = groundingChunks
            .filter(chunk => chunk.web)
            .map(chunk => ({
                uri: chunk.web.uri,
                title: chunk.web.title
            }));
        
        return {
            text: response.text,
            sources: sources
        };

    } catch (error) {
        console.error("Error getting chatbot response:", error);
        throw new Error("Sorry, I'm having trouble connecting right now. Please try again in a moment.");
    }
};
