import * as React from 'react';
import styles from '../styles/ui.module.css';
import {useEffect, useRef} from "react";
import {FullConfig} from "../index";
import {GameDifficulty, Stats} from "./game";


interface TopUIProps {
    logo?: string;
    difficulty?: GameDifficulty;
}
export function TopUI(props: TopUIProps) {
    return (
        <>

            {/* Title UI */}
            <div className={styles.titleBar}>
               <p>M</p>
               <img src={props.logo} className={styles.logo} alt="logo"/>
               <p>thdle</p>
                <h6>{props.difficulty}</h6>
            </div>

        </>
    );
}

export type IconButton = {
    icon: string;
    text: string;
    onClick: () => void;
}

interface SliderInputProps {
    title: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
}

export function SliderInput(props: SliderInputProps) {
    const next = () => {

        // Check if the current value is the last in the array
        const currentIndex = props.options.indexOf(props.value);

        if(currentIndex === props.options.length - 1) {
            props.onChange(props.options[0]);
        } else {
            props.onChange(props.options[currentIndex + 1]);
        }
    }

    const prev = () => {

        // Check if the current value is the first in the array
        const currentIndex = props.options.indexOf(props.value);

        if(currentIndex === 0) {
            props.onChange(props.options[props.options.length - 1]);
        } else {
            props.onChange(props.options[currentIndex - 1]);
        }
    }

    return(
        <div className={styles.sliderContainer}>
            <h2>{props.title}</h2>
            <div className={styles.sliderOptions}>
                <button onClick={prev}>&lt;</button>
                <h3>{props.value}</h3>
                <button onClick={next}>&gt;</button>
            </div>
        </div>
    )
}

type SettingsProps = {
    hideFunction: (b: boolean) => void;
    config: FullConfig;
    setConfig: (config: FullConfig) => void;

    stats: Stats;
    setStats: (stats: Stats) => void;

}

export function SettingsPopup(props: SettingsProps) {
    return (
        <div className={styles.settingsPopup}>
            <button className={styles.closeButton} onClick={() => props.hideFunction(false)}>X</button>


            <div className={styles.settingsPopupContent}>
                <h1>Settings</h1>

                {/* Toggles */}

                {/* Selectors */}
                <SliderInput
                    title={"Difficulty"}
                    value={props.config.difficulty}
                    options={["Easy", "Medium", "Hard", "Extreme"]}
                    onChange={(value) => props.setConfig({...props.config, difficulty: (value as GameDifficulty)})}
                />

                {/* Stats */}
                <h2>Stats</h2>
                <p>Highest Streak: {props.stats.highestStreak}</p>



            </div>
        </div>
    );
}