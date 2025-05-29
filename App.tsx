
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { GameState, StoryLogEntry, GeminiInitialSceneResponse, GeminiActionResponse, CustomScenarioData, GameMode, CharacterProfile, WorldInfo, StartingAssetsResponse } from './types';
import { getInitialScene, processPlayerAction, generateImage, generateKickoffEventForCustomScenario, generateCharacterProfileFromCustomInput, generateStartingAssets } from './services/GeminiService';
import SceneDisplay from './components/SceneDisplay';
import StoryLogDisplay from './components/StoryLogDisplay';
import InventoryDisplay from './components/InventoryDisplay';
import UserInput from './components/UserInput';
import LoadingIndicator from './components/LoadingIndicator';
import ErrorMessage from './components/ErrorMessage';
import ScenarioSetup from './components/ScenarioSetup';
import CharacterDisplay from './components/CharacterDisplay';
import WorldInfoDisplay from './components/WorldInfoDisplay'; // New Import

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const DEFAULT_GAME_STATE: Omit<GameState, 'storyLog'> = {
  currentLocationName: "Loading...",
  currentSceneDescription: "The mists of creation swirl around you.",
  inventory: [],
  currentImageUrl: null,
  isGameOver: false,
  characterProfile: null,
  characterImageUrl: null,
  worldInfo: null,
  currencyName: "Coins",
  currencyAmount: 0,
};

type ActiveTab = 'log' | 'inventory' | 'character' | 'world'; // Added 'world'

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [gameState, setGameState] = useState<GameState>({
    ...DEFAULT_GAME_STATE,
    storyLog: [{ id: generateId(), type: 'system_info', text: 'Welcome to Gemini Text Adventure!', timestamp: new Date() }],
  });
  const [isLoading, setIsLoading] = useState<boolean>(false); 
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isLoadingImage, setIsLoadingImage] = useState<boolean>(false);
  const [isLoadingCharacter, setIsLoadingCharacter] = useState<boolean>(false);
  const [isLoadingWorldAssets, setIsLoadingWorldAssets] = useState<boolean>(false); // New loading state
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('log');

  const apiKeyStatus = useMemo(() => process.env.API_KEY && process.env.API_KEY !== "MISSING_API_KEY", []);

  const addLogEntry = useCallback((type: StoryLogEntry['type'], text: string) => {
    setGameState(prevState => ({
      ...prevState,
      storyLog: [...prevState.storyLog, { id: generateId(), type, text, timestamp: new Date() }].slice(-100),
    }));
  }, []);

  const resetGameStateForNewAdventure = useCallback((customBaseState?: Partial<Omit<GameState, 'storyLog' | 'characterProfile' | 'characterImageUrl' | 'worldInfo' | 'currencyName' | 'currencyAmount'>>) => {
    setGameState({
      ...DEFAULT_GAME_STATE,
      ...(customBaseState || {}),
      storyLog: [{ id: generateId(), type: 'system_info', text: 'A new adventure is materializing...', timestamp: new Date() }],
      characterProfile: null, 
      characterImageUrl: null,
      worldInfo: null,
      currencyName: "Coins",
      currencyAmount: 0,
    });
  }, []);


  const startNewGame = useCallback(async (customData?: CustomScenarioData) => {
    setGameMode('playing');
    setIsInitializing(true);
    setIsLoadingCharacter(true);
    setIsLoadingWorldAssets(true);
    setError(null);
    
    resetGameStateForNewAdventure(customData ? {
      currentLocationName: customData.locationName,
      currentSceneDescription: customData.sceneDescription,
      inventory: customData.inventory, // Initial inventory from custom setup
    } : {});

    addLogEntry('system_info', customData ? 'Crafting your custom world, character, and starting assets...' : 'Generating a random adventure, hero, and their place in the world...');

    try {
      let initialSceneData: GeminiInitialSceneResponse;
      let generatedCharacterProfile: CharacterProfile;
      let worldDetails: WorldInfo;

      if (customData) {
        addLogEntry('system_info', `Expanding character from bio: "${customData.characterBio.substring(0,50)}..."`);
        generatedCharacterProfile = await generateCharacterProfileFromCustomInput(customData.characterBio);
        // For custom scenarios, world info needs to be generated based on custom scene
        // This is a simplification; a more complex setup might involve AI generating world based on custom scene
        // For now, let's use a generic prompt or parts of the InitialSceneResponse for custom too
        const tempInitialData = await getInitialScene(); // Get a base structure, then overwrite parts
        initialSceneData = {
            ...tempInitialData, // use random character as placeholder, then overwrite
            sceneDescription: customData.sceneDescription,
            locationName: customData.locationName,
            eventMessage: `Your custom adventure in ${customData.locationName} begins...`, // placeholder
            characterProfile: generatedCharacterProfile,
            // worldBackground, currencySystem, currencyName will be from tempInitialData or we can make another call
        };
        worldDetails = {
            background: initialSceneData.worldBackground,
            currencySystem: initialSceneData.currencySystem,
            currencyName: initialSceneData.currencyName,
        };
        
        setGameState(prevState => ({
          ...prevState,
          currentLocationName: customData.locationName,
          currentSceneDescription: customData.sceneDescription,
          // inventory is already set from customData in resetGameStateForNewAdventure
          characterProfile: generatedCharacterProfile,
          worldInfo: worldDetails,
          currencyName: worldDetails.currencyName,
        }));
        addLogEntry('character_update', `Character Created: ${generatedCharacterProfile.name}, ${generatedCharacterProfile.class}`);
        addLogEntry('narration', customData.sceneDescription);
         const kickoff = await generateKickoffEventForCustomScenario(customData, generatedCharacterProfile?.name);
        addLogEntry('event', kickoff.eventMessage);


      } else { 
        initialSceneData = await getInitialScene();
        generatedCharacterProfile = initialSceneData.characterProfile;
        worldDetails = {
            background: initialSceneData.worldBackground,
            currencySystem: initialSceneData.currencySystem,
            currencyName: initialSceneData.currencyName,
        };

        setGameState(prevState => ({
          ...prevState,
          currentLocationName: initialSceneData.locationName,
          currentSceneDescription: initialSceneData.sceneDescription,
          characterProfile: generatedCharacterProfile,
          worldInfo: worldDetails,
          currencyName: worldDetails.currencyName,
        }));
        addLogEntry('character_update', `Character Revealed: ${initialSceneData.characterProfile.name}, ${initialSceneData.characterProfile.class}`);
        addLogEntry('narration', initialSceneData.sceneDescription);
        addLogEntry('event', initialSceneData.eventMessage);
      }
      
      setIsLoadingCharacter(false);

      // Generate Starting Assets
      if (generatedCharacterProfile && worldDetails) {
        addLogEntry('system_info', `Determining starting assets for ${generatedCharacterProfile.name} in this world...`);
        const startingAssets: StartingAssetsResponse = await generateStartingAssets(generatedCharacterProfile, worldDetails);
        
        setGameState(prevState => ({
          ...prevState,
          inventory: [...prevState.inventory, ...startingAssets.initialInventoryItems].filter((item, index, self) => self.indexOf(item) === index), // Add unique items
          currencyAmount: startingAssets.initialCurrencyAmount,
        }));
        startingAssets.initialInventoryItems.forEach(item => addLogEntry('event', `Acquired: ${item}`));
        addLogEntry('currency_update', `Initial wealth: ${startingAssets.initialCurrencyAmount} ${worldDetails.currencyName}.`);
        if(startingAssets.initialAssetsDescription) {
            addLogEntry('asset_update', startingAssets.initialAssetsDescription);
        }
      }
      setIsLoadingWorldAssets(false);


      // Generate Images
      if (generatedCharacterProfile?.appearance) {
        addLogEntry('system_info', `Generating portrait for ${generatedCharacterProfile.name}...`);
        const charImgUrl = await generateImage(generatedCharacterProfile.appearance, 'character');
        setGameState(prevState => ({ ...prevState, characterImageUrl: charImgUrl }));
      }

      if (initialSceneData.sceneDescription) {
        setIsLoadingImage(true);
        const sceneImgUrl = await generateImage(initialSceneData.sceneDescription, 'scene');
        setGameState(prevState => ({ ...prevState, currentImageUrl: sceneImgUrl }));
      }

    } catch (err) {
      console.error("Initialization failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to initialize game. The AI might be busy or an API key issue.";
      setError(errorMessage);
      addLogEntry('error_message', `Initialization failed: ${errorMessage}`);
      setGameMode('setup'); 
    } finally {
      setIsInitializing(false);
      setIsLoadingImage(false);
      setIsLoadingCharacter(false);
      setIsLoadingWorldAssets(false);
    }
  }, [addLogEntry, resetGameStateForNewAdventure]);


  const handlePlayerCommand = async (command: string) => {
    if (gameState.isGameOver || isLoading || isLoadingCharacter || isLoadingWorldAssets) return;

    addLogEntry('player_action', command);
    setIsLoading(true);
    setError(null);

    const storyHistory = gameState.storyLog
      .filter(entry => entry.type === 'event' || entry.type === 'narration')
      .slice(-5)
      .map(entry => entry.text);

    try {
      const actionResponse: GeminiActionResponse = await processPlayerAction(
        gameState.currentLocationName,
        gameState.currentSceneDescription,
        gameState.inventory,
        gameState.characterProfile,
        gameState.currencyAmount,
        gameState.currencyName,
        storyHistory,
        command
      );

      let newInventory = [...gameState.inventory];
      if (actionResponse.itemsFound) {
        newInventory = [...newInventory, ...actionResponse.itemsFound];
        actionResponse.itemsFound.forEach(item => addLogEntry('event', `You found: ${item}`));
      }
      if (actionResponse.itemsLost) {
        newInventory = newInventory.filter(item => !actionResponse.itemsLost?.includes(item));
        actionResponse.itemsLost.forEach(item => addLogEntry('event', `You lost: ${item}`));
      }
      
      let newCurrencyAmount = gameState.currencyAmount;
      if (actionResponse.currencyChange !== undefined) {
        newCurrencyAmount += actionResponse.currencyChange;
        if (newCurrencyAmount < 0) newCurrencyAmount = 0; // Prevent negative currency
        const changeType = actionResponse.currencyChange > 0 ? 'gained' : 'lost';
        addLogEntry('currency_update', `You ${changeType} ${Math.abs(actionResponse.currencyChange)} ${gameState.currencyName}. Current: ${newCurrencyAmount} ${gameState.currencyName}.`);
      }

      const sceneChanged = actionResponse.sceneDescription !== gameState.currentSceneDescription || 
                           (actionResponse.newLocationName && actionResponse.newLocationName !== gameState.currentLocationName);

      setGameState(prevState => ({
        ...prevState,
        currentLocationName: actionResponse.newLocationName || prevState.currentLocationName,
        currentSceneDescription: actionResponse.sceneDescription,
        inventory: newInventory,
        currencyAmount: newCurrencyAmount,
        isGameOver: actionResponse.isGameOver || false,
      }));
      
      if (actionResponse.errorMessage) {
         addLogEntry('error_message', actionResponse.errorMessage);
         if (actionResponse.eventMessage && !actionResponse.eventMessage.toLowerCase().includes("nothing happens") && actionResponse.eventMessage !== actionResponse.errorMessage ) {
            addLogEntry('event', actionResponse.eventMessage);
         }
      } else {
          addLogEntry('narration', actionResponse.sceneDescription);
          addLogEntry('event', actionResponse.eventMessage);
      }

      if (actionResponse.isGameOver && actionResponse.gameOverMessage) {
        addLogEntry('game_over', actionResponse.gameOverMessage);
      }

      if (sceneChanged && !actionResponse.isGameOver && !actionResponse.errorMessage) {
        setIsLoadingImage(true);
        const imageUrl = await generateImage(actionResponse.sceneDescription, 'scene');
        setGameState(prevState => ({ ...prevState, currentImageUrl: imageUrl }));
      }

    } catch (err) {
      console.error("Action processing failed:", err);
      const errorMessage = err instanceof Error ? err.message : "An error occurred while processing your action.";
      setError(errorMessage);
      addLogEntry('error_message', `Action failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setIsLoadingImage(false);
    }
  };

  const handleRestartGame = () => {
    setGameMode('setup'); 
    resetGameStateForNewAdventure();
    setError(null);
  };


  if (gameMode === 'setup') {
    return (
      <ScenarioSetup 
        onStartRandom={startNewGame} 
        onStartCustom={startNewGame}
        isInitializing={isInitializing || isLoading || isLoadingCharacter || isLoadingWorldAssets}
        apiKeyOk={apiKeyStatus}
        error={error}
        clearError={() => setError(null)}
      />
    );
  }
  
  const overallLoading = isInitializing || (isLoadingCharacter && !gameState.characterProfile) || (isLoadingWorldAssets && !gameState.worldInfo);

  return (
    <div className="min-h-full flex flex-col items-center p-2 sm:p-4 md:p-6 w-full">
      <div className="w-full max-w-6xl flex flex-col flex-grow">
        <header className="mb-4 sm:mb-6 text-center shrink-0 animate-fadeIn">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-100 py-2 tracking-tight">
            Gemini Text Adventure
          </h1>
        </header>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {overallLoading ? ( 
          <div className="flex-grow flex justify-center items-center">
             <LoadingIndicator 
                message={
                    isLoadingCharacter && !gameState.characterProfile ? "Forging your hero's destiny..." :
                    isLoadingWorldAssets && !gameState.worldInfo ? "Unveiling the world's secrets..." :
                    "Crafting your adventure..."
                } 
                size="large" />
          </div>
        ) : (
          <main className="flex-grow grid grid-cols-1 md:grid-cols-5 gap-4 animate-fadeInUp">
            <section className="md:col-span-3 bg-neutral-900/70 backdrop-blur-md p-2 sm:p-3 rounded-xl shadow-xl border border-neutral-800/40 h-[50vh] md:h-auto flex flex-col">
              <SceneDisplay
                imageUrl={gameState.currentImageUrl}
                description={gameState.currentSceneDescription}
                locationName={gameState.currentLocationName}
                isLoadingImage={isLoadingImage}
              />
            </section>

            <section className="md:col-span-2 bg-neutral-900/70 backdrop-blur-md p-3 sm:p-4 rounded-xl shadow-xl border border-neutral-800/40 flex flex-col h-[40vh] md:h-auto">
              <div className="flex border-b border-neutral-700/50 mb-3 shrink-0">
                {(['log', 'inventory', 'character', 'world'] as ActiveTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-2.5 sm:px-4 text-xs sm:text-sm font-medium capitalize transition-all duration-150 ease-in-out -mb-px relative
                      ${activeTab === tab 
                        ? 'border-b-[3px] accent-border text-sky-300' 
                        : 'text-neutral-400 hover:text-neutral-100 border-b-[3px] border-transparent hover:bg-neutral-800/50 rounded-t-md'
                      }`}
                    aria-current={activeTab === tab ? 'page' : undefined}
                  >
                    {tab === 'character' ? 'Character Sheet' : tab === 'world' ? 'World Info' : tab}
                  </button>
                ))}
              </div>

              <div className="flex-grow overflow-hidden min-h-0">
                {activeTab === 'log' && <StoryLogDisplay logEntries={gameState.storyLog} />}
                {activeTab === 'inventory' && 
                    <InventoryDisplay 
                        items={gameState.inventory} 
                        currencyName={gameState.currencyName} 
                        currencyAmount={gameState.currencyAmount} 
                    />}
                {activeTab === 'character' && 
                  <CharacterDisplay 
                    characterProfile={gameState.characterProfile} 
                    characterImageUrl={gameState.characterImageUrl}
                    isLoadingCharacter={isLoadingCharacter && !gameState.characterProfile}
                  />}
                {activeTab === 'world' && 
                    <WorldInfoDisplay 
                        worldInfo={gameState.worldInfo}
                        isLoadingWorldInfo={isLoadingWorldAssets && !gameState.worldInfo}
                    />}
              </div>
            </section>
          </main>
        )}
        
        {!overallLoading && (
          <div className="mt-4 shrink-0 animate-fadeInUp">
            {gameState.isGameOver ? (
              <div className="text-center p-4 sm:p-6 bg-neutral-900/70 backdrop-blur-md rounded-lg shadow-xl border border-neutral-800/40">
                <p className="text-xl sm:text-2xl text-yellow-300 mb-4">{gameState.storyLog.find(e => e.type === 'game_over')?.text || "The Adventure Has Concluded."}</p>
                <button
                  onClick={handleRestartGame}
                  className="bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2 focus:ring-offset-black shadow-md hover:shadow-lg"
                >
                  Start New Adventure
                </button>
              </div>
            ) : (
              <div className="bg-neutral-900/60 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-md border border-neutral-800/40">
                 {isLoading && !isLoadingImage && <div className="pb-2 -mt-1"><LoadingIndicator message="AI is pondering..." size="small"/></div>}
                <UserInput onSubmit={handlePlayerCommand} disabled={isLoading || isLoadingImage || isInitializing || isLoadingCharacter || isLoadingWorldAssets} />
              </div>
            )}
          </div>
        )}
         <footer className="mt-auto pt-6 sm:pt-8 text-center text-xs text-neutral-600 shrink-0 animate-fadeIn">
            <p>Powered by Google Gemini & Imagen. API Key: {apiKeyStatus ? 
              <span className="text-green-600">Detected</span> : 
              <span className="text-red-500 font-semibold">MISSING or Invalid</span>}
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;
