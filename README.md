# GymTrack 🏋️

GymTrack is a mobile application developed with [Expo](https://expo.dev) and [React Native](https://reactnative.dev/) for tracking, monitoring, and analyzing workout sessions.

The project is designed to go beyond basic workout logging by measuring relevant training metrics such as **total workout time, effective training time, rest time, average rest duration, and performance progress**.

In future versions, GymTrack may integrate with smartwatches and wearable sensors to collect real-time information during workouts.

## 🚀 Project overview

GymTrack aims to provide users with a simple and intelligent way to understand their workouts.

The main concept is to distinguish between:

* **Total workout time**
* **Effective workout time**
* **Rest time**
* **Average rest duration**
* **Exercise performance**
* **Workout history and progress**

The long-term goal is to create a system capable of combining mobile application data with information obtained from wearable devices.

## 🛠️ Technology stack

This project is currently based on the following technologies:

* [React Native](https://reactnative.dev/) `0.86`
* [Expo](https://expo.dev/) `SDK 57`
* [React](https://react.dev/) `19.2.3`
* [TypeScript](https://www.typescriptlang.org/)
* [Expo Router](https://docs.expo.dev/router/introduction/)
* [Node.js](https://nodejs.org/) `24.19.0`
* npm `11.x`
* Java / OpenJDK `17`
* Android Studio
* Android SDK `API 36`
* Android Emulator — Pixel 9
* Git
* Visual Studio Code

## 📁 Project structure

The project uses Expo Router and a feature-oriented structure:

```text
GymTrack/
│
├── app/
│   ├── _layout.tsx
│   │
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   │
│   └── (main)/
│       ├── _layout.tsx
│       ├── index.tsx
│       │
│       ├── workout/
│       │   ├── index.tsx
│       │   ├── active.tsx
│       │   └── summary.tsx
│       │
│       ├── history.tsx
│       ├── progress.tsx
│       └── profile.tsx
│
├── components/
│   ├── ui/
│   ├── workout/
│   ├── charts/
│   └── common/
│
├── hooks/
│   ├── useWorkout.ts
│   ├── useTimer.ts
│   └── ...
│
├── services/
│   ├── api/
│   ├── bluetooth/
│   └── sensors/
│
├── types/
│   ├── user.ts
│   ├── workout.ts
│   └── sensor.ts
│
├── constants/
│   ├── colors.ts
│   └── config.ts
│
├── utils/
│   ├── time.ts
│   └── calculations.ts
│
├── assets/
│   ├── images/
│   └── icons/
│
├── app.json
├── package.json
├── tsconfig.json
├── eslint.config.js
├── .gitignore
└── README.md
```

## 📂 Main directories

### `app`

Contains the application's screens and routes.

GymTrack uses [Expo Router](https://docs.expo.dev/router/introduction/), which provides file-based routing.

For example:

```text
app/
├── index.tsx
├── login.tsx
└── profile.tsx
```

Each file represents a route within the application.

### `components`

Contains reusable interface components such as:

* Buttons
* Cards
* Inputs
* Exercise cards
* Workout statistics
* Timers
* Charts

### `hooks`

Contains reusable application logic.

Examples:

```text
useWorkout()
useTimer()
useBluetooth()
```

### `services`

Contains communication with external services and hardware.

```text
services/
├── api/
├── bluetooth/
└── sensors/
```

This directory will be especially important when wearable devices and sensors are integrated.

### `types`

Contains TypeScript definitions used throughout the application.

### `utils`

Contains reusable utility functions and calculations related to workouts, time, and performance metrics.

## ⏱️ Workout tracking

One of the main features of GymTrack is the ability to differentiate between the different states of a workout session.

```text
Workout session
│
├── Total time
│
├── Effective time
│
└── Rest time
```

The application will use these values to generate useful workout metrics.

### Total workout time

The complete duration of a workout session.

### Effective workout time

The time during which the user is actively performing an exercise.

### Rest time

The time between active exercise periods.

### Average rest time

The average duration of the user's rest periods during a workout.

## 📊 Planned features

### User management

* [ ] User registration
* [ ] Login
* [ ] User profile
* [ ] User preferences

### Workout management

* [ ] Create workouts
* [ ] Add exercises
* [ ] Register sets
* [ ] Register repetitions
* [ ] Register weight
* [ ] Start workout
* [ ] Finish workout

### Workout monitoring

* [ ] Workout timer
* [ ] Effective time tracking
* [ ] Rest time tracking
* [ ] Average rest calculation
* [ ] Workout summary

### Statistics

* [ ] Workout history
* [ ] Progress tracking
* [ ] Performance statistics
* [ ] Charts
* [ ] Weekly statistics
* [ ] Monthly statistics

### Wearable integration

* [ ] Bluetooth communication
* [ ] Smartwatch integration
* [ ] Sensor data reception
* [ ] Real-time data processing
* [ ] Activity detection

## 🏗️ Development architecture

The application is planned around several main layers:

```text
                    GymTrack
                       │
                       ▼
                React Native
                    + Expo
                       │
          ┌────────────┼────────────┐
          │            │            │
          ▼            ▼            ▼
        UI           Logic       Services
          │            │            │
          │            │      ┌─────┴─────┐
          │            │      │           │
          ▼            ▼      ▼           ▼
    Components      Hooks   Bluetooth    API
                                   │
                                   ▼
                              Wearables
                               / Sensors
```

The objective is to keep the user interface, business logic, calculations, and external integrations separated.

## 📱 Application flow

The initial application flow is planned as:

```text
                    GymTrack
                       │
              ┌────────┴────────┐
              │                 │
             Auth             Main App
              │                 │
        ┌─────┴─────┐     ┌─────┴──────────┐
        │           │     │        │        │
      Login      Register Home   History  Profile
                               
                              │
                              ▼
                         Workout
                              │
                    ┌─────────┴─────────┐
                    │                   │
                 Active              Summary
                    │                   │
                    ▼                   ▼
                Metrics             Results
```

## ⚙️ Get started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npx expo start
```

In the output, you'll find options to open the application in:

* [Development build](https://docs.expo.dev/develop/development-builds/introduction/)
* [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
* [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
* [Expo Go](https://expo.dev/go)

### 3. Start the application on Android

If an Android emulator is already running:

```bash
npx expo start --android
```

You can also press:

```text
a
```

in the Expo CLI terminal.

## 🔍 Check the development environment

To check the Expo environment:

```bash
npx expo-doctor
```

To verify TypeScript:

```bash
npx tsc --noEmit
```

To check installed dependencies:

```bash
npm list --depth=0
```

To check Expo dependencies:

```bash
npx expo install --check
```

To automatically correct incompatible Expo dependencies:

```bash
npx expo install --fix
```

## 🧹 Linting

To run the project's linter:

```bash
npm run lint
```

Or:

```bash
npx expo lint
```

For additional information, see the [Expo ESLint documentation](https://docs.expo.dev/guides/using-eslint/).

## 🔄 Reset the project

If you want to remove the starter code and create a clean application directory, run:

```bash
npm run reset-project
```

This command moves the starter code to the `app-example` directory and creates a new `app` directory where development can begin.

> ⚠️ Only use this command if you intentionally want to reset the starter project.

## 🤖 Native Android project

GymTrack initially uses Expo's managed workflow.

Therefore, the project may not contain:

```text
android/
ios/
```

during the initial development stage.

When direct native development becomes necessary, the native projects can be generated with:

```bash
npx expo prebuild
```

> ⚠️ Do not run `expo prebuild` unless native Android or iOS configuration is required.

## 📦 Installing packages

When installing packages related to Expo or React Native, use:

```bash
npx expo install <package>
```

instead of manually selecting a version.

For example:

```bash
npx expo install expo-camera
```

This helps install a version compatible with the current Expo SDK.

## 🌿 Git workflow

The project uses Git for version control.

Recommended branch structure:

```text
main
│
└── develop
    │
    ├── feature/login
    ├── feature/workout
    ├── feature/timer
    ├── feature/statistics
    └── feature/bluetooth
```

Create a new feature branch:

```bash
git checkout -b feature/workout
```

Commit changes:

```bash
git add .
git commit -m "feat: add workout screen"
```

Push the branch:

```bash
git push origin feature/workout
```

## 📝 Commit conventions

GymTrack follows a Conventional Commits style.

| Type       | Description                  |
| ---------- | ---------------------------- |
| `feat`     | New functionality            |
| `fix`      | Bug fix                      |
| `refactor` | Code restructuring           |
| `style`    | Formatting or visual changes |
| `docs`     | Documentation                |
| `test`     | Tests                        |
| `chore`    | Maintenance/configuration    |

Examples:

```text
feat: add workout timer
fix: correct rest time calculation
refactor: reorganize workout services
docs: update README
```

## 🗺️ Roadmap

### Phase 1 — Project setup

* [x] Create Expo project
* [x] Configure React Native
* [x] Configure TypeScript
* [x] Configure Expo Router
* [x] Configure Android environment
* [ ] Define final architecture

### Phase 2 — User interface

* [ ] Home screen
* [ ] Login
* [ ] Registration
* [ ] Profile
* [ ] Dashboard
* [ ] Workout screen
* [ ] History
* [ ] Progress

### Phase 3 — Workout system

* [ ] Exercise management
* [ ] Sets and repetitions
* [ ] Weight tracking
* [ ] Workout timer
* [ ] Effective time
* [ ] Rest time
* [ ] Workout summary

### Phase 4 — Statistics

* [ ] Workout history
* [ ] Performance metrics
* [ ] Charts
* [ ] Progress analysis
* [ ] Weekly statistics
* [ ] Monthly statistics

### Phase 5 — Wearables

* [ ] Bluetooth communication
* [ ] Smartwatch research
* [ ] Sensor integration
* [ ] Real-time data
* [ ] Activity detection

### Phase 6 — Backend

* [ ] API
* [ ] Database
* [ ] Authentication
* [ ] Cloud synchronization
* [ ] Workout data storage

## 🔐 Security

Sensitive information must never be committed to the repository.

Do not upload:

```text
.env
API keys
Access tokens
Passwords
Private credentials
```

Use environment variables for sensitive configuration.

## 📚 Useful resources

* [Expo documentation](https://docs.expo.dev/)
* [Expo Router documentation](https://docs.expo.dev/router/introduction/)
* [React Native documentation](https://reactnative.dev/docs/getting-started)
* [React documentation](https://react.dev/)
* [TypeScript documentation](https://www.typescriptlang.org/docs/)
* [Android Studio documentation](https://developer.android.com/studio)
* [Expo tutorial](https://docs.expo.dev/tutorial/introduction/)

## 📌 Project status

**Status:** 🚧 In development

GymTrack is currently in the initial development stage. The project architecture and core application functionality are being established before implementing advanced workout analytics and wearable-device integration.

---

## 🏋️ GymTrack

**Train. Track. Analyze. Improve.**
