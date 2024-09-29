import React, { useState, createContext, useRef, useContext } from 'react';
import { ClassGame } from '../game/classGame';
import { User } from '../utils/types';

interface GameContextType {
    gameStarted: boolean;
    setGameStarted: React.Dispatch<React.SetStateAction<boolean>>;
    showButton: boolean;
    setShowButton: React.Dispatch<React.SetStateAction<boolean>>;
    settingsToDo: boolean;
    setSettingsToDo: React.Dispatch<React.SetStateAction<boolean>>;
    firstPlayer: boolean;
    setFirstPlayer: React.Dispatch<React.SetStateAction<boolean>>;
    ballSpeed: number;
    setBallSpeed: React.Dispatch<React.SetStateAction<number>>;
    paddleHeight: number;
    setPaddleHeight: React.Dispatch<React.SetStateAction<number>>;
    paddleSpeed: number;
    setPaddleSpeed: React.Dispatch<React.SetStateAction<number>>;
    increasedBallSpeed: number;
    setIncreasedBallSpeed: React.Dispatch<React.SetStateAction<number>>;
    ballSize: number;
    setBallSize: React.Dispatch<React.SetStateAction<number>>;
    Winner: User | null;
    setWinner: React.Dispatch<React.SetStateAction<User | null>>;
    gameInstance: React.MutableRefObject<ClassGame | null>;
    showEndGameModal: boolean;
    setShowEndGameModal: React.Dispatch<React.SetStateAction<boolean>>;
    isAbandon: boolean;
    setIsAbandon: React.Dispatch<React.SetStateAction<boolean>>;
    letsGO: boolean;
    setLetsGO: React.Dispatch<React.SetStateAction<boolean>>;
    playerStats: any[];
    setPlayerStats: React.Dispatch<React.SetStateAction<any[]>>;
    playerOne: User;
    setPlayerOne: React.Dispatch<React.SetStateAction<User>>;
    playerTwo: User;
    setPlayerTwo: React.Dispatch<React.SetStateAction<User>>;
    historyAll: any[];
    setHistoryAll: React.Dispatch<React.SetStateAction<any[]>>;
    isSpectator: boolean;
    setIsSpectator: React.Dispatch<React.SetStateAction<boolean>>;
    saveClicked: boolean;
    spectatorsBase: any[];
    setSpectatorsBase: React.Dispatch<React.SetStateAction<any[]>>;
    handleQuit: () => void;
    PreviousUrl: string;
}

export const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
    const [gameStarted, setGameStarted] = useState(false);
    const [showButton, setShowButton] = useState(true);
    const [settingsToDo, setSettingsToDo] = useState(false);
    const [firstPlayer, setFirstPlayer] = useState(false);
    const [ballSpeed, setBallSpeed] = useState(0.05);
    const [paddleHeight, setPaddleHeight] = useState(200);
    const [paddleSpeed, setPaddleSpeed] = useState(5);
    const [increasedBallSpeed, setIncreasedBallSpeed] = useState(0.003);
    const [ballSize, setBallSize] = useState(15);
    const [Winner, setWinner] = useState<User | null>(null);
    const gameInstance = useRef<ClassGame | null>(null);
    const [showEndGameModal, setShowEndGameModal] = useState(false);
    const [isAbandon, setIsAbandon] = useState(false);
    const [letsGO, setLetsGO] = useState(false);
    const [playerStats, setPlayerStats] = useState<any[]>([]);
    const [playerOne, setPlayerOne] = useState<User>({} as User);
    const [playerTwo, setPlayerTwo] = useState<User>({} as User);
    const [historyAll, setHistoryAll] = useState<any[]>([]);
    const saveClicked = false;
    const [spectatorsBase, setSpectatorsBase] = useState<any[]>([]);
    const [isSpectator, setIsSpectator] = useState(false);
    const PreviousUrl = "";

    const handleQuit = () => {
        setLetsGO(false);
        setGameStarted(false);
        setShowButton(true);
        setFirstPlayer(false);
        setSettingsToDo(false);
        setBallSpeed(0.05);
        setPaddleHeight(200);
        setPaddleSpeed(5);
        setIncreasedBallSpeed(0.003);
        setBallSize(15);
        setShowEndGameModal(false);
        setPlayerStats([]);
        setWinner(null);
        setPlayerOne({} as User);
        setPlayerTwo({} as User);
    };

    let value = {
        gameStarted, setGameStarted, showButton, setShowButton, settingsToDo, setSettingsToDo, firstPlayer, setFirstPlayer,
        ballSpeed, setBallSpeed, paddleHeight, setPaddleHeight, paddleSpeed, setPaddleSpeed, increasedBallSpeed, setIncreasedBallSpeed,
        ballSize, setBallSize, Winner, setWinner, gameInstance, showEndGameModal, setShowEndGameModal, playerStats, setPlayerStats,
        isAbandon, setIsAbandon, letsGO, setLetsGO, playerOne, setPlayerOne, playerTwo, setPlayerTwo, historyAll, setHistoryAll,
        isSpectator, setIsSpectator, saveClicked, spectatorsBase, setSpectatorsBase, handleQuit, PreviousUrl
    };

    return (
        <GameContext.Provider value={value}>
            {children}
        </GameContext.Provider>
    )
}

export function useGame() {
    return useContext(GameContext);
}