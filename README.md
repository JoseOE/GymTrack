# Propuesta de Proyecto: GymTrack

## Descripción General

**GymTrack** es un ecosistema tecnológico **B2B2C** diseñado para modernizar la administración y la experiencia de usuario en gimnasios locales.

El sistema integra una **aplicación móvil**, una plataforma backend y un **módulo físico IoT basado en tecnología RFID** para automatizar el control de acceso al gimnasio.

La plataforma permitirá a los administradores gestionar usuarios, membresías, pagos y rutinas de entrenamiento, mientras que los usuarios podrán consultar el estado de su membresía, acceder al gimnasio mediante una tarjeta, llavero o pulsera RFID, visualizar las rutinas asignadas y registrar su progreso.

El sistema busca centralizar los principales procesos del gimnasio en un único ecosistema tecnológico, conectando la administración, el control de acceso y la experiencia deportiva del usuario.

---

# Problemática

Actualmente, muchos gimnasios medianos y locales presentan una desconexión entre sus procesos administrativos, el control de acceso y la gestión de los entrenamientos.

Los administradores pueden depender de procesos manuales o sistemas independientes para:

* Registrar clientes.
* Controlar membresías.
* Verificar pagos.
* Controlar el acceso.
* Distribuir rutinas.
* Registrar información de los usuarios.

Esta situación puede generar problemas como:

* Permitir el acceso a usuarios con membresías vencidas.
* Dificultad para identificar rápidamente a los usuarios.
* Uso de tarjetas físicas sin validación automatizada.
* Registros manuales de acceso.
* Rutinas en papel.
* Falta de integración entre la membresía y el control de acceso.
* Uso de aplicaciones genéricas que no consideran el equipamiento disponible en el gimnasio.

Por su parte, los usuarios pueden experimentar una experiencia fragmentada al depender de diferentes medios para acceder al gimnasio, consultar sus rutinas y registrar su progreso.

GymTrack busca solucionar esta problemática mediante la integración de estos procesos en una sola plataforma.

---

# Objetivo General

Desarrollar e implementar un **ecosistema tecnológico integral denominado GymTrack**, que combine una aplicación móvil, servicios backend y un dispositivo IoT basado en tecnología RFID para centralizar la gestión de membresías, automatizar el control de acceso físico mediante validación en tiempo real y permitir la distribución de rutinas de entrenamiento personalizadas, mejorando la administración del gimnasio y la experiencia del usuario final.

---

# Objetivos Específicos

1. Diseñar y desarrollar una aplicación móvil para la gestión de usuarios, membresías, rutinas y registros de entrenamiento.

2. Implementar una base de datos y servicios backend que permitan centralizar y gestionar de forma segura la información de los gimnasios y sus usuarios.

3. Desarrollar un sistema de control de acceso IoT mediante ESP32 y tecnología RFID, capaz de validar en tiempo real el estado de la membresía de los usuarios.

4. Integrar la aplicación móvil, el backend y el dispositivo IoT mediante mecanismos de comunicación seguros, permitiendo automatizar el control de acceso y la gestión de información.

5. Evaluar el funcionamiento e impacto de GymTrack mediante una implementación piloto, utilizando indicadores relacionados con la automatización, administración y experiencia de los usuarios.

---

# 🧩 Componentes Principales

GymTrack estará compuesto por tres componentes tecnológicos principales:

```text
                         GYMTRACK
                            │
           ┌────────────────┼────────────────┐
           │                │                │
           ▼                ▼                ▼
      Aplicación        Backend            IoT
        Móvil         + Base de Datos   Control de Acceso
           │                │                │
           └────────────────┼────────────────┘
                            │
                            ▼
                         Gimnasio
```

---

# 📱 1. Aplicación Móvil

La aplicación móvil será desarrollada utilizando **React Native, Expo y TypeScript**.

La aplicación contará principalmente con dos perfiles:

## Administrador

El administrador podrá:

* Registrar usuarios.
* Consultar usuarios.
* Gestionar membresías.
* Registrar pagos.
* Consultar estados de cuenta.
* Asignar rutinas.
* Administrar ejercicios.
* Consultar información de acceso.
* Gestionar información del gimnasio.

## Usuario

El usuario podrá:

* Iniciar sesión.
* Consultar su perfil.
* Consultar el estado de su membresía.
* Consultar la fecha de vencimiento.
* Consultar sus rutinas.
* Registrar entrenamientos.
* Registrar series.
* Registrar repeticiones.
* Registrar peso.
* Consultar récords personales.
* Consultar su progreso.
* Consultar su historial de entrenamientos.

El usuario **no necesitará generar códigos QR para acceder al gimnasio**.

Su acceso se realizará mediante una credencial física RFID.

---

# 🔑 2. Sistema de identificación RFID

El sistema utilizará tecnología **RFID (Radio Frequency Identification)** para identificar a los usuarios.

La credencial podrá tomar diferentes formas:

* Tarjeta RFID.
* Llavero RFID.
* Pulsera RFID.
* Otro dispositivo compatible.

El usuario únicamente deberá acercar su credencial al lector instalado en la entrada.

```text
Usuario
   │
   ▼
Tarjeta / Llavero / Pulsera RFID
   │
   ▼
Lector RFID
   │
   ▼
ESP32
   │
   ▼
Backend
   │
   ▼
Validación de membresía
```

---

# 🚪 3. Control de acceso IoT

El módulo IoT estará instalado físicamente en la entrada del gimnasio.

Su función será:

1. Detectar una credencial RFID.
2. Obtener el identificador asociado.
3. Enviar la solicitud de validación.
4. Consultar el backend.
5. Determinar el estado de la membresía.
6. Autorizar o rechazar el acceso.
7. Accionar el mecanismo de apertura cuando corresponda.
8. Registrar el acceso.

El flujo será:

```text
              Usuario
                 │
                 ▼
          Acerca RFID
                 │
                 ▼
           Lector RFID
                 │
                 ▼
               ESP32
                 │
                 ▼
          Solicitud segura
                 │
                 ▼
             Backend
                 │
                 ▼
       ¿Membresía activa?
           │           │
          Sí           No
           │           │
           ▼           ▼
     Abrir acceso   Denegar acceso
           │           │
           └─────┬─────┘
                 ▼
          Registrar evento
```

---

# 🗄️ 4. Backend y Base de Datos

GymTrack utilizará **Supabase** como plataforma backend y **PostgreSQL** como sistema gestor de base de datos.

La base de datos permitirá almacenar información relacionada con:

* Gimnasios.
* Administradores.
* Usuarios.
* Credenciales RFID.
* Membresías.
* Pagos.
* Rutinas.
* Ejercicios.
* Entrenamientos.
* Series.
* Repeticiones.
* Récords personales.
* Registros de acceso.

Una estructura conceptual sería:

```text
Gimnasio
   │
   ├── Administradores
   │
   ├── Usuarios
   │     │
   │     ├── Membresía
   │     ├── Credencial RFID
   │     ├── Rutinas
   │     └── Entrenamientos
   │
   ├── Ejercicios
   │
   └── Registros de acceso
```

---

# 🔐 Seguridad

La información deberá mantenerse aislada entre los diferentes gimnasios.

Para ello se contempla utilizar **Row Level Security (RLS)** en PostgreSQL mediante Supabase.

```text
                    Supabase
                       │
           ┌───────────┼───────────┐
           │           │           │
           ▼           ▼           ▼
       Gimnasio A  Gimnasio B  Gimnasio C
           │           │           │
        Usuarios    Usuarios    Usuarios
           │           │           │
           ▼           ▼           ▼
         Datos       Datos       Datos
```

Cada gimnasio deberá tener acceso únicamente a la información que le corresponde.

---

# 🌐 Comunicación IoT

La comunicación entre el dispositivo IoT y los servicios backend podrá utilizar protocolos ligeros orientados a IoT.

Se contempla el uso de:

```text
ESP32
  │
  ▼
Wi-Fi
  │
  ▼
MQTT
  │
  ▼
TLS
  │
  ▼
Backend
```

MQTT permitirá establecer una comunicación eficiente entre el dispositivo y los servicios del sistema, mientras que TLS proporcionará cifrado durante la transmisión.

---

# 🔄 Flujo completo de acceso

El funcionamiento completo del sistema será:

```text
┌─────────────────────────────┐
│ Usuario                     │
│ Tiene membresía activa      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Credencial RFID             │
│ Tarjeta / llavero / pulsera │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Lector RFID                 │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ ESP32                       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Comunicación segura         │
│ MQTT + TLS                  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Backend / Supabase          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│ Validar membresía           │
└──────────────┬──────────────┘
               │
        ┌──────┴──────┐
        │             │
        ▼             ▼
     ACTIVA        VENCIDA
        │             │
        ▼             ▼
   Autorizar       Rechazar
     acceso          acceso
        │             │
        ▼             ▼
   Abrir puerta    No abrir
        │             │
        └──────┬──────┘
               ▼
      Registrar evento
```

---

# 🏋️ Sistema de entrenamiento

Además del control de acceso, GymTrack permitirá gestionar el entrenamiento de los usuarios.

El administrador podrá crear o asignar rutinas considerando las características del gimnasio.

Por ejemplo:

```text
Gimnasio
   │
   ├── Equipamiento disponible
   │
   ├── Ejercicios
   │
   └── Rutinas
          │
          ▼
       Usuario
```

Esto permitirá evitar que se asignen rutinas que dependan de equipamiento inexistente en el gimnasio.

---

# ⏱️ Registro del entrenamiento

El usuario podrá iniciar una sesión desde la aplicación.

Durante la sesión se podrán registrar:

* Ejercicio.
* Series.
* Repeticiones.
* Peso.
* Tiempo total.
* Tiempo efectivo.
* Tiempo de descanso.
* Descanso promedio.
* Récords personales.

Conceptualmente:

```text
Entrenamiento
     │
     ├── Tiempo total
     │
     ├── Tiempo efectivo
     │
     ├── Tiempo de descanso
     │
     ├── Ejercicios
     │      ├── Series
     │      ├── Repeticiones
     │      └── Peso
     │
     └── Estadísticas
```

---

# 🎓 Aplicación académica por materia

GymTrack es un proyecto multidisciplinario que permitirá integrar los conocimientos de diferentes asignaturas.

Cada materia abordará una parte específica del ecosistema.

---

## 📱 Desarrollo de Aplicaciones Móviles

### Aplicación en GymTrack

Esta asignatura se aplicará principalmente en el desarrollo de la aplicación móvil.

Se utilizarán:

* React Native.
* Expo.
* TypeScript.
* Expo Router.

### Funcionalidades

**Administrador:**

* Login.
* Gestión de usuarios.
* Gestión de membresías.
* Gestión de pagos.
* Gestión de rutinas.

**Usuario:**

* Login.
* Perfil.
* Estado de membresía.
* Consulta de rutinas.
* Registro de entrenamientos.
* Historial.
* Estadísticas.

### Resultado esperado

Una aplicación móvil funcional que sirva como interfaz principal para administradores y usuarios.

---

# 💼 Negocios Electrónicos

### Aplicación en GymTrack

GymTrack será planteado bajo un modelo **B2B2C**.

```text
                 GymTrack
                    │
                    ▼
                 Gimnasio
                    │
             ┌──────┴──────┐
             │             │
             ▼             ▼
       Administrador    Usuario
             │             │
             └──────┬──────┘
                    ▼
              Cliente final
```

### Aplicación de la materia

Se analizarán:

* Modelo de negocio.
* Propuesta de valor.
* Segmento de mercado.
* Clientes objetivo.
* Canales digitales.
* Relación con clientes.
* Servicios digitales.
* Transformación digital.
* Viabilidad comercial.

### Resultado esperado

Definir la propuesta de valor y modelo comercial de GymTrack como solución tecnológica para gimnasios locales.

---

# 🌐 Internet de las Cosas (IoT)

### Aplicación en GymTrack

Esta asignatura se aplicará directamente en el desarrollo del sistema físico de control de acceso.

Se trabajará con:

* ESP32.
* RFID.
* Lectores.
* Comunicación Wi-Fi.
* MQTT.
* Actuadores.
* Automatización.

### Flujo

```text
RFID
 │
 ▼
Lector
 │
 ▼
ESP32
 │
 ▼
Wi-Fi
 │
 ▼
MQTT
 │
 ▼
Backend
 │
 ▼
Respuesta
 │
 ├── Autorizar
 │
 └── Rechazar
```

### Resultado esperado

Desarrollar un prototipo IoT funcional capaz de identificar una credencial RFID y consultar la autorización de acceso.

---

# 🌐 Administración y Seguridad de Redes

### Aplicación en GymTrack

Esta materia se aplicará en el diseño y protección de las comunicaciones entre los diferentes componentes.

```text
Aplicación
    │
    ▼
 Internet
    │
    ▼
 Backend
    │
    ▼
 MQTT + TLS
    │
    ▼
 ESP32
```

### Aspectos a trabajar

* Redes TCP/IP.
* Comunicación cliente-servidor.
* Wi-Fi.
* MQTT.
* TLS.
* Autenticación.
* Control de acceso.
* Seguridad de servicios.
* Segmentación lógica.
* Protección de credenciales.
* Seguridad de la información.

También se analizará la implementación de **RLS** para evitar que un gimnasio pueda consultar información perteneciente a otro.

### Resultado esperado

Diseñar una infraestructura de comunicación segura para la aplicación, backend y dispositivo IoT.

---

# 🔬 Taller de Investigación II

### Aplicación en GymTrack

Esta asignatura se utilizará para investigar y evaluar el impacto de la solución propuesta.

El objetivo será determinar si la implementación de GymTrack puede mejorar los procesos administrativos y la experiencia del usuario.

### Variables e indicadores

Se podrán analizar:

* Tiempo de validación del acceso.
* Número de accesos automatizados.
* Cantidad de membresías vencidas detectadas.
* Reducción de procesos manuales.
* Uso de rutinas digitales.
* Frecuencia de utilización de la aplicación.
* Satisfacción de los usuarios.
* Percepción del servicio.
* Retención de clientes.

### Metodología

```text
Problema
   │
   ▼
Investigación
   │
   ▼
Diseño de solución
   │
   ▼
Desarrollo
   │
   ▼
Implementación piloto
   │
   ▼
Recolección de datos
   │
   ▼
Análisis
   │
   ▼
Resultados
   │
   ▼
Conclusiones
```

### Resultado esperado

Obtener evidencia que permita determinar el impacto de GymTrack en la administración y experiencia de los usuarios.

---

# 🏗️ Arquitectura multidisciplinaria

La arquitectura completa de GymTrack será:

```text
                         ┌───────────────────┐
                         │     GymTrack      │
                         └─────────┬─────────┘
                                   │
                 ┌─────────────────┼─────────────────┐
                 │                 │                 │
                 ▼                 ▼                 ▼
          Aplicación móvil      Backend             IoT
          React Native          Supabase            ESP32
          + Expo                PostgreSQL          + RFID
                 │                 │                 │
                 │                 │                 │
                 └─────────────────┼─────────────────┘
                                   │
                                   ▼
                            Comunicación
                              MQTT + TLS
                                   │
                                   ▼
                              Validación
                                   │
                          ┌────────┴────────┐
                          │                 │
                          ▼                 ▼
                       Usuario           Gimnasio
```

---

# 🛠️ Stack tecnológico

## Aplicación móvil

| Tecnología   | Uso                        |
| ------------ | -------------------------- |
| React Native | Desarrollo multiplataforma |
| Expo         | Framework de desarrollo    |
| React        | Interfaz de usuario        |
| TypeScript   | Tipado estático            |
| Expo Router  | Navegación                 |

## Backend

| Tecnología | Uso                            |
| ---------- | ------------------------------ |
| Supabase   | Backend                        |
| PostgreSQL | Base de datos                  |
| RLS        | Seguridad de datos             |
| API        | Comunicación con la aplicación |

## IoT

| Tecnología | Uso                        |
| ---------- | -------------------------- |
| ESP32      | Microcontrolador           |
| RFID       | Identificación de usuarios |
| Wi-Fi      | Conectividad               |
| MQTT       | Comunicación IoT           |
| TLS        | Comunicación segura        |
| Actuador   | Apertura de acceso         |

---

# 📁 Estructura propuesta del proyecto

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
│       ├── membership.tsx
│       ├── access.tsx
│       ├── history.tsx
│       ├── progress.tsx
│       └── profile.tsx
│
├── components/
│   ├── ui/
│   ├── workout/
│   ├── membership/
│   ├── access/
│   ├── charts/
│   └── common/
│
├── hooks/
│   ├── useWorkout.ts
│   ├── useTimer.ts
│   ├── useMembership.ts
│   └── ...
│
├── services/
│   ├── api/
│   ├── supabase/
│   ├── mqtt/
│   ├── bluetooth/
│   └── sensors/
│
├── types/
│   ├── user.ts
│   ├── gym.ts
│   ├── membership.ts
│   ├── workout.ts
│   ├── access.ts
│   └── rfid.ts
│
├── constants/
│   ├── colors.ts
│   └── config.ts
│
├── utils/
│   ├── time.ts
│   ├── calculations.ts
│   └── validation.ts
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

# 🔐 Consideraciones de seguridad RFID

La tarjeta RFID debe considerarse principalmente como un **identificador**, no como la única capa de seguridad.

El sistema deberá evitar depender únicamente del UID de una tarjeta si el hardware utilizado permite una alternativa más segura.

El flujo recomendado será:

```text
Credencial RFID
      │
      ▼
Identificador
      │
      ▼
ESP32
      │
      ▼
Backend
      │
      ▼
¿Credencial válida?
      │
      ▼
¿Membresía activa?
      │
      ▼
¿Usuario autorizado?
      │
      ▼
Autorizar / Rechazar
```

De esta forma, una credencial no determina por sí misma si una persona puede ingresar; el **backend mantiene la decisión de autorización**.

---

# 🗺️ Roadmap

## Fase 1 — Planeación

* [x] Definir problemática.
* [x] Definir objetivo general.
* [x] Definir propuesta de solución.
* [x] Definir modelo B2B2C.
* [x] Definir arquitectura multidisciplinaria.
* [x] Seleccionar RFID como tecnología de acceso.
* [ ] Diseñar arquitectura definitiva.
* [ ] Diseñar modelo de datos.

## Fase 2 — Aplicación móvil

* [x] Crear proyecto Expo.
* [x] Configurar React Native.
* [x] Configurar TypeScript.
* [x] Configurar Expo Router.
* [ ] Diseñar interfaz.
* [ ] Login.
* [ ] Registro.
* [ ] Perfil.
* [ ] Dashboard.
* [ ] Gestión de membresías.
* [ ] Gestión de rutinas.
* [ ] Historial.
* [ ] Estadísticas.

## Fase 3 — Backend

* [ ] Configurar Supabase.
* [ ] Diseñar PostgreSQL.
* [ ] Crear tablas.
* [ ] Crear relaciones.
* [ ] Implementar autenticación.
* [ ] Implementar RLS.
* [ ] Crear servicios/API.
* [ ] Gestionar membresías.
* [ ] Gestionar pagos.
* [ ] Gestionar credenciales RFID.

## Fase 4 — IoT

* [ ] Seleccionar lector RFID.
* [ ] Seleccionar credenciales RFID.
* [ ] Configurar ESP32.
* [ ] Leer credenciales.
* [ ] Conectar ESP32 a Wi-Fi.
* [ ] Implementar comunicación MQTT.
* [ ] Implementar TLS.
* [ ] Implementar validación.
* [ ] Integrar actuador.
* [ ] Realizar pruebas.

## Fase 5 — Integración

* [ ] Integrar aplicación y backend.
* [ ] Integrar backend y ESP32.
* [ ] Integrar RFID.
* [ ] Implementar validación de membresías.
* [ ] Implementar registro de accesos.
* [ ] Realizar pruebas integrales.

## Fase 6 — Investigación

* [ ] Definir metodología.
* [ ] Definir variables.
* [ ] Definir indicadores.
* [ ] Diseñar instrumentos de evaluación.
* [ ] Realizar prueba piloto.
* [ ] Recopilar datos.
* [ ] Analizar resultados.
* [ ] Evaluar impacto.
* [ ] Generar conclusiones.

---

# 📊 Indicadores de impacto

| Indicador                      | Propósito                        |
| ------------------------------ | -------------------------------- |
| Tiempo de validación           | Medir rapidez del acceso         |
| Accesos automatizados          | Medir funcionamiento del sistema |
| Membresías vencidas detectadas | Evaluar control administrativo   |
| Accesos rechazados             | Evaluar validación               |
| Procesos manuales reducidos    | Medir automatización             |
| Uso de rutinas digitales       | Medir adopción                   |
| Uso de la aplicación           | Medir participación              |
| Satisfacción del usuario       | Evaluar experiencia              |
| Retención de clientes          | Evaluar impacto comercial        |

---

# 📌 Estado del proyecto

**Estado:** 🚧 En desarrollo

GymTrack se encuentra actualmente en la etapa de **planeación, definición de arquitectura y configuración del entorno de desarrollo**.

El proyecto integra diferentes áreas:

```text
        Desarrollo de Apps
                │
                ▼
          Aplicación móvil
                │
                │
Negocios ─── GymTrack ─── IoT
                │
                │
                ▼
         Backend + BD
                │
                ▼
        Redes y Seguridad
                │
                ▼
        Investigación
```

---

# 📚 Recursos

* [Expo](https://expo.dev)
* [Documentación de Expo](https://docs.expo.dev/)
* [Expo Router](https://docs.expo.dev/router/introduction/)
* [React Native](https://reactnative.dev/)
* [React](https://react.dev/)
* [TypeScript](https://www.typescriptlang.org/)
* [Supabase](https://supabase.com/)
* [PostgreSQL](https://www.postgresql.org/)
* [MQTT](https://mqtt.org/)
* [ESP32](https://www.espressif.com/en/products/socs/esp32)
* [Android Studio](https://developer.android.com/studio)

---

# 👥 Proyecto académico

**Proyecto:** GymTrack

**Modelo de negocio:** B2B2C

**Tipo:** Ecosistema tecnológico para gimnasios locales

**Aplicación:** React Native + Expo

**Backend:** Supabase + PostgreSQL

**Control de acceso:** RFID + ESP32

**Comunicación IoT:** MQTT + TLS

**Plataforma inicial:** Android

**Áreas académicas involucradas:**

* Desarrollo de Aplicaciones Móviles
* Negocios Electrónicos
* Internet de las Cosas
* Administración y Seguridad de Redes
* Taller de Investigación II

---

# 🏋️ GymTrack

> **Administra. Identifica. Accede. Entrena. Analiza. Mejora.**

GymTrack busca transformar la operación tradicional de los gimnasios mediante la integración de **aplicaciones móviles, servicios en la nube, identificación RFID, dispositivos IoT, redes seguras y análisis de información**, creando un ecosistema tecnológico que conecte al gimnasio con sus usuarios.
