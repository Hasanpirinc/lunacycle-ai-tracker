// Fix: Create the full implementation for the geminiService.
import { GoogleGenAI, Modality, Type } from "@google/genai";
import type { UserData, CycleInfo, PregnancyInfo } from '../types';
import * as cache from '../utils/cache';

const CACHE_PREFIX = 'api_cache_';

// Initialize the Google Gemini AI client
// The API key is automatically provided by the environment.
const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

/**
 * Fetches a personalized daily tip for a specific week of pregnancy.
 */
export const getDailyPregnancyTip = async (week: number, language: string): Promise<string> => {
    const cacheKey = `${CACHE_PREFIX}daily_pregnancy_tip_w${week}_${language}`;
    const cachedTip = cache.get<string>(cacheKey);
    if (cachedTip) return cachedTip;

    try {
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

/**
 * Fetches a personalized daily tip based on the user's cycle phase.
 */
export const getDailyCycleTip = async (cycleInfo: CycleInfo, language: string): Promise<string> => {
    const cacheKey = `${CACHE_PREFIX}daily_cycle_tip_d${cycleInfo.currentDay}_${language}`;
    const cachedTip = cache.get<string>(cacheKey);
    if (cachedTip) return cachedTip;

    try {
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

/**
 * Generates a cute, minimalist image representing the baby's size.
 */
export const generateBabySizeImage = async (objectName: string, language: string): Promise<string | null> => {
    const cacheKey = `${CACHE_PREFIX}baby_image_${objectName.replace(/\s+/g, '_')}_${language}`;
    const cachedImage = cache.get<string>(cacheKey);
    if (cachedImage) return cachedImage;

    try {
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
                const base64ImageBytes: string = part.inlineData.data;
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


/**
 * Analyzes the user's day based on cycle info, symptoms, and location.
 */
export const analyzeDay = async (
    userData: UserData, 
    cycleInfo: CycleInfo, 
    symptoms: string[], 
    coords: { latitude: number, longitude: number }, 
    language: string
): Promise<{ analysis: string; sources: { uri: string; title: string }[] }> => {
    const cacheKey = `${CACHE_PREFIX}analysis_cycle_${language}`;
    const cachedAnalysis = cache.get<{ analysis: string; sources: { uri: string; title: string }[] }>(cacheKey);
    if (cachedAnalysis) return cachedAnalysis;

    try {
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

        const result = {
            analysis: response.text,
            sources: sources
        };

        cache.set(cacheKey, result);
        return result;

    } catch (error) {
        console.error("Error analyzing day:", error);
        throw new Error("Failed to generate daily analysis. Please check your connection and try again.");
    }
};

/**
 * Analyzes the user's day based on pregnancy info, symptoms, and location.
 */
export const analyzePregnancyDay = async (
    userData: UserData, 
    pregnancyInfo: PregnancyInfo, 
    symptoms: string[], 
    coords: { latitude: number, longitude: number }, 
    language: string
): Promise<{ analysis: string; sources: { uri: string; title: string }[] }> => {
    const cacheKey = `${CACHE_PREFIX}analysis_pregnancy_${language}`;
    const cachedAnalysis = cache.get<{ analysis: string; sources: { uri: string; title: string }[] }>(cacheKey);
    if (cachedAnalysis) return cachedAnalysis;

    try {
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

        const result = {
            analysis: response.text,
            sources: sources
        };
        cache.set(cacheKey, result);
        return result;
    } catch (error) {
        console.error("Error analyzing pregnancy day:", error);
        throw new Error("Failed to generate daily analysis for pregnancy. Please check your connection and try again.");
    }
};

/**
 * Converts a string of text into speech audio data.
 */
export const generateSpeech = async (text: string): Promise<string | null> => {
    // Speech is not cached as it's a direct user action and should be responsive.
    try {
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

/**
 * Generates personalized resource topics based on cycle phase and symptoms.
 */
export const getPersonalizedResourceTopics = async (phase: string, symptoms: string[], language: string): Promise<string[]> => {
    const cacheKey = `${CACHE_PREFIX}topics_cycle_${phase}_${language}`;
    const cachedTopics = cache.get<string[]>(cacheKey);
    if (cachedTopics) return cachedTopics;

    try {
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
        // Fallback topics
        return ["Understanding Your Cycle", "Nutrition for Hormonal Health", "Exercise and Your Period"];
    }
};

/**
 * Generates personalized resource topics based on pregnancy stage and symptoms.
 */
export const getPersonalizedPregnancyResourceTopics = async (pregnancyInfo: PregnancyInfo, symptoms: string[], language: string): Promise<string[]> => {
    const cacheKey = `${CACHE_PREFIX}topics_pregnancy_w${pregnancyInfo.currentWeek}_${language}`;
    const cachedTopics = cache.get<string[]>(cacheKey);
    if (cachedTopics) return cachedTopics;

    try {
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
        // Fallback topics
        return ["What to Expect in Your Trimester", "Healthy Pregnancy Diet", "Preparing for Your Baby's Arrival"];
    }
};


/**
 * Generates exercise recommendations based on cycle phase and symptoms.
 */
export const getExerciseRecommendations = async (phase: string, symptoms: string[], language: string): Promise<{ name: string; description: string; }[]> => {
    const cacheKey = `${CACHE_PREFIX}exercises_cycle_${phase}_${language}`;
    const cachedExercises = cache.get<{ name: string; description: string; }[]>(cacheKey);
    if (cachedExercises) return cachedExercises;
    
    try {
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

/**
 * Generates exercise recommendations based on pregnancy stage and symptoms.
 */
export const getPregnancyExerciseRecommendations = async (pregnancyInfo: PregnancyInfo, symptoms: string[], language: string): Promise<{ name: string; description: string; }[]> => {
    const cacheKey = `${CACHE_PREFIX}exercises_pregnancy_w${pregnancyInfo.currentWeek}_${language}`;
    const cachedExercises = cache.get<{ name: string; description: string; }[]>(cacheKey);
    if (cachedExercises) return cachedExercises;

    try {
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

/**
 * Fetches the content for a specific resource topic.
 */
export const getResourceContent = async (topic: string, language: string): Promise<string> => {
    const cacheKey = `${CACHE_PREFIX}resource_${topic.replace(/\s+/g, '_')}_${language}`;
    const cachedContent = cache.get<string>(cacheKey);
    if (cachedContent) return cachedContent;
    
    try {
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


/**
 * Gets a personalized response from the Luna chatbot.
 */
export const getChatbotResponse = async (
    question: string,
    userData: UserData,
    context: { cycleInfo?: CycleInfo | null; pregnancyInfo?: PregnancyInfo | null; symptoms: string[] },
    language: string
): Promise<{ text: string; sources: { uri: string; title: string }[] }> => {

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