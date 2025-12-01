# SkillSwap Web Frontend

React-based web application for SkillSwap platform.

## Features

- Dark theme with light highlights
- Responsive design (optimized for desktop)
- Animated discover cards with drag-to-swipe
- Complete profile editing with all features
- Mobile keyboard optimization
- Modern UI with smooth animations

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will run on http://localhost:3000

## Environment Variables

Create a `.env` file in the root directory:

```
REACT_APP_API_URL=http://localhost:8080
```

## Tech Stack

- React 18.2.0
- React Router 6.21.1
- Framer Motion 10.16.16 (for animations)
- Axios 1.6.2
- CSS Variables for theming

## Mobile Optimization

- Input fields use `font-size: 16px` to prevent iOS zoom
- Touch-friendly button sizes
- Responsive layouts for mobile devices
- Keyboard-aware layouts

