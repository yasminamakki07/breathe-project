import React, { useState } from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";

function WelcomePage({ setUser }) {
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="welcome-page">
      <div className="welcome-card">
        <h1>Welcome to Breathe</h1>
        <p className="subtitle">
          A calm and supportive space to help reduce anxiety through guided breathing exercise.
        </p>
        <p className="disclaimer">
          Disclaimer: This website is not a replacement for therapy. It is only a supportive companion
          designed to help reduce anxiety through breathing exercise and encouraging messages.
        </p>

        <div className="single-form-container">
          {!showSignup ? (
            <>
              <LoginForm setUser={setUser} />
              <p className="switch-form-text">
                Don&apos;t have an account?{" "}
                <span className="switch-link" onClick={() => setShowSignup(true)}>
                  Sign Up
                </span>
              </p>
            </>
          ) : (
            <>
              <SignupForm setUser={setUser} />
              <p className="switch-form-text">
                Already have an account?{" "}
                <span className="switch-link" onClick={() => setShowSignup(false)}>
                  Log In
                </span>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;