//Define los diferentes niveles del juego con la cantidad de filas, columnas y minas para cada uno
const levels = {
  noob: { rows: 6, cols: 6, mines: 6 },
  easy: { rows: 8, cols: 8, mines: 10 },
  medium: { rows: 10, cols: 10, mines: 15 },
  hard: { rows: 12, cols: 12, mines: 20 },
  expert: { rows: 14, cols: 14, mines: 40 },
};
const vida1 = document.querySelector("#vida1");
const vida2 = document.querySelector("#vida2");
const vida3 = document.querySelector("#vida3");
const vidaNegra1 = document.querySelector("#vidaNegra1");
const vidaNegra2 = document.querySelector("#vidaNegra2");
const vidaNegra3 = document.querySelector("#vidaNegra3");
const result = document.querySelector("#result"); //Selecciona el elemento del HTML donde se mostrará el resultado del juego.
const explosion = document.getElementById("explosion"); //Selecciona el elemento del HTML donde se mostrará la explosión si pierdes
const confetti = document.getElementById("winAnimation"); //Selecciona el elemento del HTML donde se mostrará el confetti si ganas
const startButton = document.querySelector("button"); // Obtén una referencia al botón startGame
let currentLevel = "easy"; //Almacena el nivel actual del juego
let board = []; //Representa el tablero del juego
let flagsPlaced = 0; //Contador de banderas colocadas en el tablero
let gameOver = false; //Variable para controlar si el juego ha terminado
let contadorVidas = 3;

/* Inicializa el juego con el nivel seleccionado, inicializa el tablero, lo muestra en la interfaz, 
actualiza el contador de banderas y maneja la recarga de la página si el juego ha terminado. */
function startGame() {
  currentLevel = document.getElementById("level").value;
  contadorVidas = 3;
  checkVidas();
  initializeBoard();
  renderBoard();
  updateFlagCounter();
  if (gameOver) {
    gameOver = false; // Reiniciar el estado del juego
    explosion.classList.remove("explode"); // Elimina la clase que activa la animación de explosión
    explosion.style.display = "none"; // Oculta el elemento de explosión
    confetti.classList.remove("win"); // Elimina la clase que activa la animación de confeti
    confetti.style.display = "none"; // Oculta el elemento de confeti
    result.innerHTML = ""; //Oculta el elemento del resultado de la partida
    contadorVidas = 3;
    checkVidas();
  }
}

window.onload = startGame(); // Llama a startGame al cargar la página para comenzar el juego

/* Inicializa el tablero con las minas distribuidas aleatoriamente y calcula el número de minas adyacentes para cada celda. */
function initializeBoard() {
  const { rows, cols, mines } = levels[currentLevel];

  board = [];
  flagsPlaced = 0;

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < cols; j++) {
      board[i][j] = { isMine: false, revealed: false, flagged: false, value: 0 };
    }
  }

  // Coloca las minas aleatoriamente por el tablero
  let minesToPlace = mines;
  while (minesToPlace > 0) {
    const row = Math.floor(Math.random() * rows);
    const col = Math.floor(Math.random() * cols);
    if (!board[row][col].isMine) {
      board[row][col].isMine = true;
      minesToPlace--;
    }
  }

  // Calcula las minas adyacentes para cada celda del tablero
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (!board[i][j].isMine) {
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
          for (let colOffset = -1; colOffset <= 1; colOffset++) {
            const adjacentRow = i + rowOffset;
            const adjacentCol = j + colOffset;
            if (adjacentRow >= 0 && adjacentRow < rows && adjacentCol >= 0 && adjacentCol < cols) {
              if (board[adjacentRow][adjacentCol].isMine) {
                board[i][j].value++;
              }
            }
          }
        }
      }
    }
  }
}

//Revela una celda del tablero y verifica si el juego ha terminado (ya sea ganado o perdido).
function revealCell(row, col) {
  if (
    gameOver ||
    row < 0 ||
    row >= board.length ||
    col < 0 ||
    col >= board[0].length ||
    board[row][col].revealed ||
    board[row][col].flagged
  ) {
    return;
  }

  board[row][col].revealed = true;

  if (board[row][col].isMine) {
    contadorVidas--;
    checkVidas();
    checkGameOver();
  } else if (board[row][col].value === 0) {
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        revealCell(row + rowOffset, col + colOffset);
      }
    }
  }

  renderBoard();
  if (contadorVidas === 0) {
    gameOver = true;
    checkGameOver();
  }
}

function checkVidas() {
  if (contadorVidas === 3) {
    vida3.style.display = "flex";
    vida2.style.display = "flex";
    vida1.style.display = "flex";
    vidaNegra3.style.display = "none";
    vidaNegra2.style.display = "none";
    vidaNegra1.style.display = "none";
  }
  if (contadorVidas === 2) {
    vida3.style.display = "none";
    vidaNegra3.style.display = "flex";
  }
  if (contadorVidas === 1) {
    vida2.style.display = "none";
    vidaNegra2.style.display = "flex";
  }
  if (contadorVidas === 0) {
    vida1.style.display = "none";
    vidaNegra1.style.display = "flex";
  }
}

function checkGameOver() {
  if (gameOver) {
    startButton.style.display = "none"
    explosion.classList.add("explode"); // Agrega la clase para mostrar la animación
    explosion.style.display = "inline-block";
    result.innerHTML = "</br> BOOM! </br> YOU LOSE!";
    setTimeout(() => {
      revealAll();
    }, 2000);
  } else if (!gameOver && checkWin()) {
    startButton.style.display = "none"
    confetti.classList.add("win"); // Agrega la clase para mostrar la animación
    confetti.style.display = "inline-block";
    result.innerHTML = "</br> YOU WIN!";
    gameOver = true;
    setTimeout(() => {
      revealAll();
    }, 2000);
  }
}
/* Verifica si el jugador ha ganado el juego al revelar todas las celdas no minadas y colocar banderas correctamente. */
function checkWin() {
  const { rows, cols } = levels[currentLevel];
  let minasTotales = levels[currentLevel].mines;
  let celdasSinMina = rows * cols - levels[currentLevel].mines;
  let CeldaReveladaSinMina = 0;
  let BanderaCoincideMina = 0;
  let minesExploded = 0;

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (board[i][j].revealed && !board[i][j].isMine) {
        CeldaReveladaSinMina++;
      }
      if (board[i][j].revealed && board[i][j].isMine) {
        minesExploded++;
      }
      if (board[i][j].flagged && board[i][j].isMine) {
        BanderaCoincideMina++;
      }
    }
  }

  // Verificar si todas las celdas sin minas han sido reveladas y todas las minas están marcadas con banderas
  // O si las minas explotadas + minas marcadas con bandera = a las minas totales y todas las celdas sin minas han sido reveladas
  return (
    (CeldaReveladaSinMina === celdasSinMina && BanderaCoincideMina === minasTotales) ||
    (minesExploded + BanderaCoincideMina === minasTotales && CeldaReveladaSinMina === celdasSinMina)
  );
}

//Coloca o retira una bandera en una celda y verifica si el jugador ha ganado.
function toggleFlag(row, col) {
  if (gameOver || row < 0 || row >= board.length || col < 0 || col >= board[0].length || board[row][col].revealed) {
    return;
  }

  if (board[row][col].flagged) {
    flagsPlaced--;
  } else {
    if (flagsPlaced >= levels[currentLevel].mines) {
      return;
    }
    flagsPlaced++;
  }

  board[row][col].flagged = !board[row][col].flagged; //activa o desactiva una bandera en una celda
  renderBoard();
  updateFlagCounter();
  checkGameOver();
}

//Revela todas las celdas del tablero al finalizar el juego.
function revealAll() {
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      board[i][j].revealed = true;
    }
  }
  renderBoard();
  startButton.style.display = "inline-block"
}
/* Renderiza el tablero en la interfaz, mostrando las celdas reveladas, 
banderas colocadas y números correspondientes a las minas adyacentes. */
function renderBoard() {
  const boardElement = document.getElementById("board");
  boardElement.innerHTML = "";

  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (board[i][j].revealed) {
        if (board[i][j].isMine) {
          cell.textContent = "💣";
          cell.classList.add("bomb");
          cell.style.backgroundColor = "#CB3234";
        } else {
          cell.textContent = board[i][j].value || "";
          cell.style.backgroundColor = "#767675";
        }
      } else if (board[i][j].flagged) {
        cell.textContent = "🚩";
        cell.classList.add("flagged");
      } else {
        cell.addEventListener("click", () => revealCell(i, j));
      }
      //ASIGNA COLORES A LOS NÚMEROS
      if (board[i][j].value === 1) {
        cell.classList.add("one");
      } else if (board[i][j].value === 2) {
        cell.classList.add("two");
      } else if (board[i][j].value === 3) {
        cell.classList.add("three");
      } else if (board[i][j].value === 4) {
        cell.classList.add("four");
      } else if (board[i][j].value === 5) {
        cell.classList.add("five");
      } else if (board[i][j].value === 6) {
        cell.classList.add("six");
      }
      // Añadir/quitar banderas con el botón derecho
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        toggleFlag(i, j);
      });
      boardElement.appendChild(cell);
    }
    boardElement.appendChild(document.createElement("br"));
  }
}

//Actualiza el contador de banderas mostrado en la interfaz.
function updateFlagCounter() {
  const flagCounterElement = document.getElementById("flagCounter");
  flagCounterElement.textContent = `Banderas restantes: ${levels[currentLevel].mines - flagsPlaced}`;
}

startGame();
