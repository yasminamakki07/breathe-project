import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

function BreathingPage({ user, setUser }) {
  const phases = ["Inhale", "Hold", "Exhale"];

  const [selectedSeconds, setSelectedSeconds] = useState(null);
  const [selectedRounds, setSelectedRounds] = useState(null);

  const [phaseIndex, setPhaseIndex] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [round, setRound] = useState(1);

  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [finished, setFinished] = useState(false);

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingMessage, setLoadingMessage] = useState(false);

  useEffect(() => {
    if (!started || paused || finished) return;

    const timeout = setTimeout(() => {
      if (seconds > 1) {
        setSeconds(seconds - 1);
        return;
      }

      if (phaseIndex === 0) {
        setPhaseIndex(1);
        setSeconds(selectedSeconds);
        return;
      }

      if (phaseIndex === 1) {
        setPhaseIndex(2);
        setSeconds(selectedSeconds);
        return;
      }

      if (phaseIndex === 2) {
        if (round < selectedRounds) {
          setRound(round + 1);
          setPhaseIndex(0);
          setSeconds(selectedSeconds);
        } else {
          setFinished(true);
          setSeconds(0);
        }
      }
    }, 1000);

    return () => clearTimeout(timeout);
  }, [
    started,
    paused,
    finished,
    seconds,
    phaseIndex,
    round,
    selectedSeconds,
    selectedRounds,
  ]);

  const handleStart = () => {
    if (!selectedSeconds || !selectedRounds) return;

    setStarted(true);
    setPaused(false);
    setFinished(false);
    setSelectedAnswer(null);
    setMessage("");
    setPhaseIndex(0);
    setRound(1);
    setSeconds(selectedSeconds);
  };

  const handlePause = () => {
    setPaused(true);
  };

  const handleResume = () => {
    setPaused(false);
  };

  const handleReset = () => {
    setStarted(false);
    setPaused(false);
    setFinished(false);
    setSelectedAnswer(null);
    setMessage("");
    setPhaseIndex(0);
    setRound(1);
    setSeconds(0);
    setLoadingMessage(false);
  };

  const handleAnswer = async (answer) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    setLoadingMessage(true);

    try {
      const messageRes = await axios.post("https://breathe-project-production.up.railway.app", {
        user_answer: answer,
      });

      const aiMessage = messageRes.data.ai_message;
      setMessage(aiMessage);

      const now = new Date();
      const sessionData = {
        user_id: user.user_id,
        session_date: now.toISOString().split("T")[0],
        session_time: now.toTimeString().split(" ")[0],
        user_answer: answer,
        ai_message: aiMessage,
        progress_score: answer ? 1 : 0,
      };

      await axios.post("http://localhost:5000/api/sessions/save", sessionData);
    } catch (error) {
      console.error("Error handling AI message or saving session:", error);
      setMessage("You did something kind for yourself today. Keep going gently.");
    } finally {
      setLoadingMessage(false);
    }
  };

  return (
    <div>
      <Navbar setUser={setUser} />

      <div className="page-container">
        <div className="breathing-card">
          {!started ? (
            <>
              <h1>Breathing Exercise</h1>

              <div className="selection-group">
                <h3>Choose seconds for each step</h3>
                <div className="option-buttons">
                  <button
                    className={selectedSeconds === 5 ? "selected-option" : ""}
                    onClick={() => setSelectedSeconds(5)}
                  >
                    5 Seconds
                  </button>
                  <button
                    className={selectedSeconds === 10 ? "selected-option" : ""}
                    onClick={() => setSelectedSeconds(10)}
                  >
                    10 Seconds
                  </button>
                </div>
              </div>

              <div className="selection-group">
                <h3>Choose number of rounds</h3>
                <div className="option-buttons">
                  <button
                    className={selectedRounds === 5 ? "selected-option" : ""}
                    onClick={() => setSelectedRounds(5)}
                  >
                    5 Rounds
                  </button>
                  <button
                    className={selectedRounds === 10 ? "selected-option" : ""}
                    onClick={() => setSelectedRounds(10)}
                  >
                    10 Rounds
                  </button>
                </div>
              </div>

              <button
                className="start-btn"
                onClick={handleStart}
                disabled={!selectedSeconds || !selectedRounds}
              >
                Start
              </button>
            </>
          ) : !finished ? (
            <>
              <h1>{phases[phaseIndex]}</h1>
              <div className="breathing-circle">{seconds}</div>
              <p>
                Round {round} of {selectedRounds}
              </p>

              <div className="answer-buttons">
                {!paused ? (
                  <button onClick={handlePause}>Pause</button>
                ) : (
                  <>
                    <button onClick={handleResume}>Resume</button>
                    <button onClick={handleReset}>Reset</button>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <h2>Do you feel better after the exercise?</h2>

              {selectedAnswer === null && (
                <div className="answer-buttons">
                  <button onClick={() => handleAnswer(true)}>Yes</button>
                  <button onClick={() => handleAnswer(false)}>No</button>
                </div>
              )}

             {loadingMessage && (
  <div className="loading-box">
    <div className="loading-circle"></div>
    <p className="loading-text">Take a soft breath...</p>
  </div>
)}

{message && !loadingMessage && (
  <div className="message-box">
    <p>{message}</p>
  </div>
)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default BreathingPage;
