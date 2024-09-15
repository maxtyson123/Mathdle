import * as React from 'react';
import styles from '../styles/game.module.css';
import {useEffect, useRef} from "react";
import {Theme} from "../index";

// TODO : Finidh Game
//          - Multiplayer Marking
//          - Streaks
//          - Stats
//          - Custom (no enter press, length, allow multiple guesses)


//NOTE: For debuging puroposes the arrays will be y, x instead of x, y (the cell id is cell-x-y)

type GameProps = {
    theme?: Theme;
    difficulty: GameDifficulty;
    mode: GameMode;
}

export type GameMode = "Daily" | "Single Player" | "Multiplayer";
export type GameDifficulty = "Easy" | "Medium" | "Hard" | "Extreme";


type Guess = {
    guess: number[];
    mark: number[];
}


export function Game(props: GameProps) {

    const [currentGuess, setCurrentGuess] = React.useState<number[]>([-1,-2,-2,-2]);
    const [guesses, setGuesses] = React.useState<Guess[]>([]);
    const [answer, setAnswer] = React.useState<number[]>([-1,-1,-1,-1]);
    const [hasWon, setHasWon] = React.useState<boolean>(false);
    const [messageText, setMessageText] = React.useState<string>("");
    const [multiplayerSetNumber, setMultiplayerSetNumber] = React.useState<boolean>(false);

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
    }, [props.difficulty, answer, multiplayerSetNumber, guesses]);

    // Scroll
    useEffect(() => {
        const scrollHere = document.getElementById("scrollHere");
        if (scrollHere) scrollHere.scrollIntoView({behavior: "smooth"});
    }, [guesses, currentGuess, hasWon]);

    // Rest the game when the difficulty changes
    useEffect(() => {
        reset();
    }, [props.difficulty, props.mode]);

    const handleKeyPress = (e: KeyboardEvent) => {
        // Clear message text
        setMessageText("");

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


        // Multiplayer
        if (props.mode === "Multiplayer") {
            setMultiplayerSetNumber(false);
            setMessageText("Player 1, set the number");
        }
    }

    return (
        <>
            <div className={styles.gameContainer}>

                {/* Key */}
                {/*<div className={styles.key}>*/}
                {/*    <div>*/}
                {/*        <p className={styles.rightNumber}>{(props.difficulty === "Easy" || props.difficulty === "Medium") ? "Green" : "✔️"}</p>*/}
                {/*        <p>Right Number, Right Place</p>*/}
                {/*    </div>*/}
                {/*    <div>*/}
                {/*        <p className={styles.rightPlace}>{(props.difficulty === "Easy" || props.difficulty === "Medium") ? "Orange" : "🔘"}</p>*/}
                {/*        <p>Right Number, Wrong Place</p>*/}
                {/*    </div>*/}
                {/*    {*/}
                {/*        (props.difficulty === "Easy" || props.difficulty === "Medium") &&*/}
                {/*        <div>*/}
                {/*            <p className={styles.wrongNumber}>Red</p>*/}
                {/*            <p>Wrong Number</p>*/}
                {/*        </div>*/}
                {/*    }*/}

                {/*</div>*/}

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
                                        <p key={index}> {value === -2 ? " " : value}</p>
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

            <div id={"scrollHere"}/>
        </>
    );
}