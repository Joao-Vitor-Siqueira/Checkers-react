import Board from "./components/Board";

function App() {
  return (
    <>
      <div className="flex align-middle justify-center h-screen object-contain bg-[url('/assets/woodTexture.jpg')] bg-cover bg-center">
        <Board></Board>
      </div>
    </>
  );
}

export default App;
