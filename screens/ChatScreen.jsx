import React, { useState, useRef, useEffect } from "react";
const API_KEY = "AIzaSyAhfxxvg63W6jAmuq4CvCqQTB4KGXOerUk";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${API_KEY}`;

//guard rails for the chatbot
const systemInstruction = {
  parts: [{
    text: `You are Calm Pulse, a safe, non-judgmental, therapist-like companion. 
You should respond as Calm Pulse would, incorporating your:
- Role as a calm listener where users can rant, vent, or open up freely
- Ability to validate emotions and create a safe, supportive space
- Gentle way of offering practical solutions and coping strategies
- Focus on empathy, patience, and reassurance without judgment
- Skill in providing short exercises (breathing, grounding, journaling, reframing)
- Respect for user boundaries and asking before deeper interventions
- Reminder that you are not a licensed therapist, but a supportive guide
- Crisis care: if user mentions self-harm or immediate danger, respond with empathy 
  and suggest professional help or emergency contacts

Maintain a warm, calm, and caring tone. Speak directly in first person as a supportive companion, 
acknowledge feelings, and offer 2–3 simple next steps. Keep responses short and gentle 
(2–4 sentences). Always make the user feel safe, heard, and supported.`
  }]
};

//css just to see working(gpt)
const styles = {
  container: { flex: 1, backgroundColor: "#F9FAFB", display: 'flex', flexDirection: 'column', height: '100vh' },
  header: {
    textAlign: "center",
    padding: '20px',
    backgroundColor: "#4CAF50",
    color: "white",
    fontSize: '20px',
    fontWeight: "bold",
    borderBottomLeftRadius: '15px',
    borderBottomRightRadius: '15px',
  },
  chatBox: { padding: '10px', paddingBottom: '20px', flexGrow: 1, overflowY: 'auto' },
  message: {
    padding: '12px',
    borderRadius: '18px',
    margin: '6px 0',
    maxWidth: "85%",
    boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    marginLeft: 'auto',
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFFFFF",
  },
  messageText: { fontSize: '16px', color: '#333' },
  loading: {
    alignSelf: 'flex-start',
    marginLeft: '20px',
    marginBottom: '5px',
    fontSize: '14px',
    color: '#4CAF50',
  },
  inputBox: {
    display: 'flex',
    flexDirection: "row",
    padding: '10px',
    borderTop: '1px solid #ddd',
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  input: {
    flex: 1,
    padding: '10px 15px',
    border: '1px solid #ccc',
    borderRadius: '25px',
    marginRight: '10px',
    backgroundColor: '#F9FAFB',
    fontSize: '16px',
  },
  button: {
    backgroundColor: "#4CAF50",
    borderRadius: '25px',
    padding: '12px 20px',
    justifyContent: "center",
    alignItems: "center",
    border: 'none',
    cursor: 'pointer',
  },
  buttonDisabled: {
    backgroundColor: '#A5D6A7',
    cursor: 'not-allowed',
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: '16px' },
};

export default function App() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! How are you feeling today? Feel free to share anything on your mind." }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatBoxRef = useRef(null);

  // Automatically scroll to the bottom when new messages are added
  useEffect(() => {
    if (chatBoxRef.current) {
        chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessagesForApi = (chatHistory) => {
    const formattedHistory = chatHistory.reduce((acc, current) => {
      if (acc.length === 0 || acc[acc.length - 1].role !== current.role) {
        acc.push(current);
      }
      return acc;
    }, []);

    return {
      contents: formattedHistory.map((msg) => ({
        role: msg.role === "assistant" ? "model" : msg.role,
        parts: [{ text: msg.content }],
      })),
    };
  };

  const handleSend = async (e) => {
    if(e) e.preventDefault(); 
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const formattedForApi = formatMessagesForApi(newMessages);
      const payload = { ...formattedForApi, systemInstruction };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      const botResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (botResponse) {
        setMessages([
          ...newMessages,
          { role: "assistant", content: botResponse.trim() },
        ]);
      } else {
        throw new Error("No response text found in API data.");
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I'm having trouble connecting. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <p style={styles.header}>🌿 Calm Pulse</p>
      <div ref={chatBoxRef} style={styles.chatBox}>
        {messages.map((item, i) => (
           <div
              key={i}
              style={{
                ...styles.message,
                ...(item.role === "user" ? styles.userMessage : styles.assistantMessage),
              }}
            >
              <p style={styles.messageText}>{item.content}</p>
            </div>
        ))}
      </div>
      {isLoading && <p style={styles.loading}>Calm Pulse is thinking...</p>}
      <form onSubmit={handleSend} style={styles.inputBox}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Share your thoughts..."
          disabled={isLoading}
        />
        <button type="submit" style={{...styles.button, ...((isLoading || !input.trim()) && styles.buttonDisabled)}} disabled={isLoading || !input.trim()}>
          <span style={styles.buttonText}>Send</span>
        </button>
      </form>
    </div>
  );
}
