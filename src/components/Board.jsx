import { useState, useEffect } from "react";
import Log from "./Log";
import GameOver from "./GameOver";

class Piece {
  constructor(color, isKing = false) {
    this.color = color;
    this.isKing = isKing;
  }
}

class Tile {
  constructor(
    topLeft,
    topRight,
    bottomLeft,
    bottomRight,
    piece,
    color,
    tilePos,
    state,
  ) {
    this.topLeft = topLeft;
    this.topRight = topRight;
    this.bottomLeft = bottomLeft;
    this.bottomRight = bottomRight;
    this.piece = piece;
    this.color = color;
    this.tilePos = tilePos;
    this.state = state;
  }
}

function initBoard() {
  let board = [];
  for (let i = 0; i < 8; i++) {
    let row = [];
    for (let j = 0; j < 8; j++) {
      let tilePos = i * 8 + j;
      let isEven = (i + j) % 2 == 0;
      let piece = null;

      if (tilePos < 24 && !isEven) {
        piece = new Piece("white", false);
      }
      if (tilePos > 39 && !isEven) {
        piece = new Piece("black", false);
      }

      row.push(
        new Tile(
          null,
          null,
          null,
          null,
          piece,
          (i + j) % 2 == 0 ? "white" : "black",
          tilePos,
          false,
          "none",
        ),
      );
    }
    board.push(row);
  }

  //link tiles
  board.forEach((row, rowIndex) => {
    row.forEach((tile, colIndex) => {
      if (tile.color == "black") {
        let topLeft = board[rowIndex - 1]?.[colIndex - 1] ?? null;
        let topRight = board[rowIndex - 1]?.[colIndex + 1] ?? null;
        let bottomLeft = board[rowIndex + 1]?.[colIndex - 1] ?? null;
        let bottomRight = board[rowIndex + 1]?.[colIndex + 1] ?? null;

        tile.topLeft = topLeft;
        tile.topRight = topRight;
        tile.bottomLeft = bottomLeft;
        tile.bottomRight = bottomRight;
      }
    });
  });

  return board;
}

const CLASSES = {
  container: "flex items-center justify-center",
  boardClass: "grid grid-cols-8 gap-0 w-fit border-3 box-border shadow-2xl",
  whiteTile:
    "flex items-center justify-center w-24 h-24 cursor-pointer object-contain bg-[url('/assets/whiteTile.png')]",
  blackTile:
    "flex items-center justify-center w-24 h-24 transition duration-150 ease-in object-contain bg-[url('/assets/blackTile.png')]",
  greenTile:
    "flex items-center justify-center w-24 h-24 transition duration-150 ease-in cursor-pointer object-contain bg-[url('/assets/greenTile.png')]",
  redTile:
    "flex items-center justify-center w-24 h-24 transition duration-150 ease-in cursor-pointer object-contain bg-[url('/assets/redTile.png')]",
  darkRedTile:
    "flex items-center justify-center w-24 h-24 transition duration-150 ease-in object-contain bg-[url('/assets/darkRedTile.png')]",
  whitePiece:
    "w-16 h-16 rounded-full cursor-pointer object-contain bg-[url('/assets/whitePiece.png')]  bg-cover bg-center bg-no-repeat",
  blackPiece:
    "w-16 h-16 rounded-full cursor-pointer object-contain bg-[url('/assets/blackPiece.png')]  bg-cover bg-center bg-no-repeat",
  selected:
    " ring-4 ring-yellow-500 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-900",
  hasCapture:
    " ring-4 ring-red-500 ring-offset-1 ring-offset-slate-50 dark:ring-offset-slate-900",
  crown: "w-full h-full object-contain",
};

export default function Board() {
  const [gameInfo, setGameInfo] = useState({
    turn: 1,
    player: "white",
    board: initBoard(),
    currentTile: null,
    highlightedTilesPos: [],
    gameAction: null,
    captureRoutes: [],
    captureStarted: false,
    score: { white: 0, black: 0 },
    gameOver: false,
  });

  useEffect(() => {
    if (gameInfo.score.white === 12) {
      setTimeout(
        () =>
          setGameInfo((prev) => ({
            ...prev,
            gameOver: true,
            player: "white",
          })),
        1000,
      );
      return;
    }
    if (gameInfo.score.black === 12) {
      setTimeout(
        () =>
          setGameInfo((prev) => ({
            ...prev,
            player: "black",
            gameOver: true,
          })),
        1000,
      );
      return;
    }

    const captureRoutes = checkCapture();

    if (captureRoutes.length) {
      let copy = captureRoutes.map((route) => structuredClone(route));
      setGameInfo((prev) => ({ ...prev, captureRoutes: copy }));
    }
  }, [gameInfo.turn]);

  function getRow(pos) {
    return Math.floor(pos / 8);
  }

  function getCol(pos) {
    return pos % 8;
  }

  function showValidTiles(event, currentTile) {
    event.stopPropagation();
    let newBoard = [...gameInfo.board];

    if (gameInfo.highlightedTilesPos.length) {
      gameInfo.highlightedTilesPos.forEach(
        (pos) => (newBoard[getRow(pos)][getCol(pos)].state = null),
      );
    }

    //toggle selected piece
    if (gameInfo.currentTile?.tilePos == currentTile.tilePos) {
      setGameInfo((prev) => ({
        ...prev,
        gameAction: null,
        board: newBoard,
        highlightedTilesPos: [],
        currentTile: null,
      }));
      return;
    }

    const validTilesPos = getValidTilesPos(currentTile);
    if (validTilesPos.length) {
      validTilesPos.forEach(
        (pos) =>
          (newBoard[getRow(pos)][getCol(pos)].state =
            gameInfo.board[getRow(pos)][getCol(pos)].state == "move"
              ? null
              : "move"),
      );

      setGameInfo((prev) => ({
        ...prev,
        gameAction: "move",
        board: newBoard,
        highlightedTilesPos: [...validTilesPos],
        currentTile,
      }));
    }
  }

  function handleGameAction(destinationTile) {
    const newBoard = [...gameInfo.board];
    const currentPos = gameInfo.currentTile.tilePos;
    const destinationPos = destinationTile.tilePos;

    let isKing = gameInfo.currentTile.piece.isKing;

    if (
      ((destinationPos <= 7 && gameInfo.player === "black") ||
        (destinationPos >= 56 && gameInfo.player === "white")) &&
      gameInfo.gameAction === "move"
    ) {
      isKing = true;
    }

    newBoard[getRow(destinationPos)][getCol(destinationPos)].piece = new Piece(
      gameInfo.player,
      isKing,
    );
    newBoard[getRow(currentPos)][getCol(currentPos)].piece = null;

    if (gameInfo.gameAction === "capture") {
      let discartedRoutes = gameInfo.captureRoutes.filter(
        (route) => !route.some((tile) => tile.tilePos === destinationPos),
      );
      discartedRoutes.forEach((route) => {
        route.forEach((tile) => {
          const [row, col] = [getRow(tile.tilePos), getCol(tile.tilePos)];
          newBoard[row][col].state = "none";
        });
      });

      //check if route has current and destination tile
      let currentRoutes = gameInfo.captureRoutes.filter(
        (route) =>
          route[0].tilePos === currentPos &&
          route.some((tile) => tile.tilePos === destinationPos),
      );

      //check destinationTile position for each route
      let destinationsIndex = [];
      currentRoutes.forEach((route, routeIndex) => {
        for (let tileIndex = 0; tileIndex < route.length; tileIndex++) {
          const tile = route[tileIndex];
          if (tile.tilePos === destinationPos) {
            destinationsIndex.push({ routeIndex, destinationIndex: tileIndex });
            break;
          }
        }
      });

      let smallestDestinationIndex = destinationsIndex.reduce(
        (acc, item) => {
          if (item.destinationIndex < acc.min || acc.min == 0) {
            return {
              routesIndex: [item.routeIndex],
              min: item.destinationIndex,
            };
          } else if (item.destinationIndex == acc.min) {
            return {
              routesIndex: [...acc.routesIndex, item.routeIndex],
              min: item.destinationIndex,
            };
          }
          return acc;
        },
        { routesIndex: [], min: 0 },
      ).routesIndex;

      let filteredRoutes = smallestDestinationIndex.map((item) => {
        return currentRoutes[item];
      });

      //remove enemy piece and highlighted tiles in between
      filteredRoutes.forEach((route) => {
        let pieceCount = 0;
        for (let index = 0; index < route.length; index++) {
          const tile = route[index];
          if (tile.tilePos == currentPos) continue;
          const [row, col] = [getRow(tile.tilePos), getCol(tile.tilePos)];

          if (tile.piece && tile.piece.color !== gameInfo.player) {
            if (pieceCount == 0) newBoard[row][col].piece = null;
            pieceCount++;
          } else {
            if (tile.tilePos == destinationPos) {
              route.slice(0, index + 1).forEach((item) => {
                if (!route.slice(index + 1).includes(item)) {
                  newBoard[getRow(item.tilePos)][getCol(item.tilePos)].state =
                    "none";
                } else {
                  newBoard[getRow(item.tilePos)][getCol(item.tilePos)].state =
                    "show";
                }
              });
            } else if (pieceCount == 1) {
              newBoard[row][col].state = "show";
            } else if (pieceCount == 2) {
              newBoard[row][col].state = "capture";
            } else if (pieceCount == 3) {
              break;
            }
          }
        }
      });

      let newScore = { ...gameInfo.score };
      newScore[gameInfo.player] = newScore[gameInfo.player] + 1;

      let newRoutes = filteredRoutes.map((route) => {
        let destinationIndex = -1;
        for (let i = 0; i < route.length; i++) {
          if (route[i].tilePos == destinationPos) {
            destinationIndex = i;
            break;
          }
        }
        return route.slice(destinationIndex);
      });

      const captureFinished = newRoutes.every((route) =>
        route.every(
          (tile) => tile.piece?.color === gameInfo.player || !tile.piece,
        ),
      );

      if (captureFinished) {
        newBoard.forEach((row) => row.forEach((tile) => (tile.state = "none")));
        if (
          (destinationPos <= 7 && gameInfo.player === "black") ||
          (destinationPos >= 56 && gameInfo.player === "white")
        ) {
          newBoard[getRow(destinationPos)][
            getCol(destinationPos)
          ].piece.isKing = true;
        }
      }

      setGameInfo((prev) => ({
        ...prev,
        turn: captureFinished ? prev.turn + 1 : prev.turn,
        player: captureFinished
          ? prev.player === "white"
            ? "black"
            : "white"
          : prev.player,
        board: newBoard,
        currentTile: captureFinished ? null : destinationTile,
        gameAction: captureFinished ? null : prev.gameAction,
        captureStarted: captureFinished ? false : true,
        highlightedTilesPos: captureFinished ? [] : prev.highlightedTilesPos,
        captureRoutes: captureFinished ? [] : newRoutes,
        score: newScore,
      }));
    }
    if (gameInfo.gameAction === "move") {
      gameInfo.highlightedTilesPos.forEach((pos) => {
        newBoard[getRow(pos)][getCol(pos)].state = null;
      });

      setGameInfo((prev) => ({
        ...prev,
        turn: prev.turn + 1,
        player: prev.player === "white" ? "black" : "white",
        board: newBoard,
        currentTile: null,
        highlightedTilesPos: [],
        gameAction: null,
      }));
    }
  }

  function getValidTilesPos(currentTile) {
    const validTiles = [];

    if (currentTile.piece.isKing) {
      let topLeft = currentTile.topLeft;
      let topRight = currentTile.topRight;
      let bottomLeft = currentTile.bottomLeft;
      let bottomRight = currentTile.bottomRight;

      while (topLeft && !topLeft.piece) {
        validTiles.push(topLeft.tilePos);
        topLeft = topLeft.topLeft;
      }
      while (topRight && !topRight.piece) {
        validTiles.push(topRight.tilePos);
        topRight = topRight.topRight;
      }
      while (bottomLeft && !bottomLeft.piece) {
        validTiles.push(bottomLeft.tilePos);
        bottomLeft = bottomLeft.bottomLeft;
      }
      while (bottomRight && !bottomRight.piece) {
        validTiles.push(bottomRight.tilePos);
        bottomRight = bottomRight.bottomRight;
      }
    } else {
      const orientation =
        currentTile.piece.color === "white" ? "bottom" : "top";
      if (
        currentTile[`${orientation}Left`] &&
        !currentTile[`${orientation}Left`].piece
      ) {
        validTiles.push(currentTile[`${orientation}Left`].tilePos);
      }
      if (
        currentTile[`${orientation}Right`] &&
        !currentTile[`${orientation}Right`].piece
      ) {
        validTiles.push(currentTile[`${orientation}Right`].tilePos);
      }
    }
    return validTiles;
  }

  function checkCapture() {
    const captureRoutes = [];
    const pieceTiles = gameInfo.board
      .flat()
      .filter((tile) => tile.piece && tile.piece.color === gameInfo.player);
    const enemyPiece = gameInfo.player === "white" ? "black" : "white";

    const borders = [1, 3, 5, 7, 56, 58, 60, 62];

    function getCaptureRoutes(root, route, prevDirection) {
      let capturedPieces = route
        .filter((item) => item.piece)
        .map((item) => item.tilePos);

      const topLeft = root?.topLeft;
      const topRight = root?.topRight;
      const bottomLeft = root?.bottomLeft;
      const bottomRight = root?.bottomRight;

      if (
        prevDirection !== "topLeft" &&
        topLeft?.piece &&
        topLeft?.piece.color === enemyPiece &&
        topLeft.topLeft != null &&
        !topLeft.topLeft.piece &&
        !capturedPieces.includes(topLeft.tilePos)
      )
        getCaptureRoutes(
          topLeft.topLeft,
          [...route, root, topLeft],
          "bottomRight",
        );
      if (
        prevDirection !== "topRight" &&
        topRight?.piece &&
        topRight?.piece.color === enemyPiece &&
        topRight.topRight != null &&
        !topRight.topRight.piece &&
        !capturedPieces.includes(topRight.tilePos)
      )
        getCaptureRoutes(
          topRight.topRight,
          [...route, root, topRight],
          "bottomLeft",
        );
      if (
        prevDirection !== "bottomLeft" &&
        bottomLeft?.piece &&
        bottomLeft?.piece.color === enemyPiece &&
        bottomLeft.bottomLeft != null &&
        !bottomLeft.bottomLeft.piece &&
        !capturedPieces.includes(bottomLeft.tilePos)
      )
        getCaptureRoutes(
          bottomLeft.bottomLeft,
          [...route, root, bottomLeft],
          "topRight",
        );
      if (
        prevDirection !== "bottomRight" &&
        bottomRight?.piece &&
        bottomRight?.piece.color === enemyPiece &&
        bottomRight.bottomRight != null &&
        !bottomRight.bottomRight.piece &&
        !capturedPieces.includes(bottomRight.tilePos)
      )
        getCaptureRoutes(
          bottomRight.bottomRight,
          [...route, root, bottomRight],
          "topLeft",
        );

      if (route.length) captureRoutes.push([...route, root]);
    }

    function getKingCaptureRoutes(tile) {
      const routes = [];
      const routesToCheck = [{ route: [tile], prevDirection: "none" }];

      while (routesToCheck.length) {
        gkcrHelper(routesToCheck.shift());
      }

      function gkcrHelper(routeData) {
        const { route } = routeData;
        const { prevDirection } = routeData;
        const capturedPieces = route.filter(
          (tile) => tile.piece && tile.piece.color !== gameInfo.player,
        );

        let root = route[route.length - 1];

        let topLeft = prevDirection != "topLeft" ? root.topLeft : null;
        let topRight = prevDirection != "topRight" ? root.topRight : null;
        let bottomLeft = prevDirection != "bottomLeft" ? root.bottomLeft : null;
        let bottomRight =
          prevDirection != "bottomRight" ? root.bottomRight : null;

        const topLeftRoute = [];
        const topRightRoute = [];
        const bottomLeftRoute = [];
        const bottomRightRoute = [];

        while (topLeft && !topLeft.piece) {
          topLeftRoute.push(topLeft);
          topLeft = topLeft.topLeft;
        }
        if (
          topLeft &&
          topLeft.piece &&
          topLeft.piece.color !== gameInfo.player &&
          !capturedPieces.includes(topLeft)
        ) {
          topLeftRoute.push(topLeft);
          topLeft = topLeft.topLeft;
          while (topLeft && !topLeft.piece) {
            topLeftRoute.push(topLeft);
            routesToCheck.push({
              route: [...route, ...topLeftRoute],
              prevDirection: "bottomRight",
            });
            topLeft = topLeft.topLeft;
          }
        }

        while (topRight && !topRight.piece) {
          topRightRoute.push(topRight);
          topRight = topRight.topRight;
        }
        if (
          topRight &&
          topRight.piece &&
          topRight.piece.color !== gameInfo.player &&
          !capturedPieces.includes(topRight)
        ) {
          topRightRoute.push(topRight);
          topRight = topRight.topRight;
          while (topRight && !topRight.piece) {
            topRightRoute.push(topRight);
            routesToCheck.push({
              route: [...route, ...topRightRoute],
              prevDirection: "bottomLeft",
            });
            topRight = topRight.topRight;
          }
        }

        while (bottomLeft && !bottomLeft.piece) {
          bottomLeftRoute.push(bottomLeft);
          bottomLeft = bottomLeft.bottomLeft;
        }
        if (
          bottomLeft &&
          bottomLeft.piece &&
          bottomLeft.piece.color !== gameInfo.player &&
          !capturedPieces.includes(bottomLeft)
        ) {
          bottomLeftRoute.push(bottomLeft);
          bottomLeft = bottomLeft.bottomLeft;
          while (bottomLeft && !bottomLeft.piece) {
            bottomLeftRoute.push(bottomLeft);
            routesToCheck.push({
              route: [...route, ...bottomLeftRoute],
              prevDirection: "topRight",
            });
            bottomLeft = bottomLeft.bottomLeft;
          }
        }

        while (bottomRight && !bottomRight.piece) {
          bottomRightRoute.push(bottomRight);
          bottomRight = bottomRight.bottomRight;
        }
        if (
          bottomRight &&
          bottomRight.piece &&
          bottomRight.piece.color !== gameInfo.player &&
          !capturedPieces.includes(bottomRight)
        ) {
          bottomRightRoute.push(bottomRight);
          bottomRight = bottomRight.bottomRight;
          while (bottomRight && !bottomRight.piece) {
            bottomRightRoute.push(bottomRight);
            routesToCheck.push({
              route: [...route, ...bottomRightRoute],
              prevDirection: "topLeft",
            });
            bottomRight = bottomRight.bottomRight;
          }
        }
        if (isRouteValid(route)) {
          captureRoutes.push(route);
        }
      }
    }

    pieceTiles.forEach((pieceTile) => {
      if (pieceTile.piece.isKing) {
        getKingCaptureRoutes(pieceTile);
      } else {
        getCaptureRoutes(pieceTile, [], "");
      }
    });

    return getLongestRoutes(captureRoutes);
  }

  function getLongestRoutes(routes) {
    let filteredRoutes = [];
    let max = 0;
    for (let i = 0; i < routes.length; i++) {
      let capturedPieces = 0;
      routes[i].forEach((tile) => {
        capturedPieces = tile.piece ? capturedPieces + 1 : capturedPieces;
      });
      if (capturedPieces > max) {
        filteredRoutes = [routes[i]];
        max = capturedPieces;
      } else if (capturedPieces == max) {
        filteredRoutes.push(routes[i]);
      }
    }
    return filteredRoutes;
  }

  function isRouteValid(route) {
    if (route.length < 3) return false;

    const directions = new Map();
    directions.set(-9, "topLeft");
    directions.set(-7, "topRight");
    directions.set(7, "bottomLeft");
    directions.set(9, "bottomRight");

    let prevPos = route[0].tilePos;
    let prevDirection = directions.get(route[1].tilePos - prevPos);
    let pieceFound = false;
    let currentDirection = null;
    let directionChange = false;
    let prevCount = 0;
    let pieceCount = 0;

    for (let i = 1; i < route.length; i++) {
      currentDirection = directions.get(route[i].tilePos - prevPos);
      if (currentDirection !== prevDirection) {
        directionChange = true;
        prevCount = pieceCount;
      }
      if (route[i].piece && !pieceFound) {
        pieceFound = true;
      } else if (route[i].piece && pieceFound) {
        return false;
      } else if (pieceFound && !route[i].piece) {
        pieceFound = false;
        pieceCount++;
        directionChange = false;
      }
      prevDirection = currentDirection;
      prevPos = route[i].tilePos;
    }

    if (directionChange && prevCount == pieceCount) return false;
    return pieceCount > 0;
  }

  function showCaptureRoutes(event, currentTile) {
    event?.stopPropagation();
    let newBoard = [...gameInfo.board];
    let highlightedTilesPos = [];

    gameInfo.captureRoutes.forEach((route) => {
      route.forEach((tile) => {
        let row = getRow(tile.tilePos);
        let col = getCol(tile.tilePos);
        newBoard[row][col].state = "none";
      });
    });

    //toggle selected piece
    if (gameInfo.currentTile?.tilePos == currentTile.tilePos) {
      setGameInfo((prev) => ({
        ...prev,
        gameAction: null,
        board: newBoard,
        currentTile: null,
        highlightedTilesPos,
      }));
      return;
    }

    gameInfo.captureRoutes.forEach((route) => {
      if (route[0].tilePos == currentTile.tilePos) {
        let pieceCount = 0;
        route.forEach((tile, index) => {
          if (tile.piece && tile.tilePos != currentTile.tilePos) pieceCount++;
          else if (currentTile.tilePos != tile.tilePos) {
            let row = getRow(tile.tilePos);
            let col = getCol(tile.tilePos);
            if (pieceCount == 1) {
              newBoard[row][col].state = "capture";
            } else if (
              pieceCount != 1 &&
              !route.slice(0, index).includes(tile)
            ) {
              newBoard[row][col].state = "show";
            }
            highlightedTilesPos.push(tile.tilePos);
          }
        });
      }
    });

    setGameInfo((prev) => ({
      ...prev,
      gameAction: "capture",
      board: newBoard,
      currentTile,
      highlightedTilesPos,
    }));
  }

  if (!gameInfo.gameOver)
    return (
      <div className={CLASSES.container}>
        <div className={CLASSES.boardClass}>
          {gameInfo.board.map((row, rowIndex) =>
            row.map((tile, colIndex) => {
              return (
                <div
                  onClick={() => {
                    if (
                      (gameInfo.highlightedTilesPos.includes(tile.tilePos) &&
                        tile.state === "capture") ||
                      tile.state === "move"
                    )
                      handleGameAction(tile);
                  }}
                  key={`t${rowIndex}-${colIndex}`}
                  className={
                    tile.state === "capture"
                      ? CLASSES.redTile
                      : tile.state === "show"
                        ? CLASSES.darkRedTile
                        : tile.state === "move"
                          ? CLASSES.greenTile
                          : tile.color === "white"
                            ? CLASSES.whiteTile
                            : CLASSES.blackTile
                  }
                >
                  {tile.piece && (
                    <button
                      onClick={(event) => {
                        if (tile.piece.color === gameInfo.player)
                          if (!gameInfo.captureRoutes.length) {
                            showValidTiles(event, tile);
                          } else if (
                            gameInfo.captureRoutes
                              .flat()
                              .some((item) => item.tilePos == tile.tilePos)
                          ) {
                            if (!gameInfo.captureStarted)
                              showCaptureRoutes(event, tile);
                          }
                      }}
                      key={`p${rowIndex}-${colIndex}`}
                      className={
                        (tile.piece.color === "white"
                          ? CLASSES.whitePiece
                          : CLASSES.blackPiece) +
                        (gameInfo.captureRoutes.some(
                          (route) => route[0].tilePos == tile.tilePos,
                        )
                          ? CLASSES.hasCapture
                          : "") +
                        (tile.tilePos === gameInfo.currentTile?.tilePos
                          ? CLASSES.selected
                          : "")
                      }
                    >
                      {tile.piece.isKing && (
                        <div className="p-1">
                          <img
                            className={CLASSES.crown}
                            src={`/assets/${tile.piece.color}-crown.svg`}
                            alt="crown"
                          />
                        </div>
                      )}
                    </button>
                  )}
                </div>
              );
            }),
          )}
        </div>
        <Log
          turn={gameInfo.turn}
          score={gameInfo.score}
          player={gameInfo.player}
        ></Log>
      </div>
    );
  return (
    <GameOver
      player={gameInfo.player}
      setGameInfo={setGameInfo}
      initBoard={initBoard}
    ></GameOver>
  );
}
