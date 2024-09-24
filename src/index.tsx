import * as React from 'react';
import {IconButton, SettingsPopup, TopUI} from "./core/ui";
import {baseStats, Game, GameDifficulty, GameMode, Stats} from "./core/game";
import "./index.css";
import {useEffect} from "react";
import uiStyles from "./styles/ui.module.css";

export interface Theme {
    primaryColor?: string;
    secondaryColor?: string;
    darkColor?: string;
    mineImage?: string;
    flagImage?: string;
}

export interface Config {

    theme?: Theme;

    logo?: string;
    difficulty?: GameDifficulty;
    mode?: GameMode;
    settingsOpen?: boolean;

}

export interface FullConfig {
    theme?: Theme;
    edited: boolean;

    logo: string;
    difficulty : GameDifficulty;
    mode: GameMode;
    settingsOpen: boolean;

}

const defaultConfig: FullConfig = {
    logo:   "https://www.svgrepo.com/show/496351/math.svg",
    difficulty: "Hard",
    mode: "Daily",
    edited: false,
    settingsOpen: false
}

export const Mathdle = (config: Config) => {

    // Config State
    const [configState, setConfigState] = React.useState<FullConfig>({...defaultConfig, ...config})
    const [stats, setStats] = React.useState<Stats>(baseStats);

    useEffect(() => {
        setConfigState(prevState => ({...prevState, ...config}));
    }, [config]);

    // Save to local storage
    useEffect(() => {
        if(JSON.stringify(configState) === JSON.stringify({...defaultConfig, ...config}))
            return;

        console.log("Saving Config", configState);
        localStorage.setItem("config", JSON.stringify({...configState, edited: true}));
    }, [configState]);

    // Load from local storage
    useEffect(() => {
        const savedConfig = localStorage.getItem("config");
        if (savedConfig) {

            // Load config and default values
            const parsedConfig = JSON.parse(savedConfig);

            // If the loaded mode is daily, set the difficulty to medium
            if(parsedConfig.mode === "Daily")
                parsedConfig.difficulty = "Hard";

            console.log("Loaded Config", parsedConfig);
            setConfigState(prevState => ({...prevState, ...parsedConfig}));
        }
    }, []);


   // Detect mobile
    const [isMobile, setIsMobile] = React.useState<boolean>(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 600);
    }, []);

    // Buttons to change the mode
    const [modeOptions, setModeOptions] = React.useState<IconButton[]>();
    // Update the mode options based on state
    useEffect(() => {
        setModeOptions([
            {icon: "📅", text: "Daily", onClick: () => setConfigState({...configState, mode: "Daily", difficulty: "Hard"})},
            {icon: "👤", text: "Single Player", onClick: () => setConfigState({...configState, mode: "Single Player"})},
            {icon: "👥", text: "Multiplayer", onClick: () => setConfigState({...configState, mode: "Multiplayer"})},
            {icon: "⚙️", text: "", onClick: () => setConfigState((prevState) => {

                    // If the mode is daily, set the mode to single player
                    if(configState.mode === "Daily")
                        setConfigState({...prevState, mode: "Single Player"});

                    return {...prevState, settingsOpen: !prevState.settingsOpen};

                })}])
    }, [configState]);

    const setSettingsActive = (b: boolean) => {
        setConfigState({...configState, settingsOpen: b});
    }

    return(
      <>
          {/* Top UI */}
          {!isMobile && <TopUI logo={configState.logo} difficulty={configState.difficulty}/>}

          {/* Buttons to change the mode */}
          <div style={{display: "flex", justifyContent: "center"}} key={configState.mode}>
          {modeOptions?.map((button, index) => (
                <button
                    key={index}
                    onClick={button.onClick}
                    className={uiStyles.modeButton + " " + (button.text == configState.mode ? uiStyles.selected : "")}
                >
                    {button.icon} {button.text}
                </button>
            ))}
          </div>


          {/* Customisation */}
          {configState.settingsOpen &&
              <SettingsPopup
                  hideFunction={setSettingsActive}
                  config={configState}
                  setConfig={setConfigState}
                  stats={stats}
                  setStats={setStats}
          />}


          {/* Game */}
          <Game
            difficulty={configState.difficulty}
            theme={configState.theme}
            mode={configState.mode}
            stats={stats}
            setStats={setStats}
          />

          <br/>
          <br/>
      </>
  )
};
