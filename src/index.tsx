import * as React from 'react';
import {IconButton, SettingsPopup, TopUI} from "./core/ui";
import {Game, GameDifficulty, GameMode} from "./core/game";
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
}

export interface FullConfig {
    theme?: Theme;

    logo: string;
    difficulty : GameDifficulty;
    mode: GameMode;
}

const defaultConfig: FullConfig = {
    logo:   "https://www.svgrepo.com/show/496351/math.svg",
    difficulty: "Easy",
    mode: "Daily",
}

export const Mathdle = (config: Config) => {

    // Config State
   const [configState, setConfigState] = React.useState<FullConfig>({
        ...defaultConfig,
        ...config
    })

    const [settingsActive, setSettingsActive] = React.useState<boolean>(false);

    useEffect(() => {
        console.log("Config Updated", config);
        setConfigState(prevState => ({...prevState, ...config}));
    }, [config]);

   // Detect mobile
    const [isMobile, setIsMobile] = React.useState<boolean>(false);
    useEffect(() => {
        setIsMobile(window.innerWidth < 600);
    }, []);


    const [modeOptions, setModeOptions] = React.useState<IconButton[]>([
        {icon: "📅", text: "Daily", onClick: () => setConfigState({...configState, mode: "Daily"})},
        {icon: "👤", text: "Single Player", onClick: () => setConfigState({...configState, mode: "Single Player"})},
        {icon: "👥", text: "Multiplayer", onClick: () => setConfigState({...configState, mode: "Multiplayer"})},
        {icon: "⚙️", text: "", onClick: () => setSettingsActive(true)}
    ]);

    return(
      <>
          {/* Top UI */}
          {!isMobile && <TopUI logo={configState.logo} difficulty={configState.difficulty}/>}

          {/* Buttons to change the mode */}
          <div style={{display: "flex", justifyContent: "center"}} key={configState.mode}>
          {modeOptions.map((button, index) => (
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
          {settingsActive &&
              <SettingsPopup
                  hideFunction={setSettingsActive}
                  config={configState}
                  setConfig={setConfigState}
          />}


          {/* Game */}
          <Game
            difficulty={configState.difficulty}
            theme={configState.theme}
            mode={configState.mode}
          />

          <br/>
          <br/>
      </>
  )
};
