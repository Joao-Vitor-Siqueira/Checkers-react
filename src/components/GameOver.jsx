export default function GameOver({ player, setGameInfo, initBoard }) {
  const CLASSES = {
    container: "flex items-center justify-center flex-col",
    textBlack: "font-bold text-8xl text-shadow-lg animate-[gameOver_750ms_ease-in-out_infinite]",
    textWhite: "font-bold text-8xl text-white text-shadow-lg animate-[gameOver_750ms_ease-in-out_infinite]",
    button:
      "shadow-xl/30 mt-20 text-3xl font-bold text-shadow-lg text-white bg-linear-to-r from-cyan-500 to-emerald-500 p-5 rounded-lg border-3 box-border cursor-pointer hover:scale-103 transition ease-in-out active:scale-100",
  };

  function handleClick() {
    setGameInfo({
      turn: 1,
      player: "white",
      board : initBoard(),
      currentTile: null,
      highlightedTilesPos: [],
      gameAction: null,
      captureRoutes: [],
      captureStarted: false,
      score: { white: 0, black: 0 },
      gameOver: false,
    });
  }

  return (
    <div className={CLASSES.container}>
      <p className={player === "white" ? CLASSES.textWhite : CLASSES.textBlack}>
        {player.charAt(0).toUpperCase() + player.slice(1)} wins!
      </p>
      <button onClick={() => handleClick()} className={CLASSES.button}>Play Again</button>
    </div>
  );
}
