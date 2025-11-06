"use client";
import { useState, useEffect } from "react";
import GlobalNavigation from "@/components/GlobalNavigation";

export default function SundayLogic() {
  const [battery, setBattery] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [gameState, setGameState] = useState<'playing' | 'gameOver'>('playing');
  const [faceState, setFaceState] = useState<'neutral' | 'happy' | 'sad'>('neutral');
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [timerActive, setTimerActive] = useState(true);

  // Question generator with progressive difficulty
  const generateQuestion = () => {
    const types = ['addition', 'subtraction', 'multiplication', 'division', 'logic'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let question, answer;
    
    // Difficulty multipliers based on level
    const maxNum = Math.min(20 + (level * 10), 100); // Cap at 100
    const minNum = Math.max(1, level - 1);
    
    switch (type) {
      case 'addition':
        const a = Math.floor(Math.random() * maxNum) + minNum;
        const b = Math.floor(Math.random() * maxNum) + minNum;
        question = `${a} + ${b} = ?`;
        answer = a + b;
        break;
        
      case 'subtraction':
        const c = Math.floor(Math.random() * maxNum) + (maxNum * 0.5);
        const d = Math.floor(Math.random() * (maxNum * 0.3)) + minNum;
        question = `${c} - ${d} = ?`;
        answer = c - d;
        break;
        
      case 'multiplication':
        const e = Math.floor(Math.random() * Math.min(12 + level, 20)) + 1;
        const f = Math.floor(Math.random() * Math.min(12 + level, 20)) + 1;
        question = `${e} × ${f} = ?`;
        answer = e * f;
        break;
        
      case 'division':
        const g = Math.floor(Math.random() * Math.min(10 + level, 15)) + 2;
        const h = Math.floor(Math.random() * Math.min(10 + level, 15)) + 2;
        const product = g * h;
        question = `${product} ÷ ${g} = ?`;
        answer = h;
        break;
        
      case 'logic':
        const logicQuestions = [
          // Easy logic (Level 1-2)
          { q: "What comes after 7?", a: 8 },
          { q: "How many sides does a triangle have?", a: 3 },
          { q: "What is 2 + 2?", a: 4 },
          { q: "How many wheels does a bicycle have?", a: 2 },
          { q: "What is 10 - 5?", a: 5 },
          
          // Medium logic (Level 3-5)
          { q: "What is 15 + 25?", a: 40 },
          { q: "How many sides does a hexagon have?", a: 6 },
          { q: "What is 7 × 8?", a: 56 },
          { q: "What is 100 ÷ 4?", a: 25 },
          { q: "What comes after 99?", a: 100 },
          
          // Hard logic (Level 6+)
          { q: "What is 23 + 47?", a: 70 },
          { q: "How many sides does a dodecagon have?", a: 12 },
          { q: "What is 13 × 7?", a: 91 },
          { q: "What is 144 ÷ 12?", a: 12 },
          { q: "What is the next number: 2, 4, 8, 16, ?", a: 32 }
        ];
        
        // Select questions based on level
        let availableQuestions = logicQuestions;
        if (level >= 3) {
          availableQuestions = logicQuestions.slice(5, 10);
        }
        if (level >= 6) {
          availableQuestions = logicQuestions.slice(10);
        }
        
        const logic = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        question = logic.q;
        answer = logic.a;
        break;
    }
    
    return { question, answer, type, difficulty: level };
  };

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerActive && timeLeft > 0 && gameState === 'playing') {
      interval = setInterval(() => {
        setTimeLeft(timeLeft => {
          if (timeLeft <= 1) {
            // Time's up! Treat as wrong answer
            handleTimeUp();
            return 0;
          }
          return timeLeft - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, gameState]);

  // Handle time up
  const handleTimeUp = () => {
    setTimerActive(false);
    setBattery(prev => Math.max(0, prev - 15)); // More penalty for time up
    setStreak(0);
    setFaceState('sad');
    
    // Play error sound
    playSound('error');
    
    // Check game over
    if (battery <= 15) {
      setGameState('gameOver');
    } else {
      // Generate next question after delay
      setTimeout(() => {
        setCurrentQuestion(generateQuestion());
        setUserAnswer("");
        setFaceState('neutral');
        setTimeLeft(Math.max(15, 30 - (level * 2))); // Timer gets shorter as level increases
        setTimerActive(true);
      }, 1500);
    }
  };

  // Initialize first question
  useEffect(() => {
    setCurrentQuestion(generateQuestion());
  }, []);

  // Handle answer submission
  const handleSubmit = () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    const userNum = parseInt(userAnswer);
    const isCorrect = userNum === currentQuestion.answer;
    
    if (isCorrect) {
      // Correct answer
      const newStreak = streak + 1;
      const newScore = score + 1;
      
      setBattery(prev => Math.min(100, prev + 10));
      setScore(newScore);
      setStreak(newStreak);
      setFaceState('happy');
      
      // Level up every 5 correct answers
      if (newStreak % 5 === 0) {
        setLevel(prev => prev + 1);
        // Extra battery boost for leveling up
        setBattery(prev => Math.min(100, prev + 15));
      }
      
      // Play success sound (placeholder)
      playSound('success');
      
      // Generate next question after delay
      setTimeout(() => {
        setCurrentQuestion(generateQuestion());
        setUserAnswer("");
        setFaceState('neutral');
        setTimeLeft(Math.max(15, 30 - (level * 2))); // Timer gets shorter as level increases
        setTimerActive(true);
      }, 1500);
      
    } else {
      // Wrong answer
      setBattery(prev => Math.max(0, prev - 10));
      setStreak(0);
      setFaceState('sad');
      
      // Play error sound (placeholder)
      playSound('error');
      
      // Check game over
      if (battery <= 10) {
        setGameState('gameOver');
      } else {
        // Generate next question after delay
        setTimeout(() => {
          setCurrentQuestion(generateQuestion());
          setUserAnswer("");
          setFaceState('neutral');
          setTimeLeft(Math.max(15, 30 - (level * 2))); // Timer gets shorter as level increases
          setTimerActive(true);
        }, 1500);
      }
    }
  };

  // Placeholder sound function
  const playSound = (type: 'success' | 'error') => {
    // In a real implementation, you'd play actual audio files
    console.log(`Playing ${type} sound`);
  };

  // Restart game
  const restartGame = () => {
    setBattery(50);
    setScore(0);
    setStreak(0);
    setLevel(1);
    setGameState('playing');
    setFaceState('neutral');
    setCurrentQuestion(generateQuestion());
    setUserAnswer("");
    setTimeLeft(30);
    setTimerActive(true);
  };

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <GlobalNavigation />
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-amber-800 mb-2">Sunday Logic</h1>
          <p className="text-amber-600">Help Sunday recharge by solving math problems!</p>
        </div>

        {/* Game Container */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-amber-200">
          
          {/* Battery Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Sunday's Battery</span>
              <span className="text-sm font-bold text-gray-800">{battery}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 rounded-full ${
                  battery > 70 ? 'bg-green-400' : 
                  battery > 30 ? 'bg-yellow-400' : 'bg-red-400'
                }`}
                style={{ width: `${battery}%` }}
              />
            </div>
          </div>

                  {/* Stats */}
                  <div className="flex justify-between mb-8 text-center">
                    <div className="bg-amber-50 rounded-xl p-4 flex-1 mr-1">
                      <div className="text-2xl font-bold text-amber-700">{score}</div>
                      <div className="text-sm text-amber-600">Score</div>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 flex-1 mx-1">
                      <div className="text-2xl font-bold text-green-700">{streak}</div>
                      <div className="text-sm text-green-600">Streak</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 flex-1 ml-1">
                      <div className="text-2xl font-bold text-purple-700">Level {level}</div>
                      <div className="text-sm text-purple-600">Difficulty</div>
                    </div>
                  </div>

          {/* Sunday's Face */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              {/* Custom Robot Head with Animated Overlays */}
              <div className="sunday-face-container">
                <div className="relative">
                  {/* Main robot head image */}
                  <img 
                    src="/assets/sunday-robot-head.png" 
                    alt="Sunday Robot" 
                    className="sunday-robot-head"
                  />
                  
                  {/* Animated Eyes */}
                  <div className="absolute inset-0">
                    {/* Left Eye */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-10 -translate-y-2 w-6 h-6">
                      <div className={`eye-left ${faceState === 'happy' ? 'eye-happy' : faceState === 'sad' ? 'eye-sad' : 'eye-neutral'} blink`}>
                        <div className="eye-pupil"></div>
                        <div className="eye-highlight"></div>
                      </div>
                    </div>
                    
                    {/* Right Eye */}
                    <div className="absolute left-1/2 top-1/2 transform translate-x-4 -translate-y-2 w-6 h-6">
                      <div className={`eye-right ${faceState === 'happy' ? 'eye-happy' : faceState === 'sad' ? 'eye-sad' : 'eye-neutral'} blink`}>
                        <div className="eye-pupil"></div>
                        <div className="eye-highlight"></div>
                      </div>
                    </div>
                    
                    {/* Blush (only when happy) */}
                    {faceState === 'happy' && (
                      <>
                        <div className="absolute left-1/2 top-1/2 transform -translate-x-12 translate-y-2 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
                        <div className="absolute left-1/2 top-1/2 transform translate-x-10 translate-y-2 w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-pulse"></div>
                      </>
                    )}
                    
                    {/* Mouth Expression */}
                    <div className="absolute left-1/2 top-2/3 transform -translate-x-1/2">
                      <div className={`mouth ${faceState === 'happy' ? 'mouth-happy' : faceState === 'sad' ? 'mouth-sad' : 'mouth-neutral'}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Question Box */}
          {gameState === 'playing' && currentQuestion && (
            <div className="text-center mb-8">
              <div className="bg-amber-50 rounded-2xl p-6 mb-6 border-2 border-amber-200">
                <h2 className="text-2xl font-bold text-amber-800 mb-2">Question</h2>
                <p className="text-3xl font-bold text-gray-800 mb-4">{currentQuestion.question}</p>
                
                {/* Timer Display */}
                <div className="flex justify-center items-center gap-4">
                  <div className={`text-2xl font-bold ${timeLeft <= 10 ? 'text-red-600 animate-pulse' : timeLeft <= 20 ? 'text-orange-500' : 'text-green-600'}`}>
                    ⏰ {timeLeft}s
                  </div>
                  <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 rounded-full ${
                        timeLeft <= 10 ? 'bg-red-500' : 
                        timeLeft <= 20 ? 'bg-orange-400' : 'bg-green-500'
                      }`}
                      style={{ width: `${(timeLeft / 30) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Answer Input */}
              <div className="flex gap-4 justify-center items-center">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Your answer..."
                  className="text-2xl text-center border-2 border-amber-300 rounded-xl px-6 py-4 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  autoFocus
                />
                <button
                  onClick={handleSubmit}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  Submit
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen */}
          {gameState === 'gameOver' && (
            <div className="text-center">
              <div className="bg-red-50 rounded-2xl p-8 mb-6 border-2 border-red-200">
                <h2 className="text-3xl font-bold text-red-800 mb-4">Game Over!</h2>
                <p className="text-xl text-red-600 mb-2">Sunday's battery ran out!</p>
                <p className="text-lg text-gray-600">Final Score: {score}</p>
              </div>
              <button
                onClick={restartGame}
                className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                Restart Game
              </button>
            </div>
          )}

        </div>
      </div>

              <style jsx>{`
                .sunday-face-container {
                  display: inline-block;
                  padding: 16px 20px;
                  border-radius: 20px;
                  background: #f6efe6;
                  box-shadow: 0 10px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.6);
                  user-select: none;
                  animation: bob 3s ease-in-out infinite;
                }

                .sunday-robot-head {
                  width: 200px;
                  height: 200px;
                  object-fit: contain;
                  display: block;
                }

                @keyframes bob {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(2.5px); }
                }

                /* Eye Animations */
                .eye-left, .eye-right {
                  width: 24px;
                  height: 24px;
                  border-radius: 50%;
                  position: relative;
                  transform-origin: center;
                  animation: blink 4.5s infinite;
                }

                .eye-neutral {
                  background: #8de1ff;
                }

                .eye-happy {
                  background: #9fe870;
                  animation: happyBlink 4.5s infinite;
                }

                .eye-sad {
                  background: #ff9aa2;
                  animation: sadBlink 4.5s infinite;
                }

                .eye-pupil {
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 8px;
                  height: 8px;
                  border-radius: 50%;
                  background: #c8f3ff;
                }

                .eye-highlight {
                  position: absolute;
                  top: 20%;
                  left: 30%;
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  background: #ffffff;
                  opacity: 0.9;
                }

                @keyframes blink {
                  0%, 92%, 100% { transform: scaleY(1); }
                  94% { transform: scaleY(0.15); }
                  96% { transform: scaleY(1); }
                }

                @keyframes happyBlink {
                  0%, 92%, 100% { transform: scaleY(1) scaleX(1); }
                  94% { transform: scaleY(0.15) scaleX(1.1); }
                  96% { transform: scaleY(1) scaleX(1); }
                }

                @keyframes sadBlink {
                  0%, 92%, 100% { transform: scaleY(1) scaleX(1); }
                  94% { transform: scaleY(0.15) scaleX(0.9); }
                  96% { transform: scaleY(1) scaleX(1); }
                }

                /* Mouth Animations */
                .mouth {
                  width: 40px;
                  height: 20px;
                  position: relative;
                }

                .mouth-neutral::after {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 30px;
                  height: 3px;
                  background: #8de1ff;
                  border-radius: 2px;
                }

                .mouth-happy::after {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 30px;
                  height: 15px;
                  border: 3px solid #9fe870;
                  border-top: none;
                  border-radius: 0 0 15px 15px;
                  background: transparent;
                }

                .mouth-sad::after {
                  content: '';
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%);
                  width: 30px;
                  height: 15px;
                  border: 3px solid #ff9aa2;
                  border-bottom: none;
                  border-radius: 15px 15px 0 0;
                  background: transparent;
                }

                @media (max-width: 420px) {
                  .sunday-robot-head { width: 160px; height: 160px; }
                }
              `}</style>
    </div>
  );
}
