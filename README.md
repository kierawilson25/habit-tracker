# Habit Tracker App

Welcome to the **Habit Tracker App** – a simple and effective tool designed to help users build and maintain good habits through daily tracking. Whether you're aiming to drink more water, exercise consistently, or improve your productivity, this app provides a clear view of your progress over time.

## 📌 About the Project

The Habit Tracker App is a full-stack application built to support users in tracking daily habits with ease. It provides intuitive interfaces for:

- Creating and managing personal habits
- Logging habit completion daily
- Viewing progress over time

The project is structured as a **monorepo**, containing both frontend and backend components in a single repository for easier development and collaboration.

## 🗂️ Repository Structure

This is a monorepo with the following key folders:
```
habit-tracker/
├── frontend/ → React-based client application
├── backend/ → Express.js server and API
├── README.md
```

## 🧩 Tech Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: Node.js, Express.js, MongoDB
- **Monorepo**: Managed manually with separate folders



## 🔷 Frontend

The frontend is built using **React** and provides a responsive and user-friendly interface for users to manage their habits.

To run the frontend locally:

```bash
cd frontend
npm install
npm run dev
```

##  🔶 Backend

The backend is located in the [`/backend`](./backend) directory and is built with **Node.js** and **Express.js**. It serves as the API layer for the application, handling requests such as creating, updating, deleting, and retrieving habit data.

To run the project locally:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


