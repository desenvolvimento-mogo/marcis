import React, { useState, useEffect, useRef } from 'react';
import { Upload, Play, RotateCcw } from 'lucide-react';

const CorridaApe = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('menu'); // menu, playing, finished
  const [playerImage, setPlayerImage] = useState(null);
  const [score, setScore] = useState(0);
  const [gameTime, setGameTime] = useState(0);
  const animationRef = useRef(null);
  const gameDataRef = useRef({
    playerY: 200,
    playerVelocity: 0,
    obstacles: [],
    background: 0,
    trees: [],
    clouds: [],
    distance: 0,
    jumpPower: -12,
    gravity: 0.6,
    speed: 5,
    isJumping: false
  });

  const GAME_DURATION = 60; // 60 segundos
  const DISTANCE_TO_CURITIBA = 500; // km fictícios

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const game = gameDataRef.current;

    // Inicializar elementos do cenário
    if (game.trees.length === 0) {
      for (let i = 0; i < 10; i++) {
        game.trees.push({
          x: i * 200,
          height: 60 + Math.random() * 40,
          type: Math.random() > 0.5 ? 'pine' : 'round'
        });
      }
    }

    if (game.clouds.length === 0) {
      for (let i = 0; i < 5; i++) {
        game.clouds.push({
          x: Math.random() * 800,
          y: 30 + Math.random() * 80,
          size: 40 + Math.random() * 30,
          speed: 0.5 + Math.random() * 0.5
        });
      }
    }

    const drawBackground = () => {
      // Céu com gradiente
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#E0F6FF');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 800, 400);

      // Nuvens
      game.clouds.forEach(cloud => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.beginPath();
        ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 0.6, cloud.y, cloud.size * 0.8, 0, Math.PI * 2);
        ctx.arc(cloud.x + cloud.size * 1.2, cloud.y, cloud.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      });

      // Montanhas distantes
      ctx.fillStyle = '#9370DB';
      ctx.beginPath();
      ctx.moveTo(-50 + (game.background * 0.3) % 900, 280);
      ctx.lineTo(100 + (game.background * 0.3) % 900, 200);
      ctx.lineTo(250 + (game.background * 0.3) % 900, 250);
      ctx.lineTo(400 + (game.background * 0.3) % 900, 180);
      ctx.lineTo(550 + (game.background * 0.3) % 900, 240);
      ctx.lineTo(700 + (game.background * 0.3) % 900, 200);
      ctx.lineTo(850 + (game.background * 0.3) % 900, 280);
      ctx.lineTo(850, 400);
      ctx.lineTo(-50, 400);
      ctx.fill();

      // Chão - estrada
      ctx.fillStyle = '#5A5A5A';
      ctx.fillRect(0, 320, 800, 80);

      // Linhas da estrada
      ctx.fillStyle = '#FFD700';
      for (let i = 0; i < 10; i++) {
        const x = (i * 100 + game.background * 1.5) % 900 - 50;
        ctx.fillRect(x, 355, 60, 6);
      }

      // Grama nas laterais
      ctx.fillStyle = '#228B22';
      ctx.fillRect(0, 280, 800, 40);
      ctx.fillRect(0, 400, 800, 50);

      // Árvores
      game.trees.forEach(tree => {
        const treeX = (tree.x - game.background * 0.8) % 1000;
        if (treeX > -100 && treeX < 900) {
          if (tree.type === 'pine') {
            // Pinheiro
            ctx.fillStyle = '#654321';
            ctx.fillRect(treeX - 8, 280 - tree.height, 16, tree.height);
            ctx.fillStyle = '#0F5B0F';
            ctx.beginPath();
            ctx.moveTo(treeX, 280 - tree.height);
            ctx.lineTo(treeX - 30, 280 - tree.height + 40);
            ctx.lineTo(treeX + 30, 280 - tree.height + 40);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(treeX, 280 - tree.height + 20);
            ctx.lineTo(treeX - 25, 280 - tree.height + 55);
            ctx.lineTo(treeX + 25, 280 - tree.height + 55);
            ctx.fill();
          } else {
            // Árvore redonda
            ctx.fillStyle = '#654321';
            ctx.fillRect(treeX - 6, 280 - tree.height, 12, tree.height);
            ctx.fillStyle = '#228B22';
            ctx.beginPath();
            ctx.arc(treeX, 280 - tree.height, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(treeX - 15, 280 - tree.height + 10, 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(treeX + 15, 280 - tree.height + 10, 20, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };

    const drawPlayer = () => {
      const x = 150;
      const y = game.playerY;

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(x + 10, 315, 25, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Corpo (pernas e braços em movimento)
      const bounce = Math.sin(Date.now() / 100) * 5;
      
      // Pernas
      ctx.fillStyle = '#2C5F8D';
      ctx.fillRect(x - 8, y + 20, 10, 25);
      ctx.fillRect(x + 8, y + 20 + bounce, 10, 25 - bounce);

      // Corpo
      ctx.fillStyle = '#FF6B6B';
      ctx.beginPath();
      ctx.roundRect(x - 15, y, 40, 35, 8);
      ctx.fill();

      // Braços
      ctx.fillStyle = '#FFD93D';
      ctx.beginPath();
      ctx.arc(x - 18, y + 15 - bounce, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 28, y + 15 + bounce, 8, 0, Math.PI * 2);
      ctx.fill();

      // Cabeça personalizada ou padrão
      if (playerImage) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x + 10, y - 15, 22, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(playerImage, x - 12, y - 37, 44, 44);
        ctx.restore();
      } else {
        // Cabeça padrão
        ctx.fillStyle = '#FFD1A4';
        ctx.beginPath();
        ctx.arc(x + 10, y - 15, 22, 0, Math.PI * 2);
        ctx.fill();

        // Olhos
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + 5, y - 18, 3, 0, Math.PI * 2);
        ctx.arc(x + 15, y - 18, 3, 0, Math.PI * 2);
        ctx.fill();

        // Boca sorrindo
        ctx.beginPath();
        ctx.arc(x + 10, y - 12, 8, 0, Math.PI);
        ctx.stroke();
      }
    };

    const drawObstacles = () => {
      game.obstacles.forEach(obs => {
        if (obs.type === 'cone') {
          // Cone de trânsito
          ctx.fillStyle = '#FF6600';
          ctx.beginPath();
          ctx.moveTo(obs.x, 305);
          ctx.lineTo(obs.x - 20, 335);
          ctx.lineTo(obs.x + 20, 335);
          ctx.fill();
          
          ctx.fillStyle = '#FFF';
          ctx.fillRect(obs.x - 15, 315, 30, 5);
          ctx.fillRect(obs.x - 12, 325, 24, 5);
        } else if (obs.type === 'rock') {
          // Pedra
          ctx.fillStyle = '#696969';
          ctx.beginPath();
          ctx.ellipse(obs.x, 325, 25, 15, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#505050';
          ctx.beginPath();
          ctx.ellipse(obs.x - 5, 322, 18, 12, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Placa
          ctx.fillStyle = '#654321';
          ctx.fillRect(obs.x - 3, 280, 6, 55);
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(obs.x - 20, 280, 40, 30);
          ctx.fillStyle = '#000';
          ctx.font = 'bold 16px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('CTB', obs.x, 300);
        }
      });
    };

    const drawUI = () => {
      // Distância percorrida
      const progress = (game.distance / DISTANCE_TO_CURITIBA) * 100;
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(20, 20, 300, 60);
      
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'left';
      ctx.fillText(`Pato Branco → Curitiba`, 30, 45);
      
      ctx.fillStyle = '#4CAF50';
      ctx.fillRect(30, 55, 280, 15);
      ctx.fillStyle = '#FFD700';
      ctx.fillRect(30, 55, progress * 2.8, 15);
      
      ctx.fillStyle = '#FFF';
      ctx.font = '14px Arial';
      ctx.fillText(`${Math.floor(game.distance)} / ${DISTANCE_TO_CURITIBA} km`, 30, 50);

      // Tempo
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(680, 20, 100, 40);
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 20px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.floor(gameTime)}s`, 770, 48);
    };

    const checkCollision = () => {
      const playerLeft = 135;
      const playerRight = 185;
      const playerTop = game.playerY - 35;
      const playerBottom = game.playerY + 45;

      for (let obs of game.obstacles) {
        const obsLeft = obs.x - 22;
        const obsRight = obs.x + 22;
        const obsTop = 310;
        const obsBottom = 335;

        // Verifica se há sobreposição nos eixos X e Y
        const collisionX = playerRight > obsLeft && playerLeft < obsRight;
        const collisionY = playerBottom > obsTop && playerTop < obsBottom;

        if (collisionX && collisionY) {
          return true;
        }
      }
      return false;
    };

    const gameLoop = () => {
      if (gameState !== 'playing') return;

      ctx.clearRect(0, 0, 800, 450);
      drawBackground();
      drawObstacles();
      drawPlayer();
      drawUI();

      // Física do jogador
      game.playerVelocity += game.gravity;
      game.playerY += game.playerVelocity;

      if (game.playerY > 270) {
        game.playerY = 270;
        game.playerVelocity = 0;
        game.isJumping = false;
      }

      // Movimentar background
      game.background += game.speed;
      game.distance += game.speed / 100;

      // Movimentar nuvens
      game.clouds.forEach(cloud => {
        cloud.x -= cloud.speed;
        if (cloud.x < -100) cloud.x = 900;
      });

      // Gerar obstáculos
      if (game.obstacles.length === 0 || game.obstacles[game.obstacles.length - 1].x < 250) {
        const types = ['cone', 'rock', 'sign'];
        game.obstacles.push({
          x: 850,
          type: types[Math.floor(Math.random() * types.length)]
        });
      }

      // Movimentar obstáculos
      game.obstacles = game.obstacles.filter(obs => {
        obs.x -= game.speed;
        return obs.x > -50;
      });

      // Verificar colisão
      if (checkCollision()) {
        setGameState('finished');
        setScore(Math.floor(game.distance));
        return;
      }

      // Verificar vitória
      if (game.distance >= DISTANCE_TO_CURITIBA) {
        setGameState('finished');
        setScore(DISTANCE_TO_CURITIBA);
        return;
      }

      animationRef.current = requestAnimationFrame(gameLoop);
    };

    if (gameState === 'playing') {
      gameLoop();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, playerImage, gameTime]);

  useEffect(() => {
    let interval;
    if (gameState === 'playing') {
      interval = setInterval(() => {
        setGameTime(prev => {
          if (prev >= GAME_DURATION) {
            setGameState('finished');
            setScore(Math.floor(gameDataRef.current.distance));
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameState]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => setPlayerImage(img);
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const startGame = () => {
    gameDataRef.current = {
      playerY: 270,
      playerVelocity: 0,
      obstacles: [],
      background: 0,
      trees: gameDataRef.current.trees,
      clouds: gameDataRef.current.clouds,
      distance: 0,
      jumpPower: -13,
      gravity: 0.4,
      speed: 2.5,
      isJumping: false
    };
    setGameTime(0);
    setGameState('playing');
  };

  const handleJump = () => {
    if (gameState === 'playing' && !gameDataRef.current.isJumping && gameDataRef.current.playerY >= 270) {
      gameDataRef.current.playerVelocity = gameDataRef.current.jumpPower;
      gameDataRef.current.isJumping = true;
    }
  };

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleJump();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-400 to-green-300 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-blue-600">
          🏃‍♂️ Corrida Apé
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Pato Branco → Curitiba • 500 km em 60 segundos!
        </p>

        {gameState === 'menu' && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <label className="flex flex-col items-center cursor-pointer">
                <Upload className="w-12 h-12 text-blue-500 mb-2" />
                <span className="text-lg font-semibold mb-2">
                  Envie uma foto PNG para a cabeça do personagem
                </span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button className="mt-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">
                  Escolher Imagem
                </button>
              </label>
              {playerImage && (
                <p className="text-center text-green-600 mt-3 font-semibold">
                  ✓ Imagem carregada!
                </p>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-200">
              <h3 className="font-bold mb-2">📋 Como Jogar:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Pressione <kbd className="px-2 py-1 bg-gray-200 rounded">ESPAÇO</kbd> ou clique para pular</li>
                <li>• Desvie dos obstáculos (cones, pedras, placas)</li>
                <li>• Chegue em Curitiba em 60 segundos!</li>
              </ul>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-xl rounded-lg transition flex items-center justify-center gap-2"
            >
              <Play className="w-6 h-6" />
              Começar Corrida!
            </button>
          </div>
        )}

        {(gameState === 'playing' || gameState === 'finished') && (
          <div className="space-y-4">
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onClick={handleJump}
              className="border-4 border-blue-300 rounded-lg cursor-pointer w-full"
              style={{ maxWidth: '800px', height: 'auto' }}
            />
            
            {gameState === 'finished' && (
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 p-6 rounded-lg text-center">
                <h2 className="text-3xl font-bold text-white mb-4">
                  {score >= DISTANCE_TO_CURITIBA ? '🎉 Você chegou em Curitiba!' : '😅 Quase lá!'}
                </h2>
                <p className="text-xl text-white mb-4">
                  Distância percorrida: <span className="font-bold">{score} km</span>
                </p>
                <button
                  onClick={startGame}
                  className="px-8 py-3 bg-white text-orange-500 font-bold rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-2 mx-auto"
                >
                  <RotateCcw className="w-5 h-5" />
                  Jogar Novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CorridaApe;