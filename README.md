# Desert Quiz Race

## Introduction / Summary

Desert Quiz Race is an engaging and interactive quiz game where players race against time to answer questions correctly. The game integrates into Topia world, offering a an experience of gaming and learning. Players start the race by clicking "Start Quiz" and navigate through various zones to answer questions, ending the race by re-entering the start zone to view their scores and times. Admins can easily manage the game by editing questions and resetting the quiz race.

## Built With

### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

## Key Features

- **Interactive Quiz Experience**: Engage in a dynamic quiz race within the Topia world.
- **Real-Time Feedback**: Instantly see if your answers are correct or wrong as you play.
- **Leaderboard**: Check your rankings and historical scores.

## Canvas Elements & Interactions

Players interact with various elements within the Topia world:

- **Start Zone**: Click "Start Quiz" to begin the race.
- **Question Zones**: Enter these zones to answer questions. Feedback is provided instantly.
- **Trophy**: Click on the trophy to view your score at the end of the quiz.

## Drawer Content

The drawer is automatically triggered by webhooks when entering zones, displaying questions and scores without the need for additional clicks.

## Admin Features

- Edit questions and answers.
- Reset the quiz race for all users.

## Data Objects

Questions and user scores are managed dynamically. The game uses webhooks to trigger interactions and display content relevant to the player's progress. This information is stored in the key asset (Start) data object.

## Implementation

#### Key Asset

- Configuration > Link: `https://{sdk-app-url}.com/start`
- Configuration > Integrations > Webhooks: `https://{sdk-app-url}.com/api/iframe/start`
- The Data Object should be set up like the following example. Please take note of the questionIds, you'll need those later!

```json
{
  "questions": {
    "1": {
      // questionId
      "questionText": "Who wrote the book \"1984\"?",
      "answer": "2",
      "options": {
        "1": "J.K. Rowling",
        "2": "George Orwell",
        "3": "Mark Twain",
        "4": "William Shakespeare"
      }
    },
    "2": {
      // questionId
      "questionText": "Which planet is known as the 'Red Planet'?",
      "answer": "3",
      "options": {
        "1": "Jupiter",
        "2": "Venus",
        "3": "Mars",
        "4": "Neptune"
      }
    },
    "3": {
      // questionId
      "questionText": "What is the capital city of Japan?",
      "answer": "2",
      "options": {
        "1": "Beijing",
        "2": "Tokyo",
        "3": "Seoul",
        "4": "Bangkok"
      }
    },
    "4": {
      // questionId
      "questionText": "Who was the first President of the United States?",
      "answer": "3",
      "options": {
        "1": "Abraham Lincoln",
        "2": "Thomas Jefferson",
        "3": "George Washington",
        "4": "Franklin D. Roosevelt"
      }
    }
  },
  "leaderboard": {}
}
```

### Question Assets

- Configuration > Link: `https://{sdk-app-url}.com/question?questionId=4`
- Configuration > Integrations > Webhooks: `https://{sdk-app-url}.com/api/iframe/{questionId}`

### Leaderboard Asset

- Configuration > Link: `https://{sdk-app-url}.com/leaderboard`

## Developer

### Getting Started

Refer to the `.env-example` file to configure your environment variables correctly.

#### Production Mode

1. Install dependencies: `npm install`
2. Start the server: `npm run start`

#### Development Mode

1. Install dependencies: `npm install`, `cd client && npm install`, `cd server && npm install`
2. Start the server: `npm run dev`
3. Access `http://localhost:3001`, but you can only truly test when the assets are well placed in the world, with the zones all configured like in the scene: [https://topia.io/quiz-prod](https://topia.io/quiz-prod)

### Requirements

- Node.js 18
- React

### .env variables

Copy the `.env-example` file to `.env` and fill in all required environment variables.

### Where to Find API_KEY, INTERACTIVE_KEY, and INTERACTIVE_SECRET

You can find the `INTERACTIVE_KEY`, and `INTERACTIVE_SECRET` in the admin settings in https://topia.io.

### Helpful Links

- View it in action: [https://topia.io/quiz-prod](https://topia.io/quiz-prod)
- Guide on How to play: [https://www.notion.so/topiaio/Quiz-Race-595190e694ac4d8ab893c16ff43184d9](https://www.notion.so/topiaio/Quiz-Race-595190e694ac4d8ab893c16ff43184d9)
