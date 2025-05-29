
export interface StoryLogEntry {
  id: string;
  type: 'narration' | 'player_action' | 'event' | 'error_message' | 'game_over' | 'system_info' | 'character_update' | 'asset_update' | 'currency_update';
  text: string;
  timestamp: Date;
}

export interface CharacterProfile {
  name: string;
  age: string; 
  class: string; 
  skills: string[]; 
  background: string; 
  appearance: string; 
  personalityTraits: string[];
}

export interface WorldInfo {
  background: string; // Detailed world setting, lore, atmosphere.
  currencySystem: string; // Description of the primary currency (e.g., "Gold Dragons, heavy and warm to the touch").
  currencyName: string; // The common name of the currency (e.g., "Gold Dragons")
}

// Expected response from Gemini for the initial scene (random scenario)
export interface GeminiInitialSceneResponse {
  sceneDescription: string;
  locationName: string;
  eventMessage: string;
  characterProfile: CharacterProfile;
  worldBackground: string;
  currencySystem: string; 
  currencyName: string; 
}

// Expected response from Gemini for AI-driven starting assets
export interface StartingAssetsResponse {
  initialInventoryItems: string[]; // e.g., ["Worn Cloak", "Cracked Lute"]
  initialCurrencyAmount: number;   // e.g., 15
  initialAssetsDescription: string; // e.g., "You have a small, leaky tent pitched just outside the village walls."
}

// Expected response from Gemini for player actions
export interface GeminiActionResponse {
  sceneDescription: string;
  newLocationName?: string;
  eventMessage: string;
  itemsFound?: string[];
  itemsLost?: string[];
  currencyChange?: number; // Positive for gain, negative for loss
  isGameOver?: boolean;
  gameOverMessage?: string;
  errorMessage?: string;
}

// Internal game state structure
export interface GameState {
  currentLocationName: string;
  currentSceneDescription: string;
  inventory: string[];
  currentImageUrl: string | null;
  isGameOver: boolean;
  storyLog: StoryLogEntry[];
  characterProfile: CharacterProfile | null;
  characterImageUrl: string |null;
  worldInfo: WorldInfo | null;
  currencyName: string; // Extracted or defined name of the currency
  currencyAmount: number;
}

// Data for custom scenario setup
export interface CustomScenarioData {
  sceneDescription: string;
  locationName:string;
  inventory: string[];
  characterBio: string; 
}

export type GameMode = 'setup' | 'playing';
