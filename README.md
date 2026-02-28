# ArtIntX — AI-Powered Healthcare Guidance Platform

ArtIntX is a premium, full-stack healthcare companion designed to bridge the gap between symptom onset and professional medical care. It uses advanced AI (CBT-based logic) and machine learning to provide symptom assessment, monitor wellness trends, and offer personalized healthcare guidance.

![ArtIntX Dashboard](frontend/icon-512.png)

## 🩺 Key Features

-   **AI Symptom Checker**: A specialized healthcare chatbot with voice input/output that recognizes physical and emotional symptoms, providing formatted clinical assessments and next steps.
-   **Medicine Reminders**: A dedicated scheduling system for tracking medication intake and frequency.
-   **Health Monitoring**:
    -   **Mood Tracker**: Longitudinal tracking of emotional well-being.
    -   **PHQ-9 Assessment**: Clinically validated depression screening tools.
    -   **Analytics**: Interactive charts (Chart.js) visualizing health trends and recovery progress.
-   **AI Risk Dashboard**: Machine learning-simulated scores for attrition risk, relapse risk, and crisis detection.
-   **PWA Ready**: Fully installable as a Progressive Web App (PWA) with offline capabilities and mobile-optimized UI.
-   **Emergency Escalation**: Immediate access to medical helplines and crisis detection features.

## 🚀 Technology Stack

-   **Frontend**: Vanilla HTML5, CSS3 (Advanced Glassmorphism & Animations), JavaScript (ES6+).
-   **Backend**: Node.js, Express.js.
-   **Database**: SQLite (WAL mode for high performance).
-   **AI Engine**: Custom pattern recognition and intent classification for healthcare guidance.
-   **Integrations**: Google Translate API (Multi-language support), Web Speech API (Voice features).

## 🛠️ Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/) (v16+ recommended)
-   npm or yarn

### Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/YOUR_USERNAME/ArtIntX.git
    cd ArtIntX
    ```

2.  **Setup Backend**:
    ```bash
    cd backend
    npm install
    npm run dev
    ```
    The server will start on `http://localhost:5000`.

3.  **Setup Frontend**:
    The frontend is built with vanilla JS and can be served using any static server or by opening `frontend/index.html`. For development, you can use:
    ```bash
    cd frontend
    # Recommended: Use 'Live Server' vscode extension or:
    npx serve .
    ```

## 📜 Medical Disclaimer

**ArtIntX provides basic healthcare guidance for informational purposes only. It is NOT a substitute for professional medical diagnosis, advice, or treatment.** 

Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. In case of a medical emergency, call **112** or your local emergency services immediately.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
