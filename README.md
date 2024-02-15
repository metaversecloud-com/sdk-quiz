# Desert Quiz Race

## Introduction / Summary

Desert Quiz Race is an engaging and interactive quiz game where players race against time to answer questions correctly. The game integrates into Topia world, offering a an experience of gaming and learning. Players start the race by clicking "Start Quiz" and navigate through various zones to answer questions, ending the race by re-entering the start zone to view their scores and times. Admins can easily manage the game by editing questions and resetting the quiz race.

## Key Features

- **Interactive Quiz Experience**: Engage in a dynamic quiz race within the Topia world.
- **Real-Time Feedback**: Instantly see if your answers are correct or wrong as you play.
- **Leaderboard**: Check your rankings and historical scores.

## Canvas Elements & Interactions

Players interact with various elements within the Topia world:

- **Start Zone**: Click "Start Quiz" to begin the race.
- **Question Zones**: Enter these zones to answer questions. Feedback is provided instantly.
- **Trophy Zone**: View your score at the end of the quiz.

## Drawer Content

The drawer is automatically triggered by webhooks when entering zones, displaying questions and scores without the need for additional clicks.

## Admin Features

- Edit questions and answers.
- Reset the quiz race for all users.

## Themes Description

(If applicable, describe any specific themes or visual styles used in the quiz.)

## Data Objects

Questions and user scores are managed dynamically. The game uses webhooks to trigger interactions and display content relevant to the player's progress.

### Detailed Description of Locks

(Describe any specific locks or conditions applied to data objects, if applicable.)

## Developer Sections

### Getting Started

Refer to the `.env-example` file to configure your environment variables correctly.

#### Production Mode

1. Install dependencies: `npm install`
2. Start the server: `npm start`

#### Development Mode

1. Start the server: `npm start`
2. In a new terminal, navigate to the client directory: `cd client && npm start`
3. Access `http://localhost:3001`, but you can only truly test when the assets are well placed in the world, with the zones all configured like in the scene: [https://topia.io/quiz-prod](https://topia.io/quiz-prod)

#### Requirements

- Node.js 18
- React

#### .env variables

Copy the `.env-example` file to `.env` and fill in all required environment variables.

#### Where to Find API_KEY, INTERACTIVE_KEY, and INTERACTIVE_SECRET

You can find the `INTERACTIVE_KEY`, and `INTERACTIVE_SECRET` in the admin settings in https://topia.io.

### Helpful Links

- View it in action: [https://topia.io/quiz-prod](https://topia.io/quiz-prod)
- Guide on How to play: [https://www.notion.so/topiaio/Quiz-Race-595190e694ac4d8ab893c16ff43184d9](https://www.notion.so/topiaio/Quiz-Race-595190e694ac4d8ab893c16ff43184d9)
