export default function Log({ turn, score, player }) {
  const CLASSES = {
    log: "text-shadow-lg shadow-xl/30 p-[4vh] size-[40vh] sm:max-lg:size-[30vh] flex flex-col align-middle justify-center rounded-lg border-3 object-contain bg-[url('/assets/log.png')]",
    text: "font-bold text-lg sm:max-lg:text-sm ",
    container: "shadow-lg text-neutral-100 border-3 border-black box-border mt-2 mb-2 p-2 rounded-lg bg-linear-to-r from-cyan-500 to-emerald-500",
    whiteScore : "shadow-lg text-white border-3 border-black box-border mt-2 mb-2 p-2 rounded-lg bg-linear-to-r from-neutral-600 to-neutral-900",
    blackScore : "shadow-lg box-border border-3 mt-2 mb-2 p-2 rounded-lg bg-linear-to-r from-white to-neutral-400",
    selected : " border-8 sm:max-lg:border-4 lg:max-xl:border-6 border-yellow-500 animate-[growShrink_500ms_ease-in-out_infinite]",
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
