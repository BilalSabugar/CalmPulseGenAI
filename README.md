# Calm Pulse

Your private AI companion for mental wellness, providing a safe space to reflect, breathe, and grow.

------

# 🚀 About The Project

Calm Pulse is a mental wellness application developed as a prototype in Mumbai, September 2025. It serves as an empathetic, AI-powered companion designed to provide a safe and non-judgmental space for users to navigate their thoughts and feelings.

The core idea behind Calm Pulse is simple: to be the friend that's always there. We wanted to create a truly private, judgment-free space for anyone going through a rough time, especially those who feel they have no one to whom they can truly open up. While not a replacement for professional therapy, Calm Pulse offers immediate, therapeutic support by integrating proven techniques to help you build resilience and achieve greater mental stability.

Crucially, Calm Pulse is an unwavering companion, available 24/7, entirely for you—whether you need to ask for help, vent your frustrations, rant about your day, or simply share a passing thought.

# ✨ Key Features

  AI-Powered Empathetic Chat: Personalized conversations with an AI that understands your name, age, gender, and stated goals for a truly supportive experience.
  Comprehensive Dashboard: At-a-glance view of your mood trends, sleep patterns, and wellness activities.
  Full-Fledged Wellness Toolkit: Includes functional tools for:
      * 1-Minute Breathing Exercises
      * Guided Meditation Timers
      * Daily Journaling with Local Storage
      * Manual Sleep Data Logging
  Privacy-First: On-device storage (`AsyncStorage`) for all personal data with an anonymous-first approach.
  Fully Responsive Design: A seamless experience on both mobile phones and desktop devices.
  Light & Dark Mode: Beautifully crafted themes to suit your preference.

------

# 🛠️ Built With

This project is built with a modern stack, focusing on cross-platform compatibility and a great user experience.

  React Native
  Expo
  Google Gemini API for generative AI chat.
  Lucide React Native for icons.
  React Native Chart Kit for data visualization.
  AsyncStorage for on-device data persistence.

------

# 🏁 Getting Started

To get a local copy up and running, follow these simple steps.

# Prerequisites

Make sure you have Node.js and npm (or yarn) installed on your machine.

  =>npm
    npm install npm@latest -g
  =>Expo CLI
    npm install -g expo-cli

# Installation

1.Clone the repo
    git clone https://github.com/BilalSabugar/CalmPulseGenAI.git

2.Install NPM packages

    cd calm-pulse
    npm install

3.Create the Local User Data File (Crucial Step\!)

    This project uses a local mock user file for testing the login flow and personalized features. This file is intentionally ignored by Git to keep credentials secure.

      * In your project's data directory (e.g., `src/data/`), create a new file named `users.js`.
      * Copy and paste the following code into `users.js`:


    ```javascript
    // src/data/users.js
    export const users = [
      {
        "id": 0,
        "username": "admin",
        "passcode": "000000",
        "age": 35,
        "gender": "N/A",
        "occupation": "System Administrator",
        "location": "Mumbai, Maharashtra",
        "reasonForUse": "System Testing",
      },
      {
        "id": 102,
        "username": "Priya_K",
        "passcode": "987654",
        "age": 28,
        "gender": "Female",
        "occupation": "Software Engineer",
        "location": "Bengaluru, Karnataka",
        "reasonForUse": "Work-life balance",
      },
      // You can add more users from the full list for testing
    ];
    ```

4.Run the App
    npx expo start

------

# usage

Once the application is running, you can log in using one of the mock user profiles defined in your local `users.js` file.

  * **Admin Access:** Use username `admin` and passcode `000000`.
  * **Standard User:** Use username `Priya_K` and passcode `987654`.

Explore the dashboard, interact with the AI chatbot, and test the wellness tools.

------

# 👥 The Team

  * **Sidharth Lama** - *Back-end Developer*
  * **Bilal Sabugar** - *Back-end Developer*
  * **Riyaan Sheth** - *Coordinator*
  * **Nandani Singh** - *Coordinator*
