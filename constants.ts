
export const GEMINI_TEXT_MODEL = 'gemini-2.5-flash-preview-04-17';
export const IMAGEN_MODEL = 'imagen-3.0-generate-002';

export const INITIAL_GAME_PROMPT_INTERFACE = `
interface CharacterProfile {
  name: string; // A fitting fantasy name.
  age: string;  // Descriptive age (e.g., "Young Adult", "Seasoned Veteran", "Ancient One").
  class: string; // A fantasy RPG class (e.g., "Rogue", "Sorcerer", "Knight Errant", "Beastmaster").
  skills: string[]; // 2-4 relevant skills. Must be a valid JSON array of strings, e.g., ["Stealth", "Lockpicking", "Dagger Proficiency"]. Each skill string must be enclosed in double quotes.
  background: string; // A compelling 2-3 sentence backstory.
  appearance: string; // Detailed physical appearance description (2-3 sentences), suitable for generating a character portrait. Focus on face, hair, notable features, and simple clothing/armor.
  personalityTraits: string[]; // 2-3 key personality traits. Must be a valid JSON array of strings, e.g., ["Brave", "Cynical", "Curious"]. Each trait string must be enclosed in double quotes.
}
interface InitialSceneResponse {
  sceneDescription: string; // A detailed and immersive description of the starting location. Max 3-4 sentences.
  locationName: string;     // A concise name for this starting location (e.g., "Forgotten Crossroads", "Sunken Library Entrance").
  eventMessage: string;       // A brief message to the player to set the scene (e.g., "You awaken with a gasp...", "A mysterious map has led you here..."). Max 1-2 sentences.
  characterProfile: CharacterProfile; // The fully generated character profile.
  worldBackground: string; // A 2-3 sentence overview of the world's current state, prevailing mood, or a key conflict/mystery.
  currencySystem: string;  // A 1-2 sentence description of the primary currency (e.g., "The common currency is Silver Shards, jagged pieces of an ancient relic said to hold faint magical properties.").
  currencyName: string; // The common name of the currency derived from currencySystem (e.g., "Silver Shards"). This must be the noun/name of the currency.
}
Ensure the JSON is valid and only contains these fields. Adhere strictly to the types and structure, especially for arrays of strings.
Example:
{
  "sceneDescription": "The biting wind howls through the jagged peaks of the Spine of the World mountains. You find yourself huddled in a shallow cave, the entrance partially obscured by a recent snowdrift. A faint, rhythmic chanting echoes from deeper within the icy passages.",
  "locationName": "Windscraped Cave",
  "eventMessage": "The cold seeps into your bones, and a sense of unease prickles your skin as the chanting continues.",
  "characterProfile": {
    "name": "Bram Stonebeard",
    "age": "Veteran Dwarf",
    "class": "Mountain Guardian",
    "skills": ["Axe Mastery", "Endurance", "Mountaineering", "Herbalism (Basic)"],
    "background": "Bram was exiled from his clan for a transgression he refuses to speak of. He now wanders the high peaks, seeking a lost relic he believes will restore his honor and allow him to return home.",
    "appearance": "Bram is stout and powerfully built, with a weathered face framed by a long, grey-streaked beard braided with iron rings. He wears thick furs and a patched leather jerkin over a chainmail shirt. His eyes are a piercing ice-blue.",
    "personalityTraits": ["Stoic", "Determined", "Suspicious of Outsiders"]
  },
  "worldBackground": "The land of Aerthos is fractured by warring factions after the Great Sundering. Ancient magic stirs in forgotten places, and monstrous beasts roam the wilds. Trust is a rare commodity.",
  "currencySystem": "Most trade is conducted using 'Sunstones', small, warm pebbles that faintly glow. They are remnants of a fallen celestial body.",
  "currencyName": "Sunstones"
}
`;

export const STARTING_ASSETS_GENERATION_INTERFACE = `
interface StartingAssetsResponse {
  initialInventoryItems: string[]; // 1-3 thematically appropriate starting items. Must be a valid JSON array of strings, e.g., ["Scroll of Minor Healing", "Iron Dagger"]. Each item string must be enclosed in double quotes.
  initialCurrencyAmount: number;   // A small, reasonable starting sum (e.g., 5-50).
  initialAssetsDescription: string; // 1-2 sentences describing any non-item assets, social standing, or starting circumstances (e.g., "You begin your journey with a worn map gifted by your dying mentor." or "Your family connections grant you a single night's stay at any inn in the capital.").
}

You are an AI assistant for a text adventure game.
Based on the provided Character Profile, World Information, and Currency System, determine a suitable starting package for the player.
Be creative and ensure the assets are thematically consistent with the character and the world.
Respond ONLY with a valid JSON object adhering to the StartingAssetsResponse interface. Pay close attention to array formatting.

Character Profile:
Name: %CHARACTER_NAME%
Class: %CHARACTER_CLASS%
Background: %CHARACTER_BACKGROUND%
Skills: %CHARACTER_SKILLS%

World Information:
Background: %WORLD_BACKGROUND%
Currency: %CURRENCY_SYSTEM% (called %CURRENCY_NAME%)

Example Response:
{
  "initialInventoryItems": ["Rusty Shortsword", "Tattered Cloak", "Half-eaten Apple"],
  "initialCurrencyAmount": 12,
  "initialAssetsDescription": "You awaken in a damp alley, the last of your %CURRENCY_NAME% clutched in your hand, with only a vague memory of how you got here."
}
// Ensure the example uses the provided %CURRENCY_NAME%.
`;


export const CUSTOM_CHARACTER_PROFILE_GENERATION_INTERFACE = `
interface CharacterProfile {
  name: string; // A fitting fantasy name, inspired by the user's bio if possible, otherwise generate one.
  age: string;  // Descriptive age, inferred or generated based on bio.
  class: string; // A fantasy RPG class, inferred or generated based on bio.
  skills: string[]; // 2-4 relevant skills, inferred or generated based on bio. Must be a valid JSON array of strings. Each skill string must be enclosed in double quotes.
  background: string; // A compelling 2-3 sentence backstory, expanded from or inspired by the user's bio.
  appearance: string; // Detailed physical appearance (2-3 sentences), based on or inspired by the bio. If bio lacks detail, generate a fitting description. Suitable for image generation.
  personalityTraits: string[]; // 2-3 key personality traits, inferred or generated based on bio. Must be a valid JSON array of strings. Each trait string must be enclosed in double quotes.
}
Your task is to take the user's character bio/concept and expand it into a full CharacterProfile.
If the user provides specific details (like a name or class), try to incorporate them.
If parts are missing, generate them creatively to fit a fantasy adventure theme.
Respond ONLY with a JSON object adhering to the CharacterProfile interface above. Pay close attention to correct JSON array formatting.
`;

export const ACTION_PROMPT_INTERFACE = `
interface ActionResponse {
  sceneDescription: string;    // New detailed scene description. If location unchanged, describe results of action in current scene. Max 3-4 sentences.
  newLocationName?: string;   // Name of the new location, if changed. Otherwise, use current or omit.
  eventMessage: string;      // What happened due to the action (e.g., "You cautiously step into the cave.", "You found a rusty key."). Concise, max 2-3 sentences.
  itemsFound?: string[];      // Array of item names found. Omit if none. Must be a valid JSON array of strings if present. Each item string must be enclosed in double quotes.
  itemsLost?: string[];       // Array of item names lost or used. Omit if none. Must be a valid JSON array of strings if present. Each item string must be enclosed in double quotes.
  currencyChange?: number;    // Integer. Positive if currency gained, negative if lost/spent. Omit if no change.
  errorMessage?: string;      // Message if action is invalid/impossible. Omit if action is valid. If an action is impossible, provide contextual errorMessage.
  isGameOver?: boolean;       // true if game ended. Omit or false otherwise.
  gameOverMessage?: string;   // Message if game is over. Omit if not.
}

Key Instructions for Response Generation:
1.  **Character Context is Crucial:** Strongly consider the player's character (name, class, skills, personality, background) and current wealth (%CURRENT_CURRENCY_AMOUNT% %CURRENCY_NAME%) when determining action outcomes.
    *   If an action's success or failure is directly tied to a character's abilities or limitations (e.g., a character who explicitly CANNOT read attempts to decipher an ancient tome, or a character with "Weak" trait tries to lift something heavy), the 'eventMessage' or 'sceneDescription' MUST clearly and logically explain this connection.
2.  **Invalid/Impossible Actions:** If the player's action is utterly nonsensical ('eat the sun') or impossible given the established scene and character abilities (e.g., 'fly without wings/magic'), provide a polite, contextual 'errorMessage'. In such cases, 'sceneDescription' MUST remain the same as the current scene.
3.  **Dynamic Narrative - Player Guidance & Proactivity:**
    *   **Longer Descriptions:** Aim for more immersive 'sceneDescription' (3-4 sentences) and 'eventMessage' (2-3 sentences).
    *   **Offer Choices/Hints:** When narratively appropriate (especially if the player seems stuck or a natural decision point arises), end your 'sceneDescription' or 'eventMessage' by presenting a clear choice, dilemma, a subtle hint about interactable elements, or a situation that naturally prompts a specific type of interaction from the player. Do NOT do this for every response; use it judiciously.
    *   Examples:
        *   "...The path ahead is dark. You might try to 'light a torch' if you have one, or 'proceed cautiously into the darkness'."
        *   "...The goblin merchant eyes your %CURRENCY_NAME%. 'Something shiny for Grak?' he snarls, pointing at a rusty dagger. Do you 'inquire about the dagger's price', 'offer to trade an item', or 'ignore the goblin'?"
4.  **Currency:** If an action results in finding, earning, spending, or losing currency, use the 'currencyChange' field.
5.  **JSON Format:** Ensure the response is ONLY a valid JSON object adhering to the ActionResponse interface. Pay close attention to correct JSON array formatting.

Ensure the JSON is valid. Be creative but maintain consistency with the character's persona and the established scene.
`;

export const CUSTOM_SCENARIO_KICKOFF_PROMPT_INTERFACE = `
interface KickoffResponse {
  eventMessage: string; // A very short, engaging introductory message (1-2 sentences) to kick off the player's custom adventure, based on their setup (scene, location, character concept). This could be a small event, a thought, or an observation.
}
Ensure the JSON is valid and only contains these fields.
Example:
{
  "eventMessage": "A chill wind whispers through the ancient stones of this place, and %CHARACTER_NAME% feels a sense of anticipation."
}
// Replace %CHARACTER_NAME% with the actual character's name if available/relevant.
`;