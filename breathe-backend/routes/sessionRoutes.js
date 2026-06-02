const express = require("express");
const db = require("../config/db");
const { GoogleGenAI } = require("@google/genai");

const router = express.Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

router.post("/generate-message", async (req, res) => {
  const { user_answer } = req.body;

  if (user_answer === undefined) {
    return res.status(400).json({ message: "User answer is required" });
  }

  try {
    const randomSeed = Math.floor(Math.random() * 1000000);

    const prompt = user_answer
      ? `
The user feels better after a breathing exercise.

Generate ONE short empowering sentence.

Rules:
- Do NOT act like a therapist
- Do NOT mention therapy
- Do NOT give medical advice
- Do NOT diagnose
- Do NOT use the word "I"
- Do NOT repeat common phrases like "you did something kind"
- Do NOT use the same structure every time
- Speak directly to the user
- Make it emotionally warm but simple
- Under 15 words
- Make it fresh and different from previous answers

Random variation seed: ${randomSeed}
`
      : `
The user does not feel better yet after a breathing exercise.

Generate ONE short gentle empowering sentence.

Rules:
- Do NOT act like a therapist
- Do NOT mention therapy
- Do NOT give medical advice
- Do NOT diagnose
- Do NOT use the word "I"
- Do NOT repeat common phrases like "be gentle with yourself"
- Do NOT use the same structure every time
- Speak directly to the user
- Make it calm, patient, and encouraging
- Under 15 words
- Make it fresh and different from previous answers

Random variation seed: ${randomSeed}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
      config: {
        temperature: 1.2,
        topP: 0.95,
        topK: 40,
      },
    });

    const aiMessage =
      response.text?.trim() ||
      "This small pause still matters, and your effort is meaningful.";

    res.status(200).json({ ai_message: aiMessage });
  } catch (error) {
    console.error("Error generating AI message:", error);

    const yesFallbacks = [
      "This calm moment is yours, and it counts.",
      "You created space for peace today.",
      "Small relief is still real progress.",
      "You showed strength by choosing calm.",
      "This step forward deserves to be noticed.",
    ];

    const noFallbacks = [
      "This effort still matters, even if relief takes time.",
      "You showed up for yourself today.",
      "One difficult moment does not erase your progress.",
      "Your effort has value, even now.",
      "This pause still counts as care.",
    ];

    const list = user_answer ? yesFallbacks : noFallbacks;
    const fallbackMessage = list[Math.floor(Math.random() * list.length)];

    res.status(200).json({ ai_message: fallbackMessage });
  }
});

// SAVE SESSION
router.post("/save", (req, res) => {
  const { user_id, session_date, session_time, user_answer, ai_message, progress_score } = req.body;

  if (
    user_id === undefined ||
    !session_date ||
    !session_time ||
    user_answer === undefined ||
    !ai_message ||
    progress_score === undefined
  ) {
    return res.status(400).json({ message: "All session fields are required" });
  }

  const sql = `
    INSERT INTO breathing_sessions
    (user_id, session_date, session_time, user_answer, ai_message, progress_score)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [user_id, session_date, session_time, user_answer, ai_message, progress_score],
    (err, result) => {
      if (err) {
        return res.status(500).json({ message: "Error saving session", error: err });
      }

      res.status(201).json({ message: "Session saved successfully" });
    }
  );
});

// GET USER SESSIONS
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;

  const sql = `
    SELECT * FROM breathing_sessions
    WHERE user_id = ?
    ORDER BY session_date DESC, session_time DESC
  `;

  db.query(sql, [user_id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: "Error fetching sessions" });
    }

    res.status(200).json(results);
  });
});

module.exports = router;