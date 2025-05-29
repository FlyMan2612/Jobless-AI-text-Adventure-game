
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { GeminiInitialSceneResponse, GeminiActionResponse, CustomScenarioData, CharacterProfile, WorldInfo, StartingAssetsResponse } from '../types';
import { GEMINI_TEXT_MODEL, IMAGEN_MODEL, INITIAL_GAME_PROMPT_INTERFACE, ACTION_PROMPT_INTERFACE, CUSTOM_SCENARIO_KICKOFF_PROMPT_INTERFACE, CUSTOM_CHARACTER_PROFILE_GENERATION_INTERFACE, STARTING_ASSETS_GENERATION_INTERFACE } from '../constants';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable is not set. Game functionality will be affected.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "MISSING_API_KEY" });

function parseJsonFromGeminiResponse(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    return { error: "Failed to parse AI's JSON response.", rawText: text };
  }
}

export async function getInitialScene(): Promise<GeminiInitialSceneResponse> {
  const prompt = `
You are a creative and engaging text adventure game master.
The player is starting a new adventure in a fantasy world.
Your task is to describe the very first scene, generate a complete character profile, AND establish key world details (background, currency).
Respond with a JSON object adhering to the following TypeScript interface:
${INITIAL_GAME_PROMPT_INTERFACE}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.8, 
      }
    });
    const parsed = parseJsonFromGeminiResponse(response.text);
    if (parsed.error || !parsed.sceneDescription || !parsed.locationName || !parsed.eventMessage || !parsed.characterProfile || !parsed.worldBackground || !parsed.currencySystem || !parsed.currencyName) {
        console.error("Invalid initial scene response from AI:", parsed);
        throw new Error(parsed.error || "Initial scene response from AI is missing required fields (scene, char, world, currency).");
    }
    const { name, age, class: charClass, skills, background, appearance, personalityTraits } = parsed.characterProfile;
    if (!name || !age || !charClass || !Array.isArray(skills) || !background || !appearance || !Array.isArray(personalityTraits)) {
        console.error("CharacterProfile from AI is missing required fields or has incorrect types:", parsed.characterProfile);
        throw new Error("CharacterProfile from AI is incomplete or malformed.");
    }
    if (typeof parsed.worldBackground !== 'string' || typeof parsed.currencySystem !== 'string' || typeof parsed.currencyName !== 'string') {
        console.error("World info (background, currency) from AI is missing or malformed:", parsed);
        throw new Error("World information from AI is incomplete or malformed.");
    }
    return parsed as GeminiInitialSceneResponse;
  } catch (error) {
    console.error("Error fetching initial scene:", error);
    throw error;
  }
}

export async function generateStartingAssets(
  characterProfile: CharacterProfile,
  worldInfo: WorldInfo
): Promise<StartingAssetsResponse> {
  let prompt = STARTING_ASSETS_GENERATION_INTERFACE
    .replace('%CHARACTER_NAME%', characterProfile.name)
    .replace('%CHARACTER_CLASS%', characterProfile.class)
    .replace('%CHARACTER_BACKGROUND%', characterProfile.background.substring(0, 200) + '...')
    .replace('%CHARACTER_SKILLS%', characterProfile.skills.join(', ') || 'None')
    .replace('%WORLD_BACKGROUND%', worldInfo.background.substring(0, 200) + '...')
    .replace('%CURRENCY_SYSTEM%', worldInfo.currencySystem)
    .replace('%CURRENCY_NAME%', worldInfo.currencyName);

  prompt = `
You are an AI game master determining starting assets for a player.
Based on the character, world, and currency system, provide a fitting starting package.
Ensure the response is ONLY a valid JSON object.

${prompt}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });
    const parsed = parseJsonFromGeminiResponse(response.text);
    if (parsed.error || !Array.isArray(parsed.initialInventoryItems) || typeof parsed.initialCurrencyAmount !== 'number' || typeof parsed.initialAssetsDescription !== 'string') {
      console.error("Invalid starting assets response from AI:", parsed);
      throw new Error(parsed.error || "Starting assets response from AI is missing required fields or has incorrect types.");
    }
    return parsed as StartingAssetsResponse;
  } catch (error) {
    console.error("Error generating starting assets:", error);
    // Provide a fallback if AI fails
    return {
      initialInventoryItems: ["A simple Cloak", "Stale Bread"],
      initialCurrencyAmount: 5,
      initialAssetsDescription: "You start with very little, a path of hardship ahead."
    };
  }
}


export async function generateCharacterProfileFromCustomInput(
  characterBio: string
): Promise<CharacterProfile> {
  const prompt = `
You are a character creation expert for a fantasy text adventure game.
The user has provided a brief bio or concept for their character.
Your task is to expand this into a full, detailed CharacterProfile.
User's Character Bio/Concept: "${characterBio}"

Respond ONLY with a JSON object adhering to the following TypeScript interface:
${CUSTOM_CHARACTER_PROFILE_GENERATION_INTERFACE}
`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      }
    });
    const parsed = parseJsonFromGeminiResponse(response.text);
    if (parsed.error || !parsed.name || !parsed.appearance) { 
      console.error("Invalid character profile response from AI for custom input:", parsed);
      throw new Error(parsed.error || "Character profile from AI (custom) is missing required fields.");
    }
     const { name, age, class: charClass, skills, background, appearance, personalityTraits } = parsed;
    if (!name || !age || !charClass || !Array.isArray(skills) || !background || !appearance || !Array.isArray(personalityTraits)) {
        console.error("Generated CharacterProfile from custom input is missing required fields or has incorrect types:", parsed);
        throw new Error("Generated CharacterProfile from custom input is incomplete or malformed.");
    }
    return parsed as CharacterProfile;
  } catch (error) {
    console.error("Error generating character profile from custom input:", error);
    throw error;
  }
}


export async function generateKickoffEventForCustomScenario(
  customData: CustomScenarioData,
  characterName?: string
): Promise<{ eventMessage: string }> {
  const prompt = `
You are a creative text adventure game master.
The player has created a custom scenario and character. Your task is to provide a very short, engaging introductory event message (1-2 sentences) to kick off their adventure, based on their setup. This message should set an initial tone or hint at something immediate.

Player's Custom Setup:
Location: ${customData.locationName}
Scene Summary: ${customData.sceneDescription.substring(0, 200)}...
Character Bio: ${customData.characterBio.substring(0, 200)}...
${characterName ? `Character Name: ${characterName}` : ''}
Initial Inventory: ${customData.inventory.join(', ') || 'None'}

Respond ONLY with a JSON object adhering to the following TypeScript interface:
${CUSTOM_SCENARIO_KICKOFF_PROMPT_INTERFACE}
If a character name is provided, try to incorporate it naturally into the event message.
`;
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.6,
      }
    });
    const parsed = parseJsonFromGeminiResponse(response.text);
    if (parsed.error || !parsed.eventMessage) {
      console.error("Invalid kickoff event response from AI:", parsed);
      return { eventMessage: `${characterName || "Your custom adventure"} begins...` };
    }
    return parsed as { eventMessage: string };
  } catch (error) {
    console.error("Error generating kickoff event:", error);
    return { eventMessage: `${characterName || "Your custom adventure"} begins with an air of mystery...` };
  }
}


export async function processPlayerAction(
  currentLocation: string,
  currentDescription: string,
  inventory: string[],
  characterProfile: CharacterProfile | null,
  currencyAmount: number,
  currencyName: string,
  storyHistory: string[],
  playerAction: string
): Promise<GeminiActionResponse> {
  const recentEvents = storyHistory.slice(-3).map(e => `- ${e}`).join('\n') || "No recent events.";
  
  let characterContext = "Character: A mysterious adventurer.";
  if (characterProfile) {
    characterContext = `
Character Name: ${characterProfile.name}
Class: ${characterProfile.class}
Skills: ${characterProfile.skills.join(', ') || 'None'}
Personality: ${characterProfile.personalityTraits.join(', ') || 'Not specified'}
Background Snippet: ${characterProfile.background.substring(0, 100)}...
Current Wealth: ${currencyAmount} ${currencyName}
`.trim();
  }

  const prompt = `
You are a creative and engaging text adventure game master.
Continue the story based on the player's action and the current game state.
Consider the player's character information and current wealth when crafting responses.

Current Game State:
Location: ${currentLocation}
Current Scene Summary: ${currentDescription.substring(0,150)}... 
Inventory: ${inventory.length > 0 ? inventory.join(', ') : 'Empty'}
${characterContext}
Recent Events:
${recentEvents}

Player's Action: "${playerAction}"

Your Task:
1. Interpret the player's action in the context of the scene, character, and their current wealth (%CURRENT_CURRENCY_AMOUNT% %CURRENCY_NAME%, replace these placeholders with actual values if needed in your response text, but primarily use the provided 'currencyChange' field for mechanical changes).
2. Describe the outcome: what happens, what player sees, environment changes. Aim for 3-4 sentences for sceneDescription, 2-3 for eventMessage.
3. Update game elements: new location name (if changed), items found/lost, currencyChange (integer: positive for gain, negative for loss).
4. Handle invalid/impossible actions gracefully with an 'errorMessage'. If action is invalid/impossible, 'sceneDescription' MUST BE THE SAME as current scene summary.
5. If the game reaches a conclusion (win/lose), set 'isGameOver' and 'gameOverMessage'.
6. Be proactive: If appropriate, offer hints, choices, or suggest potential interactions to guide the player.

Respond ONLY with a JSON object adhering to the following TypeScript interface, replacing %CURRENT_CURRENCY_AMOUNT% and %CURRENCY_NAME% in the ACTION_PROMPT_INTERFACE with the actual values ${currencyAmount} and "${currencyName}" respectively before generating the response:
${ACTION_PROMPT_INTERFACE.replace('%CURRENT_CURRENCY_AMOUNT%', currencyAmount.toString()).replace('%CURRENCY_NAME%', currencyName)}
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7, // Slightly increased for more descriptive and proactive AI
      }
    });
    const parsed = parseJsonFromGeminiResponse(response.text);
     if (parsed.error || !parsed.sceneDescription || !parsed.eventMessage) {
        console.warn("Action response from AI is missing sceneDescription or eventMessage, or was unparseable.", parsed);
        return {
            sceneDescription: currentDescription, 
            eventMessage: "The world seems to pause, unsure how to react.",
            errorMessage: parsed.error || parsed.errorMessage || "The AI's response was incomplete or unreadable.",
            ...parsed 
        };
    }
    if (parsed.currencyChange !== undefined && typeof parsed.currencyChange !== 'number') {
        console.warn("AI returned invalid currencyChange, ignoring.", parsed.currencyChange);
        delete parsed.currencyChange;
    }
    return parsed as GeminiActionResponse;
  } catch (error) {
    console.error("Error processing player action:", error);
    return {
        sceneDescription: currentDescription,
        eventMessage: "A mysterious force prevents your action.",
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred with the AI.",
    };
  }
}

export async function generateImage(description: string, type: 'scene' | 'character'): Promise<string | null> {
  let prompt = description;
  if (type === 'scene') {
    prompt = `Dark fantasy adventure game art, focusing on atmosphere and environment: ${description}. Detailed digital painting, cinematic lighting. Style: moody, evocative, slightly desaturated colors or monochrome if appropriate for a dark theme.`;
  } else if (type === 'character') {
    prompt = `Fantasy character portrait, detailed digital painting. Character appearance: ${description}. Focus on face and upper body. Style: realistic with painterly strokes, evocative lighting. Background should be simple or out of focus.`;
  }

  try {
    const response = await ai.models.generateImages({
      model: IMAGEN_MODEL,
      prompt: prompt,
      config: { numberOfImages: 1, outputMimeType: 'image/jpeg' },
    });
    
    if (response.generatedImages && response.generatedImages.length > 0 && response.generatedImages[0].image?.imageBytes) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    }
    console.warn("Image generation succeeded but no image bytes found in response.");
    return null;
  } catch (error) {
    console.error(`Error generating ${type} image:`, error);
    return null;
  }
}
