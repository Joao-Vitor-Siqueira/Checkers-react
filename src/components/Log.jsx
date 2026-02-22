export default function Log({ turn, score, player }) {
  const CLASSES = {
    log: "text-shadow-lg shadow-xl/30 ml-40 p-10 w-100 h-100 flex flex-col align-middle justify-center rounded-lg border-3 object-contain bg-[url('/assets/log.png')]",
    text: "font-bold text-2xl",
    container: "shadow-lg text-neutral-100 border-3 border-black box-border mt-4 mb-4 p-4 rounded-lg bg-linear-to-r from-cyan-500 to-emerald-500",
    whiteScore : "shadow-lg text-white border-3 border-black box-border mt-4 mb-4 p-4 rounded-lg bg-linear-to-r from-neutral-600 to-neutral-900",
    blackScore : "shadow-lg box-border border-3 mt-4 mb-4 p-4 rounded-lg bg-linear-to-r from-white to-neutral-400",
    selected : " border-8 border-yellow-500 animate-[growShrink_500ms_ease-in-out_infinite]",
  };

  return (
    <div className={CLASSES.log}>
      <div className={CLASSES.container}>
        <p className={CLASSES.text}>ROUND : {turn}</p>
      </div>
      <div className={player === "white" ? CLASSES.whiteScore + CLASSES.selected : CLASSES.whiteScore}>
        <p className={CLASSES.text}>WHITE : {score.white}</p>
      </div>
      <div className={player === "black" ? CLASSES.blackScore + CLASSES.selected : CLASSES.blackScore}>
        <p className={CLASSES.text}>BLACK : {score.black}</p>
      </div>
    </div>
  );
}
