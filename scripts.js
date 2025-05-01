document.addEventListener("DOMContentLoaded", () => {
	// Configurações do jogo
	const canvas = document.getElementById("game-board");
	const ctx = canvas.getContext("2d");
	const scoreElement = document.getElementById("score");
	const highScoreElement = document.getElementById("high-score");
	const finalScoreElement = document.getElementById("final-score");
	const gameOverScreen = document.getElementById("game-over");
	const startButton = document.getElementById("start-button");
	const restartButton = document.getElementById("restart-button");

	// Tamanho de cada quadrado da grade
	const gridSize = 20;
	const gridWidth = canvas.width / gridSize;
	const gridHeight = canvas.height / gridSize;

	// Estado do jogo
	let snake = [];
	let food = {};
	let direction = "right";
	let nextDirection = "right";
	let score = 0;
	let highScore = 0;
	let gameSpeed = 150; // Milissegundos entre cada frame
	let gameLoop = null;
	let isPaused = false;
	let isGameRunning = false;

	// Inicializar o estado inicial do jogo
	function initGameState() {
		snake = [
			{ x: 6, y: 10 },
			{ x: 5, y: 10 },
			{ x: 4, y: 10 },
		];
		direction = "right";
		nextDirection = "right";
		score = 0;
		scoreElement.textContent = "0";

		// Gerar comida inicial
		generateFood();

		// Desenhar o estado inicial
		drawGame();
	}

	// Inicializar o jogo quando o botão for clicado
	function startGame() {
		// Limpar estado
		snake = [
			{ x: 6, y: 10 },
			{ x: 5, y: 10 },
			{ x: 4, y: 10 },
		];

		direction = "right";
		nextDirection = "right";
		score = 0;
		gameSpeed = 150;
		isPaused = false;
		isGameRunning = true;

		scoreElement.textContent = "0";
		gameOverScreen.style.display = "none";

		generateFood();

		// Parar qualquer loop anterior se existir
		if (gameLoop) {
			clearInterval(gameLoop);
		}

		// Iniciar o loop do jogo
		gameLoop = setInterval(gameUpdate, gameSpeed);

		// Esconder botão de iniciar
		startButton.style.display = "none";
	}

	// Gerar comida em posição aleatória
	function generateFood() {
		food = {
			x: Math.floor(Math.random() * gridWidth),
			y: Math.floor(Math.random() * gridHeight),
		};

		// Evitar que a comida apareça sobre a cobra
		for (const segment of snake) {
			if (segment.x === food.x && segment.y === food.y) {
				return generateFood();
			}
		}
	}

	// Atualização do jogo
	function gameUpdate() {
		if (isPaused) return;

		const head = { x: snake[0].x, y: snake[0].y };

		// Atualizar direção
		direction = nextDirection;

		// Mover a cabeça da cobra na direção atual
		switch (direction) {
			case "up":
				head.y--;
				break;
			case "down":
				head.y++;
				break;
			case "left":
				head.x--;
				break;
			case "right":
				head.x++;
				break;
		}

		// Verificar colisão com as paredes
		if (
			head.x < 0 ||
			head.x >= gridWidth ||
			head.y < 0 ||
			head.y >= gridHeight
		) {
			gameOver();
			return;
		}

		// Verificar colisão com si mesma
		for (let i = 1; i < snake.length; i++) {
			if (head.x === snake[i].x && head.y === snake[i].y) {
				gameOver();
				return;
			}
		}

		// Verificar se comeu a comida
		if (head.x === food.x && head.y === food.y) {
			score += 10;
			scoreElement.textContent = score;

			// Aumentar velocidade a cada 50 pontos
			if (score % 50 === 0 && gameSpeed > 60) {
				gameSpeed -= 10;
				clearInterval(gameLoop);
				gameLoop = setInterval(gameUpdate, gameSpeed);
			}

			generateFood();
		} else {
			// Remover a cauda se não comeu
			snake.pop();
		}

		// Adicionar nova cabeça
		snake.unshift(head);

		// Desenhar o jogo
		drawGame();
	}

	// Desenhar o jogo
	function drawGame() {
		// Limpar canvas
		ctx.fillStyle = "#0F1C17";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		// Desenhar padrão de fundo estilo grama
		drawGrass();

		// Desenhar maçã (substitui a imagem por um círculo vermelho com detalhes)
		drawApple();

		// Desenhar cobra
		drawSnake();
	}

	// Desenhar a maçã diretamente no canvas
	function drawApple() {
		const centerX = food.x * gridSize + gridSize / 2;
		const centerY = food.y * gridSize + gridSize / 2;
		const radius = gridSize / 2 - 2;

		// Desenhar maçã vermelha
		ctx.fillStyle = "#e74c3c";
		ctx.beginPath();
		ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
		ctx.fill();

		// Adicionar brilho
		ctx.fillStyle = "#f5f6fa";
		ctx.beginPath();
		ctx.arc(
			centerX - radius / 2,
			centerY - radius / 2,
			radius / 4,
			0,
			Math.PI * 2,
		);
		ctx.fill();

		// Adicionar talo
		ctx.fillStyle = "#7f8c8d";
		ctx.fillRect(centerX - 1, centerY - radius - 2, 2, 6);

		// Adicionar folha
		ctx.fillStyle = "#2ecc71";
		ctx.beginPath();
		ctx.ellipse(
			centerX + 3,
			centerY - radius,
			4,
			2,
			Math.PI / 4,
			0,
			Math.PI * 2,
		);
		ctx.fill();
	}

	// Desenhar padrão de grama
	function drawGrass() {
		ctx.fillStyle = "#113322";
		ctx.globalAlpha = 0.1;

		for (let x = 0; x < gridWidth; x++) {
			for (let y = 0; y < gridHeight; y++) {
				if ((x + y) % 2 === 0) {
					ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
				}
			}
		}

		ctx.globalAlpha = 1.0;
	}

	// Desenhar a cobra de forma mais realista
	function drawSnake() {
		// Desenhar cada segmento da cobra
		for (let i = 0; i < snake.length; i++) {
			const segment = snake[i];

			// Calcular o raio do segmento (cabeça maior)
			const radius = i === 0 ? gridSize / 2 : gridSize / 2 - 1;

			// Coordenadas do centro do segmento
			const centerX = segment.x * gridSize + gridSize / 2;
			const centerY = segment.y * gridSize + gridSize / 2;

			// Cor base da cobra
			if (i === 0) {
				// Cabeça da cobra
				ctx.fillStyle = "#4cd137";
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
				ctx.fill();

				// Olhos
				ctx.fillStyle = "white";

				// Posição dos olhos depende da direção
				let eyeX1, eyeY1, eyeX2, eyeY2;
				const eyeOffset = gridSize / 5;

				switch (direction) {
					case "up":
						eyeX1 = centerX - eyeOffset;
						eyeY1 = centerY - eyeOffset / 2;
						eyeX2 = centerX + eyeOffset;
						eyeY2 = centerY - eyeOffset / 2;
						break;
					case "down":
						eyeX1 = centerX - eyeOffset;
						eyeY1 = centerY + eyeOffset / 2;
						eyeX2 = centerX + eyeOffset;
						eyeY2 = centerY + eyeOffset / 2;
						break;
					case "left":
						eyeX1 = centerX - eyeOffset / 2;
						eyeY1 = centerY - eyeOffset;
						eyeX2 = centerX - eyeOffset / 2;
						eyeY2 = centerY + eyeOffset;
						break;
					case "right":
						eyeX1 = centerX + eyeOffset / 2;
						eyeY1 = centerY - eyeOffset;
						eyeX2 = centerX + eyeOffset / 2;
						eyeY2 = centerY + eyeOffset;
						break;
				}

				ctx.beginPath();
				ctx.arc(eyeX1, eyeY1, gridSize / 8, 0, Math.PI * 2);
				ctx.arc(eyeX2, eyeY2, gridSize / 8, 0, Math.PI * 2);
				ctx.fill();

				// Pupilas
				ctx.fillStyle = "black";
				ctx.beginPath();
				ctx.arc(eyeX1, eyeY1, gridSize / 16, 0, Math.PI * 2);
				ctx.arc(eyeX2, eyeY2, gridSize / 16, 0, Math.PI * 2);
				ctx.fill();
			} else {
				// Corpo da cobra com padrão de escamas
				const isEven = i % 2 === 0;
				ctx.fillStyle = isEven ? "#44bd32" : "#3c9e2f";

				// Desenhar segmento corpo
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
				ctx.fill();

				// Adicionar padrão de escama
				ctx.fillStyle = isEven ? "#3c9e2f" : "#44bd32";
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius / 2, 0, Math.PI * 2);
				ctx.fill();
			}
		}
	}

	// Game over
	function gameOver() {
		clearInterval(gameLoop);
		isGameRunning = false;

		if (score > highScore) {
			highScore = score;
			highScoreElement.textContent = highScore;
		}

		finalScoreElement.textContent = score;
		gameOverScreen.style.display = "flex";
		startButton.style.display = "block";
	}

	// Event Listeners
	document.addEventListener("keydown", (e) => {
		// Iniciar jogo com espaço quando não estiver rodando
		if (!isGameRunning && (e.key === " " || e.code === "Space")) {
			startGame();
			return;
		}

		// Pausar/Continuar com Espaço quando jogo estiver rodando
		if ((e.key === " " || e.code === "Space") && isGameRunning) {
			isPaused = !isPaused;
			return;
		}

		// Evitar que a cobra volte na direção oposta
		switch (e.key) {
			case "ArrowUp":
				if (direction !== "down") nextDirection = "up";
				break;
			case "ArrowDown":
				if (direction !== "up") nextDirection = "down";
				break;
			case "ArrowLeft":
				if (direction !== "right") nextDirection = "left";
				break;
			case "ArrowRight":
				if (direction !== "left") nextDirection = "right";
				break;
			// Suporte a WASD também
			case "w":
			case "W":
				if (direction !== "down") nextDirection = "up";
				break;
			case "s":
			case "S":
				if (direction !== "up") nextDirection = "down";
				break;
			case "a":
			case "A":
				if (direction !== "right") nextDirection = "left";
				break;
			case "d":
			case "D":
				if (direction !== "left") nextDirection = "right";
				break;
		}
	});

	// Botões de controle
	startButton.addEventListener("click", startGame);
	restartButton.addEventListener("click", startGame);

	// Inicializar o estado do jogo e desenhar o cenário inicial
	initGameState();
});
