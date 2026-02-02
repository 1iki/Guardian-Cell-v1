import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/UI/HUD';
import { GameOverScreen } from './components/UI/GameOverScreen';
import { VictoryScreen } from './components/UI/VictoryScreen';
import { TutorialOverlay } from './components/UI/TutorialOverlay'; // New Import

// Asset Imports for Tutorial
import germSrc from './assets/germ.png';
import greenBackteriSrc from './assets/greenBackteri.png';
import virus1Src from './assets/virus-1.png';
import fruitApelSrc from './assets/fruit-apel.png'; // For Damage Tutorial
import playerRightSrc from './assets/player-right.png'; // For Start Screen
import { GAME_DURATION } from './game/Constants';

function App() {
  const [gameState, setGameState] = useState('START'); // START, PLAYING, GAME_OVER, VICTORY, TUTORIAL, COUNTDOWN
  const [timer, setTimer] = useState(GAME_DURATION);
  const [gameKey, setGameKey] = useState(0); // To force remount of GameCanvas on restart
  const [failMessage, setFailMessage] = useState(null);
  const [failDescription, setFailDescription] = useState(null);

  const [playerName, setPlayerName] = useState('');
  const [showInputMode, setShowInputMode] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [tutorialData, setTutorialData] = useState(null);
  const [tutorialHistory, setTutorialHistory] = useState(new Set());
  const [countdown, setCountdown] = useState(3); // Countdown state

  useEffect(() => {
    const savedName = localStorage.getItem('guardian_player_name');
    if (savedName) {
      setPlayerName(savedName);
    }
    loadLeaderboard();
  }, []);

  // Countdown Logic
  useEffect(() => {
    if (gameState === 'COUNTDOWN' && countdown > 0) {
      const timerId = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timerId);
    } else if (gameState === 'COUNTDOWN' && countdown === 0) {
      startGame();
    }
  }, [gameState, countdown]);

  const loadLeaderboard = () => {
    try {
      const data = JSON.parse(localStorage.getItem('guardian_leaderboard') || '[]');
      setLeaderboardData(data);
    } catch (e) {
      setLeaderboardData([]);
    }
  };

  const saveGameResult = (status, timeRemaining) => {
    const playtime = GAME_DURATION - timeRemaining;
    const newEntry = {
      username: playerName,
      status: status, // 'Berhasil' or 'Gagal'
      playtime: playtime,
      date: new Date().toISOString()
    };

    const currentData = JSON.parse(localStorage.getItem('guardian_leaderboard') || '[]');
    const updatedData = [newEntry, ...currentData].slice(0, 50); // Keep last 50 games
    localStorage.setItem('guardian_leaderboard', JSON.stringify(updatedData));
    setLeaderboardData(updatedData);
  };

  const handleMainButton = () => {
    if (playerName && playerName.trim()) {
      startCountdown();
    } else {
      setShowInputMode(true);
    }
  };

  const handleTutorial = (event) => {
    // Check if already shown
    const tutorialKey = event.type === 'ENEMY' ? `ENEMY_${event.data.type}` : event.type;

    if (tutorialHistory.has(tutorialKey)) return;

    // Add to history
    setTutorialHistory(prev => new Set(prev).add(tutorialKey));

    setGameState('TUTORIAL');

    let data = { header: "⚠️ MUSUH BARU!", title: "INFO", description: "", imageSrc: germSrc };

    if (event.type === 'ENEMY') {
      const enemyConfig = event.data;
      if (enemyConfig.type === 'GERM') {
        data = { header: "⚠️ MUSUH BARU!", title: "KUMAN BIASA", description: "Kuman ini lambat, tapi jangan sampai menyentuhnya!", imageSrc: germSrc };
      } else if (enemyConfig.type.includes('BACTERIA')) {
        data = { header: "⚠️ MUSUH BARU!", title: "BAKTERI", description: "Bakteri ini lebih lincah. Hindari agar tidak terinfeksi!", imageSrc: greenBackteriSrc };
      } else if (enemyConfig.type.includes('VIRUS')) {
        data = { header: "⚠️ MUSUH BARU!", title: "VIRUS BERBAHAYA", description: "Sangat cepat dan agresif! Waspada terhadap serangannya.", imageSrc: virus1Src };
      }
    } else if (event.type === 'DAMAGE') {
      data = {
        header: "⚠️ AWAS TERLUKA!",
        title: "KAMU KEHILANGAN DARAH",
        description: "Makan Makanan Sehat seperti Apel untuk memulihkan nyawa.",
        imageSrc: fruitApelSrc
      };
    } else if (event.type === 'ITEM') {
      data = {
        header: "🍎 MAKANAN SEHAT!",
        title: "NYAM! ENAK SEKALI",
        description: "Makanan sehat memulihkan energimu. Kumpulkan sebanyak-banyaknya!",
        imageSrc: event.data.imgSrc
      };
    }

    setTutorialData(data);
  };

  const closeTutorial = () => {
    setGameState('PLAYING');
    setTutorialData(null);
  };

  const handleStartWithNewName = () => {
    if (!playerName.trim()) {
      alert("Mohon masukkan nama kamu dulu ya! 🖊️");
      return;
    }
    localStorage.setItem('guardian_player_name', playerName);
    startCountdown();
  };

  const startCountdown = () => {
    setGameState('COUNTDOWN');
    setCountdown(3);
    setTimer(GAME_DURATION);
    setGameKey(prev => prev + 1); // Reset Canvas on Countdown start
    setTutorialHistory(new Set());
  };

  const startGame = () => {
    setGameState('PLAYING');
  };

  const handleGameOver = (reason, description) => {
    setGameState('GAME_OVER');
    setFailMessage(reason || "YAH KAMU TELAH TERINFEKSI");
    setFailDescription(description || "Hindari Patogen-Patogen Asing, Lalu Sembuhkan Infeksi");
    saveGameResult('Gagal', timer);
  };

  const handleVictory = () => {
    setGameState('VICTORY');
    saveGameResult('Berhasil', timer);
  };

  const handleBackToInput = () => {
    setPlayerName('');
    localStorage.removeItem('guardian_player_name');
    setShowInputMode(true);
    setGameState('START');
  };

  return (
    <div className="game-container">
      {/* Game Canvas is always mounted to show background/gameplay? 
          Or only when playing? 
          If we want to show the "Start" screen over the game background, we can mount it. */}

      {/* Visual Background for Start Screen if GameCanvas is not active?
          Actually, let's keep GameCanvas mounted but maybe inactive during Start?
          Or just remount it. Using gameKey handles reset.
      */}
      <div className="relative w-full max-w-lg aspect-[9/16] max-h-screen bg-black shadow-2xl overflow-hidden border-4 border-pink-900 rounded-lg">

        {/* Game Canvas Layer */}
        {(gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'VICTORY' || gameState === 'TUTORIAL' || gameState === 'COUNTDOWN') && (
          <GameCanvas
            key={gameKey}
            gameState={gameState}
            onGameOver={handleGameOver}
            onVictory={handleVictory}
            setTimer={setTimer}
            onTutorial={handleTutorial}
          />
        )}
      </div>

      {/* UI Overlay */}
      <div className="ui-overlay">
        {/* HUD - Only show when playing or done */}
        {gameState !== 'START' && (
          <HUD timer={timer} />
        )}

        {gameState === 'START' && (
          <div
            className="absolute inset-0 z-50 flex flex-col items-center justify-center ui-layer text-center p-6 w-full h-full"
            style={{
              background: 'rgba(131, 24, 67, 0.4)', // Translucent Pink
              backdropFilter: 'blur(4px)'
            }}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="p-6 rounded-[3rem] border-8 border-pink-400/50 shadow-[0_20px_60px_rgba(190,24,93,0.5)] relative overflow-hidden w-full max-w-sm mx-4 bg-pink-500/80 backdrop-blur-md"
            >
              {/* Logo/Title Area */}
              <div className="mb-4 relative">
                <motion.h1
                  className="text-6xl text-white font-black tracking-wider drop-shadow-lg"
                  style={{
                    textShadow: "4px 4px 0px #be185d, -2px -2px 0px #f9a8d4",
                    WebkitTextStroke: "3px #831843"
                  }}
                  animate={{ rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  GUARDIAN
                </motion.h1>
                <motion.h1
                  className="text-7xl text-cyan-300 font-black tracking-wider drop-shadow-lg -mt-4"
                  style={{
                    textShadow: "4px 4px 0px #0e7490, -2px -2px 0px #a5f3fc",
                    WebkitTextStroke: "3px #155e75"
                  }}
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  CELL
                </motion.h1>
              </div>

              {/* Character Placeholder / Icon */}
              <motion.div
                className="w-24 h-24 bg-cyan-100 rounded-full mx-auto mb-4 border-4 border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.6)] flex items-center justify-center text-5xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              >
                <img src={playerRightSrc} alt="Guardian Cell" className="w-16 h-16 object-contain drop-shadow-md" />
              </motion.div>

              <div className="bg-white/90 p-6 rounded-3xl border-b-8 border-pink-200 mb-4 shadow-xl">
                <p className="text-pink-600 text-xl leading-relaxed font-bold">
                  {showInputMode ? "Siapa nama pahlawan ini?" : "Jadilah Pahlawan dalam Tubuh!"}
                  <br />
                  {!showInputMode && <span className="text-base text-pink-500 font-medium">Geser untuk bergerak & Lawan Virus!</span>}
                </p>
              </div>

              {showInputMode ? (
                <div className="w-full animate-fade-in">
                  <div className="mb-4 w-full relative">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value.slice(0, 13))}
                      placeholder="Masukkan Namamu..."
                      maxLength={13}
                      className="w-full px-6 py-3 rounded-full text-center text-pink-600 font-bold text-xl border-4 border-white/50 focus:border-white focus:outline-none bg-white/80 placeholder-pink-300 shadow-inner"
                      autoFocus
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-pink-400 font-bold">
                      {playerName.length}/13
                    </div>
                  </div>
                  <motion.button
                    onClick={handleStartWithNewName}
                    className="w-full py-4 bg-gradient-to-tr from-green-400 to-green-500 text-white text-3xl font-black rounded-full shadow-[0_10px_0_#15803d] active:shadow-none active:translate-y-2 transition-all border-4 border-white/30 relative z-10 group mb-4"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="drop-shadow-md">MULAI! 🚀</span>
                  </motion.button>
                  <button
                    onClick={() => setShowInputMode(false)}
                    className="text-white font-bold text-lg hover:text-pink-200 underline"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <div className="w-full">
                  <div className="flex items-center justify-center gap-4">
                    {/* Back / Reset Button */}
                    <motion.button
                      onClick={handleBackToInput}
                      className="w-16 h-16 bg-white/20 text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-lg"
                      whileHover={{ scale: 1.1, backgroundColor: "rgba(255,255,255,0.3)" }}
                      whileTap={{ scale: 0.9 }}
                      title="Ganti Nama"
                    >
                      <span className="text-3xl">↩️</span>
                    </motion.button>

                    {/* Play Button */}
                    <motion.button
                      onClick={handleMainButton}
                      className="w-24 h-24 bg-gradient-to-tr from-green-400 to-green-500 text-white rounded-full shadow-[0_10px_0_#15803d] active:shadow-none active:translate-y-2 transition-all border-4 border-white/30 relative z-10 group flex items-center justify-center"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-5xl drop-shadow-md ml-2">▶️</span>
                      <div className="absolute inset-0 rounded-full bg-white/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.button>

                    {/* Leaderboard Button */}
                    <motion.button
                      onClick={() => setShowLeaderboard(true)}
                      className="w-16 h-16 bg-yellow-400 text-white rounded-full flex items-center justify-center border-4 border-white/30 shadow-[0_4px_0_#b45309] active:shadow-none active:translate-y-1"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Peringkat"
                    >
                      <span className="text-3xl">🏆</span>
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>

            <p className="mt-8 text-white/50 text-sm font-medium">Erlangga STEM v1.0</p>
          </div>
        )}

        {/* Leaderboard Overlay */}
        {showLeaderboard && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-pink-900/95 backdrop-blur-md p-6 animate-fade-in pointer-events-auto">
            <h2 className="text-4xl text-yellow-400 font-black mb-8 drop-shadow-[0_4px_0_rgba(0,0,0,0.3)] tracking-wide">
              🏆 RIWAYAT
            </h2>

            <div className="w-full max-w-md bg-white/10 border-4 border-white/20 rounded-3xl p-4 mb-8 shadow-2xl overflow-y-auto max-h-[60vh]">
              {/* Header */}
              <div className="grid grid-cols-3 gap-2 mb-4 px-2 text-pink-200 font-bold text-sm uppercase tracking-wider border-b border-white/10 pb-2">
                <div>Player</div>
                <div className="text-center">Status</div>
                <div className="text-right">Waktu</div>
              </div>

              {/* Data List */}
              {leaderboardData.length === 0 ? (
                <div className="text-center text-white/50 py-8 italic">Belum ada riwayat permainan</div>
              ) : (
                leaderboardData.map((entry, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 items-center py-3 border-b border-white/10 last:border-0 text-white">
                    <div className="font-bold truncate">{entry.username}</div>
                    <div className={`text-center font-bold px-2 py-1 rounded-full text-xs ${entry.status === 'Berhasil' ? 'bg-green-500/50 text-green-100' : 'bg-red-500/50 text-red-100'}`}>
                      {entry.status}
                    </div>
                    <div className="text-right font-mono text-yellow-300">
                      {typeof entry.playtime === 'number' ? entry.playtime.toFixed(1) : entry.playtime}s
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowLeaderboard(false)}
              className="px-8 py-3 bg-white text-pink-600 rounded-full font-black text-xl shadow-[0_6px_0_#e2e8f0] active:shadow-none active:translate-y-1 transition-all flex items-center gap-2 hover:bg-gray-50"
            >
              <span>🔙</span> KEMBALI
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {/* Game Over Screen */}
        {/* Game Over Screen */}
        {gameState === 'GAME_OVER' && (
          <GameOverScreen
            onRestart={startCountdown}
            message={failMessage}
            description={failDescription}
            onBack={handleBackToInput}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {/* Victory Screen */}
        {gameState === 'VICTORY' && (
          <VictoryScreen
            onRestart={startCountdown}
            onBack={handleBackToInput}
            onShowLeaderboard={() => setShowLeaderboard(true)}
          />
        )}

        {/* Countdown Overlay */}
        {gameState === 'COUNTDOWN' && (
          <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm pointer-events-none">
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 1 }}
              exit={{ scale: 2, opacity: 0 }}
              className="text-9xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            >
              {countdown}
            </motion.div>
          </div>
        )}

        {/* Tutorial Overlay */}
        {gameState === 'TUTORIAL' && tutorialData && (
          <TutorialOverlay
            header={tutorialData.header}
            title={tutorialData.title}
            description={tutorialData.description}
            imageSrc={tutorialData.imageSrc}
            onContinue={closeTutorial}
          />
        )}
      </div>
    </div>
  );
}

export default App;
