import * as React from 'react';
import styles from '../styles/game.module.css';
import {useEffect, useRef} from "react";
import {Theme} from "../index";

// TODO : Finidh Game
//          - Stats
//          - Custom (no enter press, length, allow multiple guesses)
//          - API
//          - Theme
//          - Modularity



type GameProps = {
    theme?: Theme;
    difficulty: GameDifficulty;
    mode: GameMode;

    stats: Stats;
    setStats: (stats: Stats) => void;
}

export type GameMode = "Daily" | "Single Player" | "Multiplayer";
export type GameDifficulty = "Easy" | "Medium" | "Hard" | "Extreme";


type Guess = {
    guess: number[];
    mark: number[];
}

type Streak = {
    count: number;
    last: Date;
}

type DifficultyStats = {
    easy: number;
    medium: number;
    hard: number;
    extreme: number;
}

export type Stats = {

    highestStreak: number;

    // Total Wins
    totalDa1ilyWins: number;
    totalSinglePlayerWins: DifficultyStats;
    totalMultiplayerWins: DifficultyStats;

    // Total Guesses
    totalDailyGuesses: number;
    totalSinglePlayerGuesses: DifficultyStats;
    totalMultiplayerGuesses: DifficultyStats;

    // Shortest Game
    shortestDailyGame: number;
    shortestSinglePlayerGame: DifficultyStats;
    shortestMultiplayerGame: DifficultyStats;

    // Longest Game
    longestDailyGame: number;
    longestSinglePlayerGame: DifficultyStats;
    longestMultiplayerGame: DifficultyStats;

    // Time Played
    timeDailyPlayed: number;
    timeSinglePlayerPlayed: DifficultyStats;
    timeMultiplayerPlayed: DifficultyStats;

    // Longest Game (Time)
    longestDailyGameTime: number;
    longestSinglePlayerGameTime: DifficultyStats;
    longestMultiplayerGameTime: DifficultyStats;

    // Shortest Game (Time)
    shortestDailyGameTime: number;
    shortestSinglePlayerGameTime: DifficultyStats;
    shortestMultiplayerGameTime: DifficultyStats;

    // Can be calculated from this:
    // - Average guesses
    // - Average time
    // - Win rate

}

export const baseStats: Stats = {
    highestStreak: 0,
    totalDa1ilyWins: 0,
    totalSinglePlayerWins: {easy: 0, medium: 0, hard: 0, extreme: 0},
    totalMultiplayerWins: {easy: 0, medium: 0, hard: 0, extreme: 0},
    totalDailyGuesses: 0,
    totalSinglePlayerGuesses: {easy: 0, medium: 0, hard: 0, extreme: 0},
    totalMultiplayerGuesses: {easy: 0, medium: 0, hard: 0, extreme: 0},
    shortestDailyGame: 0,
    shortestSinglePlayerGame: {easy: 0, medium: 0, hard: 0, extreme: 0},
    shortestMultiplayerGame: {easy: 0, medium: 0, hard: 0, extreme: 0},
    longestDailyGame: 0,
    longestSinglePlayerGame: {easy: 0, medium: 0, hard: 0, extreme: 0},
    longestMultiplayerGame: {easy: 0, medium: 0, hard: 0, extreme: 0},
    timeDailyPlayed: 0,
    timeSinglePlayerPlayed: {easy: 0, medium: 0, hard: 0, extreme: 0},
    timeMultiplayerPlayed: {easy: 0, medium: 0, hard: 0, extreme: 0},
    longestDailyGameTime: 0,
    longestSinglePlayerGameTime: {easy: 0, medium: 0, hard: 0, extreme: 0},
    longestMultiplayerGameTime: {easy: 0, medium: 0, hard: 0, extreme: 0},
    shortestDailyGameTime: 0,
    shortestSinglePlayerGameTime: {easy: 0, medium: 0, hard: 0, extreme: 0},
    shortestMultiplayerGameTime: {easy: 0, medium: 0, hard: 0, extreme: 0},

}

export function Game(props: GameProps) {

    const [currentGuess, setCurrentGuess] = React.useState<number[]>([-1,-2,-2,-2]);
    const [guesses, setGuesses] = React.useState<Guess[]>([]);
    const [answer, setAnswer] = React.useState<number[]>([-1,-1,-1,-1]);

    const [hasWon, setHasWon] = React.useState<boolean>(false);
    const [messageText, setMessageText] = React.useState<string>("");
    const [timer, setTimer] = React.useState<number>(0);

    const [multiplayerSetNumber, setMultiplayerSetNumber] = React.useState<boolean>(false);
    const [multiplayerMarking, setMultiplayerMarking] = React.useState<boolean>(false);
    const [multiplayerMark, setMultiplayerMark] = React.useState<number[]>([-1,0,0,0]);

    const [streak, setStreak] = React.useState<Streak>({count: 0, last: new Date()});

    // Set the theme variables
    useEffect(() => {
        // Colors
        document.documentElement.style.setProperty("--primary-color", props?.theme?.primaryColor ? props.theme.primaryColor : "#b2b2b2");
        document.documentElement.style.setProperty("--secondary-color", props?.theme?.secondaryColor ? props.theme.secondaryColor : "#e5e5e5");
        document.documentElement.style.setProperty("--dark-color", props?.theme?.darkColor ? props.theme.darkColor : "#737373");

    }, [props.theme]);

    // Listener for key presses
    useEffect(() => {

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        }
    }, [props.difficulty, answer, multiplayerSetNumber, guesses, streak]);

    // Scroll
    useEffect(() => {
        const scrollHere = document.getElementById("scrollHere");
        if (scrollHere) scrollHere.scrollIntoView({behavior: "smooth"});
    }, [guesses, currentGuess, hasWon]);

    // Rest the game when the difficulty changes
    useEffect(() => {
        reset();
    }, [props.difficulty, props.mode]);

    // Handle winning
    useEffect(() => {
        if (hasWon) {
            // Create confetti
            createConfetti();

            // Update the stats
            updateStats();

            // Add to the streak
            if (props.mode === "Daily") {
                const oldStreak = {...streak};
                oldStreak.count++;
                oldStreak.last = new Date();
                localStorage.setItem("streak", JSON.stringify(oldStreak));
                setStreak(oldStreak);
            }
        }else{
            const confetti = document.querySelectorAll(`.${styles.confetti}`);
            confetti.forEach(conf => conf.remove());
        }
    }, [hasWon]);

    // Get the streak from local storage
    useEffect(() => {

        // If it is not daily, return
        if (props.mode !== "Daily") return;

        const streak = localStorage.getItem("streak");
        if(!streak) return;

        // Check if the streak is today
        const streakObj = JSON.parse(streak);
        const last = new Date(streakObj.last);
        const now = new Date();

        // If the streak was not yesterday, reset the streak
        if(last.getDate() !== now.getDate() || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
            if (last.getDate() !== now.getDate() - 1 || last.getMonth() !== now.getMonth() || last.getFullYear() !== now.getFullYear()) {
                streakObj.count = 0;
                streakObj.last = now;
                console.log("resetting streak");
                localStorage.setItem("streak", JSON.stringify(streakObj));
            }
        }

        setStreak(streakObj);

    }, []);

    // Get the stats from local storage
    useEffect(() => {

        const stats = localStorage.getItem("stats");
        if(!stats) return;

        props.setStats(JSON.parse(stats));

    }, []);

    // Timer
    useEffect(() => {

        if(hasWon) return;

        const interval = setInterval(() => {
            setTimer(prevState => prevState + 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [timer, hasWon]);

    const handleKeyPress = (e: KeyboardEvent) => {

        // Clear message text
        setMessageText("");

        if(props.mode === "Daily"){
            const now = new Date();
            const last = new Date(streak.last);
            if ((last.getDate() === now.getDate() && last.getMonth() === now.getMonth() && last.getFullYear() === now.getFullYear()) && streak.count > 0) {
                setMessageText("You have already played today, try again tomorrow");
                return
            }
        }

        // Check if the key is enter
        if (e.key === "Enter") {

            setCurrentGuess(prevState => {
                let newGuess = [...prevState];

                // Check if the guess is not full
                if (newGuess.indexOf(-1) !== -1) return newGuess;

                // If multiplayer set the answer
                if (props.mode === "Multiplayer" && !multiplayerSetNumber) {
                    setAnswer(newGuess);
                    setMultiplayerSetNumber(true);
                    setMessageText("Player 2, make your guess");
                    return [-1, -2, -2, -2];
                }

                // Check if the guess is already in the guesses
                if (guesses.find(guess => guess.guess.join("") === newGuess.join(""))) {
                    setMessageText("Guess already made");
                    return newGuess;
                }


                // Check if multiplayer (means they have to mark the guess)
                if (props.mode === "Multiplayer" && multiplayerSetNumber) {
                    setMultiplayerMarking(true);
                    setMessageText("Mark the guess: Digit 1");
                    return newGuess;
                }

                let newMark = markGuess(newGuess);

                const guess: Guess = {guess: newGuess, mark: newMark};

                // Add the guess to the guesses array
                setGuesses(prevState => [...prevState, guess]);

                // Check if won
                if (newMark.every(value => value === 1)) {
                    setHasWon(true);
                }

                // Reset the guess
                return [-1, -2, -2, -2];
            })


        }

        // Check if the key is backspaced
        if (e.key === "Backspace") {

            setCurrentGuess(prevState => {

                // Check if the guess is empty
                if (prevState.indexOf(-1) === 0) return prevState;

                let newGuess = [...prevState];
                let index = newGuess.indexOf(-1);

                if(index === -1){
                    newGuess[3] = -1;
                }else{
                    // Remove the number
                    newGuess[index - 1] = -1;
                    newGuess[index] = -2;
                }

                return newGuess;
            });
            return;
        }


        // If it is not a number key, return
        if (isNaN(parseInt(e.key))) return;

        // Set the current guess next number, after that add a -1 after and fill the rest with -2
        setCurrentGuess(prevState => {

            let newGuess = [...prevState];

            // Check if the guess is full
            let index = newGuess.indexOf(-1);
            if (index === -1){
                setMessageText("Press Enter to submit");
                return newGuess;
            }

            // If easy or hard no double digits so check if the guess already has the number
            if (props.difficulty === "Easy" || props.difficulty === "Hard") {
                if (newGuess.indexOf(parseInt(e.key)) !== -1){
                    setMessageText("Number already used");
                    return newGuess;
                }
            }

            // Set the number
            newGuess[index] = parseInt(e.key);

            // Dont add cursor if it is the last number
            if (index === 3){
                setMessageText("Press Enter to submit");
                return newGuess;
            }

            // Add a cursor after the number
            newGuess[index + 1] = -1;
            return newGuess;
        });

    }

    const markGuess = (guess: number[]) => {
        // 1 = right number, right place
        // 2 = right number, wrong place
        // 3 = wrong number
        let mark: number[] = [];
        let answerCopy: number[] = [...answer]; // To track used numbers in the answer


        // First pass: Check for right number, right place
        for (let i = 0; i < guess.length; i++) {
            if (guess[i] === answer[i]) {
                mark.push(1);
                answerCopy[i] = -1; // Mark the number as used
            } else {
                mark.push(3); // Assume wrong number for now
            }
        }

        // Second pass: Check for right number, wrong place
        for (let i = 0; i < guess.length; i++) {
            if (mark[i] === 1) continue; // Already marked as right number, right place


            for (let j = 0; j < answer.length; j++) {
                if (guess[i] === answerCopy[j]) {
                    mark[i] = 2; // Mark as right number, wrong place
                    answerCopy[j] = -1; // Mark the number as used
                    break; // Stop searching for this guess[i]
                }
            }
        }

        return mark;
    };

    const generateAnswer = () => {
        let answer: number[] = [];


        const getSeededRandom = (seed: number) => {
            let x = Math.sin(seed++) * 10000;
            return x - Math.floor(x);
        }

        const getDailySeed = () => {
            const now = new Date();
            const year = now.getUTCFullYear();
            const month = now.getUTCMonth() + 1; // months are zero-indexed
            const day = now.getUTCDate();
            return year * 56700 + month * 100 + day; // Create a unique seed for each day
        }

        // Generate a daily answer if mode is daily
        if (props.mode === "Daily") {
            const seed = getDailySeed();
            for (let i = 0; i < 4; i++) {
                answer.push(Math.floor(getSeededRandom(seed + i) * 10)); // Use seed for reproducibility
            }

            // Remove duplicates using seeded randomness
            if (props.difficulty === "Easy" || props.difficulty === "Hard") {
                let attempts = 0; // Prevent infinite loops
                for (let i = 0; i < answer.length && attempts < 100; i++) {
                    while (answer.indexOf(answer[i]) !== i) {
                        // Use seeded random to generate new digit, keeping track of attempts
                        answer[i] = Math.floor(getSeededRandom(seed + i + attempts) * 10);
                        attempts++;
                    }
                }
            }
        } else {
            // Regular random answer generation
            for (let i = 0; i < 4; i++) {
                answer.push(Math.floor(Math.random() * 10));
            }

            // Remove duplicates if Easy or Hard
            if (props.difficulty === "Easy" || props.difficulty === "Hard") {
                for (let i = 0; i < answer.length; i++) {
                    while (answer.indexOf(answer[i]) !== i) {
                        answer[i] = Math.floor(Math.random() * 10);
                    }
                }
            }
        }

        return answer;
    }

    const reset = () => {
        setAnswer(generateAnswer());
        setGuesses([]);
        setCurrentGuess([-1,-2,-2,-2]);
        setMessageText("");
        setHasWon(false);
        setTimer(0);


        // Multiplayer
        if (props.mode === "Multiplayer") {
            setMultiplayerSetNumber(false);
            setMessageText("Player 1, set the number");
        }
    }


    const markDigit = (status: number) => {

        setMultiplayerMark(prevState => {
            let newMark = [...prevState];
            let index = newMark.indexOf(-1);


            // Set the digit
            newMark[index] = status;

            if (index !== 3){
                newMark[index + 1] = -1;
            }else{
                // Get the current guess
                let newGuess = [...currentGuess];

                const guess: Guess = {guess: newGuess, mark: newMark};

                // Add the guess to the guesses array
                setGuesses(prevState => [...prevState, guess]);

                // Multiplayer Marking done
                setMultiplayerMarking(false);

                // Check if won
                if (newMark.every(value => value === 1)) {
                    setHasWon(true);
                }

                // Reset the guess
                setCurrentGuess([-1, -2, -2, -2]);
                setMessageText("");

                return [-1, 0, 0, 0];
            }

            // Set the message text
            setMessageText(`Mark the guess: Digit ${index + 2}`);

            return newMark;
        });
    }

    function createConfetti() {
        const confettiColors = ['#ff0', '#f00', '#0f0', '#00f', '#f0f', '#0ff'];
        const confettiCount = 100;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add(styles.confetti)
            confetti.style.left = `${Math.random() * 100}vw`;
            confetti.style.animationDuration = `${Math.random() * 3 + 2}s`;
            confetti.style.animationDelay = `-${Math.random() * 2}s`;
            confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
            document.body.appendChild(confetti);
        }
    }

    const updateIfMore = (value: number, current: number) => {
        if (value > current) return value;
        return current;
    }

    const updateIfLess = (value: number, current: number) => {
        if (value < current) return value;
        return current;
    }

    const addBasedDifficulty = (value: number, current: DifficultyStats) => {
        const newStats = {...current};
        // @ts-ignore
        newStats[props.difficulty.toLowerCase()] += value;
        return newStats;
    }

    const updateIfMoreBasedDifficulty = (value: number, current: DifficultyStats) => {
        const newStats = {...current};
        // @ts-ignore
        newStats[props.difficulty.toLowerCase()] = updateIfMore(value, current[props.difficulty.toLowerCase()]);
        return newStats;
    }

    const updateIfLessBasedDifficulty = (value: number, current: DifficultyStats) => {
        const newStats = {...current};
        // @ts-ignore
        newStats[props.difficulty.toLowerCase()] = updateIfLess(value, current[props.difficulty.toLowerCase()]);
        return newStats;
    }

    const updateStats = () => {

        const oldStats = {...props.stats};

        switch (props.mode) {

            case "Daily":
                oldStats.highestStreak = updateIfMore(streak.count, oldStats.highestStreak);
                oldStats.totalDa1ilyWins++;
                oldStats.totalDailyGuesses += guesses.length;
                oldStats.shortestDailyGame = updateIfLess(guesses.length, oldStats.shortestDailyGame);
                oldStats.longestDailyGame = updateIfMore(guesses.length, oldStats.longestDailyGame);
                oldStats.timeDailyPlayed += timer;
                oldStats.longestDailyGameTime = updateIfMore(timer, oldStats.longestDailyGameTime);
                oldStats.shortestDailyGameTime = updateIfLess(timer, oldStats.shortestDailyGameTime);
                break

            case "Single Player":
                oldStats.totalSinglePlayerWins = addBasedDifficulty(1, oldStats.totalSinglePlayerWins);
                oldStats.totalSinglePlayerGuesses = addBasedDifficulty(guesses.length, oldStats.totalSinglePlayerGuesses);
                oldStats.shortestSinglePlayerGame = updateIfLessBasedDifficulty(guesses.length, oldStats.shortestSinglePlayerGame);
                oldStats.longestSinglePlayerGame = updateIfMoreBasedDifficulty(guesses.length, oldStats.longestSinglePlayerGame);
                oldStats.timeSinglePlayerPlayed = addBasedDifficulty(timer, oldStats.timeSinglePlayerPlayed);
                oldStats.longestSinglePlayerGameTime = updateIfMoreBasedDifficulty(timer, oldStats.longestSinglePlayerGameTime);
                oldStats.shortestSinglePlayerGameTime = updateIfLessBasedDifficulty(timer, oldStats.shortestSinglePlayerGameTime);
                break

            case "Multiplayer":
                oldStats.totalMultiplayerWins = addBasedDifficulty(1, oldStats.totalMultiplayerWins);
                oldStats.totalMultiplayerGuesses = addBasedDifficulty(guesses.length, oldStats.totalMultiplayerGuesses);
                oldStats.shortestMultiplayerGame = updateIfLessBasedDifficulty(guesses.length, oldStats.shortestMultiplayerGame);
                oldStats.longestMultiplayerGame = updateIfMoreBasedDifficulty(guesses.length, oldStats.longestMultiplayerGame);
                oldStats.timeMultiplayerPlayed = addBasedDifficulty(timer, oldStats.timeMultiplayerPlayed);
                oldStats.longestMultiplayerGameTime = updateIfMoreBasedDifficulty(timer, oldStats.longestMultiplayerGameTime);
                oldStats.shortestMultiplayerGameTime = updateIfLessBasedDifficulty(timer, oldStats.shortestMultiplayerGameTime);
                break
        }

        // Update the stats
        localStorage.setItem("stats", JSON.stringify(oldStats));
        props.setStats(oldStats);
        console.log(oldStats);

    }


    return (
        <>
            <div className={styles.gameContainer}>

                {/* Timer */}
                <div className={styles.timer}>
                    <h3>{Math.floor(timer / 60)}:{timer % 60 < 10 ? "0" + timer % 60 : timer % 60}</h3>
                </div>

                {/* Streak */}
                {props.mode === "Daily" && <div className={styles.streak}>
                    <img src={"https://i0.wp.com/community.wacom.com/en-de/wp-content/uploads/sites/20/2023/10/Flame_GIF_2.gif"} alt={"Fire"} />
                    <p>{streak.count} Day Streak</p>
                </div>}


                {/* Previous Guesses */}
                {guesses.map((guess, index) => {
                    return (
                        <div key={index} className={styles.guess}>
                            {guess.guess.map((value, index) => {
                                return (
                                    <p key={index}
                                        className={ (props.difficulty === "Easy" || props.difficulty === "Medium") ? styles[["rightNumber", "rightPlace", "wrongNumber"][guess.mark[index] - 1]] : ""}
                                    >{value}</p>
                                )
                            })}

                            {/* Hard and Extreme mode */}
                            {(props.difficulty === "Hard" || props.difficulty === "Extreme") && <h3>

                                {guess.mark.sort().map((value) => {
                                    return (
                                        value === 1 ? "✔️" : (value === 2 ? "🔘" : " ")
                                    )
                                })}
                            </h3>}

                        </div>
                    )
                })}


                {!hasWon ?

                    <div className={styles.guess} id={"current"}>

                        {/* Current Guess, -1 is |, -2 is empty */}
                        {currentGuess.map((value, index) => {
                            return (
                                <>
                                    {value === -1 ?

                                        <p key={index} className={styles.fade}> | </p>
                                        :
                                        <p key={index} className={((multiplayerMark.indexOf(-1) == index && multiplayerMarking) ? styles.fade : "")}> {value === -2 ? " " : value}</p>
                                    }
                                </>
                            )
                        })}

                        {/* If it is full tell the user to press enter */}
                        {messageText && <h3>{messageText}</h3>}
                    </div>

                :
                    <>
                        {/* Win Message */}
                        <div className={styles.winMessage}>
                            <h1>You Won!</h1>
                            <button onClick={reset}>Play Again</button>
                        </div>
                    </>
                }
            </div>

            {/* Buttons to mark on multiplayer */}
            {multiplayerMarking && <div className={styles.markButtons}>
                <button onClick={() => markDigit(1)}>{(props.difficulty === "Easy" || props.difficulty === "Medium") ? "Right number, Right Place" : "✔️"}</button>
                <button onClick={() => markDigit(2)}>{(props.difficulty === "Easy" || props.difficulty === "Medium") ? "Right number, Wrong Place" : "🔘"}</button>
                <button onClick={() => markDigit(3)}>{(props.difficulty === "Easy" || props.difficulty === "Medium") ? "Wrong number" : "❌"}</button>
            </div>}


            <div id={"scrollHere"}/>
        </>
    );
}