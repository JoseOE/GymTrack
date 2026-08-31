# GymTrack 🏋️

GymTrack es una aplicación móvil desarrollada con [Expo](https://expo.dev) y [React Native](https://reactnative.dev/) para el registro, monitoreo y análisis de sesiones de entrenamiento físico.

El proyecto busca ir más allá del registro básico de entrenamientos, permitiendo medir métricas como **tiempo total de entrenamiento, tiempo efectivo, tiempo de descanso, descanso promedio y progreso del rendimiento**.

En futuras versiones, GymTrack podrá integrarse con relojes inteligentes y sensores portátiles para obtener información en tiempo real durante los entrenamientos.

---

## 📋 Descripción del proyecto

GymTrack tiene como objetivo proporcionar al usuario una herramienta sencilla e inteligente para comprender mejor sus sesiones de entrenamiento.

El concepto principal consiste en diferenciar:

* **Tiempo total de entrenamiento**
* **Tiempo efectivo de entrenamiento**
* **Tiempo de descanso**
* **Tiempo promedio de descanso**
* **Rendimiento durante el ejercicio**
* **Historial y progreso**

A largo plazo, el proyecto busca combinar la información obtenida desde la aplicación móvil con datos provenientes de dispositivos portátiles.

---

## 🎯 Objetivo general

Desarrollar una aplicación móvil que permita **registrar, monitorear y analizar sesiones de entrenamiento**, proporcionando métricas que ayuden al usuario a conocer su desempeño y evolución.

---

## 🧩 Problemática

Actualmente, muchas aplicaciones de entrenamiento se enfocan principalmente en registrar:

* Ejercicios realizados.
* Series.
* Repeticiones.
* Peso utilizado.
* Duración general del entrenamiento.

Sin embargo, existe una oportunidad para obtener información más detallada sobre **cómo se desarrolla realmente una sesión de entrenamiento**.

GymTrack busca analizar aspectos como:

* ¿Cuánto tiempo duró realmente el entrenamiento?
* ¿Cuánto tiempo estuvo el usuario realizando actividad?
* ¿Cuánto tiempo permaneció descansando?
* ¿Cuál fue el descanso promedio?
* ¿Cómo cambia su rendimiento con el paso del tiempo?

---

## 🚀 Funcionalidades

### 👤 Gestión de usuario

* [ ] Registro de usuarios
* [ ] Inicio de sesión
* [ ] Perfil de usuario
* [ ] Preferencias de entrenamiento

### 🏋️ Gestión de entrenamientos

* [ ] Crear entrenamientos
* [ ] Agregar ejercicios
* [ ] Registrar series
* [ ] Registrar repeticiones
* [ ] Registrar peso
* [ ] Iniciar entrenamiento
* [ ] Finalizar entrenamiento

### ⏱️ Monitoreo del entrenamiento

GymTrack busca diferenciar:

```text
Entrenamiento
│
├── Tiempo total
│
├── Tiempo efectivo
│
└── Tiempo de descanso
```

Se contempla registrar:

* Tiempo total.
* Tiempo efectivo.
* Tiempo de descanso.
* Tiempo promedio de descanso.
* Duración de cada ejercicio.
* Rendimiento durante la sesión.

### 📊 Estadísticas

* [ ] Historial de entrenamientos
* [ ] Seguimiento del progreso
* [ ] Estadísticas de rendimiento
* [ ] Gráficas
* [ ] Estadísticas semanales
* [ ] Estadísticas mensuales

### ⌚ Integración con dispositivos inteligentes

Como parte de la evolución del proyecto se contempla la integración con:

* Relojes inteligentes.
* Bandas inteligentes.
* Sensores portátiles.
* Dispositivos compatibles mediante Bluetooth.

La finalidad será obtener datos en tiempo real durante el entrenamiento.

---

## 🛠️ Tecnologías utilizadas

### Aplicación móvil

| Tecnología       | Versión | Uso                                    |
| ---------------- | ------: | -------------------------------------- |
| **React Native** |    0.86 | Desarrollo de la aplicación móvil      |
| **Expo**         |  SDK 57 | Framework y herramientas de desarrollo |
| **React**        |  19.2.3 | Biblioteca principal                   |
| **TypeScript**   |     5.x | Tipado estático                        |
| **Expo Router**  |   ~57.x | Navegación basada en archivos          |

### Entorno de desarrollo

| Herramienta            |        Versión |
| ---------------------- | -------------: |
| **Node.js**            |        24.19.0 |
| **npm**                |           11.x |
| **Java / OpenJDK**     |             17 |
| **Visual Studio Code** |        1.131.0 |
| **Git**                | Última versión |

### Android

| Herramienta        | Configuración |
| ------------------ | ------------- |
| **Android Studio** | Instalado     |
| **Android SDK**    | API 36        |
| **Emulador**       | Pixel 9       |
| **Arquitectura**   | x86_64        |
| **Sistema**        | Android 16    |

---

## 📁 Estructura del proyecto

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

---

## 📂 Descripción de las carpetas

### `app/`

Contiene las pantallas y rutas de la aplicación.

GymTrack utiliza [Expo Router](https://docs.expo.dev/router/introduction/), que permite utilizar un sistema de **navegación basado en archivos**.

Por ejemplo:

```text
app/
├── index.tsx
├── login.tsx
└── profile.tsx
```

Cada archivo representa una ruta dentro de la aplicación.

---

### `components/`

Contiene componentes reutilizables de la interfaz.

Ejemplos:

* Botones.
* Tarjetas.
* Formularios.
* Tarjetas de ejercicios.
* Temporizadores.
* Estadísticas.
* Gráficas.

---

### `hooks/`

Contiene lógica reutilizable mediante hooks personalizados.

Ejemplos:

```text
useWorkout()
useTimer()
useBluetooth()
```

---

### `services/`

Contiene la comunicación con servicios externos y dispositivos.

```text
services/
├── api/
├── bluetooth/
└── sensors/
```

Esta sección será especialmente importante cuando se implemente la comunicación con relojes inteligentes y sensores.

---

### `types/`

Contiene las definiciones de tipos de TypeScript utilizadas en el proyecto.

---

### `constants/`

Contiene valores constantes utilizados por la aplicación, como:

* Colores.
* Configuración.
* Valores predeterminados.

---

### `utils/`

Contiene funciones auxiliares y cálculos.

Ejemplos:

```text
calculateEffectiveTime()
calculateRestAverage()
formatDuration()
```

---

## 🏗️ Arquitectura del proyecto

La arquitectura de GymTrack busca mantener separadas la interfaz, la lógica de negocio y los servicios externos.

```text
                       GymTrack
                          │
                          ▼
                   React Native
                       + Expo
                          │
            ┌─────────────┼─────────────┐
            │             │             │
            ▼             ▼             ▼
           UI           Lógica       Servicios
            │             │             │
            ▼             ▼       ┌─────┴─────┐
       Components       Hooks     │           │
                                  ▼           ▼
                              Bluetooth      API
                                  │
                                  ▼
                              Dispositivos
                               inteligentes
```

---

## 📱 Flujo de la aplicación

```text
                       GymTrack
                          │
                 ┌────────┴────────┐
                 │                 │
              Autenticación     Aplicación
                 │                 │
          ┌──────┴──────┐    ┌─────┴─────────┐
          │             │    │       │       │
        Login       Registro Inicio Historial Perfil
                                  │
                                  ▼
                             Entrenamiento
                                  │
                         ┌────────┴────────┐
                         │                 │
                       Activo            Resumen
                         │                 │
                         ▼                 ▼
                      Métricas          Resultados
```

---

## ⏱️ Seguimiento del entrenamiento

Una de las principales características de GymTrack será distinguir entre el **tiempo total**, el **tiempo efectivo** y el **tiempo de descanso**.

### Tiempo total

Tiempo transcurrido desde el inicio hasta el final de una sesión.

### Tiempo efectivo

Tiempo durante el cual el usuario realmente está realizando el ejercicio.

### Tiempo de descanso

Tiempo durante el cual el usuario no está realizando actividad física.

### Tiempo promedio de descanso

Promedio de duración de los períodos de descanso registrados durante una sesión.

---

## ⚙️ Instalación

### Requisitos

Antes de comenzar, se recomienda contar con:

* Node.js 24.x
* npm
* Git
* Visual Studio Code
* Android Studio
* Android SDK
* Java / OpenJDK 17

---

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
```

Entrar a la carpeta:

```bash
cd GymTrack
```

---

### 2. Instalar las dependencias

```bash
npm install
```

---

### 3. Iniciar la aplicación

```bash
npx expo start
```

En la terminal aparecerán diferentes opciones para abrir la aplicación:

* **Development Build**
* **Android Emulator**
* **iOS Simulator**
* **Expo Go**

---

### 4. Ejecutar en Android

Con el emulador de Android abierto:

```bash
npx expo start --android
```

También puedes presionar:

```text
a
```

dentro de la terminal de Expo.

---

## 🔍 Comprobar el entorno

Para comprobar que la configuración de Expo es correcta:

```bash
npx expo-doctor
```

Para comprobar TypeScript:

```bash
npx tsc --noEmit
```

Para consultar las dependencias instaladas:

```bash
npm list --depth=0
```

Para comprobar las versiones compatibles de Expo:

```bash
npx expo install --check
```

Para corregir automáticamente dependencias incompatibles:

```bash
npx expo install --fix
```

---

## 🧹 Linting

Para ejecutar ESLint:

```bash
npm run lint
```

También puede utilizarse:

```bash
npx expo lint
```

Más información en la [documentación de ESLint para Expo](https://docs.expo.dev/guides/using-eslint/).

---

## 🔄 Reiniciar el proyecto

Expo incluye un comando para eliminar el código inicial del template:

```bash
npm run reset-project
```

Este comando mueve el código inicial a:

```text
app-example/
```

y crea una carpeta `app/` limpia para comenzar el desarrollo.

> ⚠️ Utilizar este comando únicamente cuando se quiera reiniciar intencionalmente la estructura inicial del proyecto.

---

## 🤖 Proyecto nativo de Android

GymTrack utiliza inicialmente el flujo administrado de Expo.

Por lo tanto, durante las primeras etapas puede que el proyecto no contenga:

```text
android/
ios/
```

Cuando sea necesario trabajar directamente con código nativo, se pueden generar los proyectos mediante:

```bash
npx expo prebuild
```

> ⚠️ No ejecutar `expo prebuild` a menos que sea necesario realizar configuraciones nativas.

---

## 📦 Instalación de nuevas dependencias

Para instalar paquetes relacionados con Expo o React Native se recomienda utilizar:

```bash
npx expo install <paquete>
```

Por ejemplo:

```bash
npx expo install expo-camera
```

Esto permite instalar una versión compatible con el SDK de Expo utilizado por el proyecto.

---

## 🌿 Control de versiones

GymTrack utiliza Git para el control de versiones.

Se recomienda trabajar con ramas:

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

Crear una nueva rama:

```bash
git checkout -b feature/workout
```

Guardar los cambios:

```bash
git add .
```

Crear un commit:

```bash
git commit -m "feat: agregar pantalla de entrenamiento"
```

Subir la rama:

```bash
git push origin feature/workout
```

---

## 📝 Convención de commits

Se recomienda utilizar una estructura basada en **Conventional Commits**.

| Tipo       | Descripción                   |
| ---------- | ----------------------------- |
| `feat`     | Nueva funcionalidad           |
| `fix`      | Corrección de errores         |
| `refactor` | Reestructuración del código   |
| `style`    | Cambios de formato o diseño   |
| `docs`     | Cambios en documentación      |
| `test`     | Pruebas                       |
| `chore`    | Mantenimiento o configuración |

Ejemplos:

```text
feat: agregar cronómetro de entrenamiento
fix: corregir cálculo del tiempo de descanso
refactor: reorganizar servicios de entrenamiento
docs: actualizar README
```

---

## 🗺️ Roadmap

### Fase 1 — Configuración del proyecto

* [x] Crear proyecto Expo
* [x] Configurar React Native
* [x] Configurar TypeScript
* [x] Configurar Expo Router
* [x] Configurar entorno Android
* [ ] Definir arquitectura final

### Fase 2 — Interfaz

* [ ] Pantalla principal
* [ ] Inicio de sesión
* [ ] Registro
* [ ] Perfil
* [ ] Dashboard
* [ ] Historial
* [ ] Progreso
* [ ] Pantalla de entrenamiento

### Fase 3 — Sistema de entrenamiento

* [ ] Gestión de ejercicios
* [ ] Series y repeticiones
* [ ] Registro de peso
* [ ] Cronómetro
* [ ] Tiempo efectivo
* [ ] Tiempo de descanso
* [ ] Resumen de entrenamiento

### Fase 4 — Estadísticas

* [ ] Historial
* [ ] Métricas de rendimiento
* [ ] Gráficas
* [ ] Análisis de progreso
* [ ] Estadísticas semanales
* [ ] Estadísticas mensuales

### Fase 5 — Dispositivos inteligentes

* [ ] Investigación de dispositivos compatibles
* [ ] Comunicación Bluetooth
* [ ] Integración con smartwatch
* [ ] Recepción de datos
* [ ] Procesamiento en tiempo real
* [ ] Detección de actividad

### Fase 6 — Backend

* [ ] API
* [ ] Base de datos
* [ ] Autenticación
* [ ] Sincronización
* [ ] Almacenamiento de entrenamientos

---

## 🔐 Seguridad

No se deben subir datos sensibles al repositorio.

Nunca incluir:

```text
.env
API Keys
Tokens
Contraseñas
Credenciales privadas
```

La información sensible deberá manejarse mediante variables de entorno y mecanismos seguros de configuración.

---

## 📚 Recursos

* [Documentación de Expo](https://docs.expo.dev/)
* [Expo Router](https://docs.expo.dev/router/introduction/)
* [Documentación de React Native](https://reactnative.dev/docs/getting-started)
* [Documentación de React](https://react.dev/)
* [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
* [Android Studio](https://developer.android.com/studio)
* [Tutorial de Expo](https://docs.expo.dev/tutorial/introduction/)

---

## 📌 Estado del proyecto

**Estado:** 🚧 En desarrollo

GymTrack se encuentra actualmente en la etapa inicial de desarrollo, enfocada en establecer la arquitectura, configuración del entorno y funcionalidades principales de la aplicación.

Las siguientes etapas estarán orientadas a la implementación del sistema de entrenamientos, análisis de métricas y posteriormente la integración con dispositivos inteligentes.

---

# 🏋️ GymTrack

**Entrena. Registra. Analiza. Mejora.**
