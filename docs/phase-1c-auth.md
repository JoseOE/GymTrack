# Fase 1C: autenticacion y datos locales por cuenta

## Configuracion

La app requiere estas variables publicas de Expo en un archivo `.env` local:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

El cliente solo usa la clave publicable. Supabase se limita a Auth y a la tabla
`public.profiles`; entrenamientos, rutinas, planes y preferencias permanecen en
SQLite.

## Confirmacion y recuperacion de correo

El registro contempla las dos respuestas de Supabase: si hay sesion, el flujo
continua; si no la hay, muestra `Revisa tu correo` y no simula un login. La
recuperacion solicita el enlace mediante Supabase, pero completar el retorno en
una instalacion nativa requiere configurar en Supabase una URL permitida para el
scheme `gymtrack://` y validar el deep link en un development build. Esta fase no
incluye una pantalla para establecer una contrasena nueva desde ese enlace.

## Migracion SQLite v4

La migracion v4 agrega `owner_user_id` a `routine` y `workout_session`, migra las
filas existentes al perfil `local-user`, sustituye el indice de sesion activa
global por uno unico por propietario y crea indices de consulta por propietario.
Triggers impiden nuevas filas privadas sin propietario.

`weekly_plan` ya pertenece a `user_profile`. Los ejercicios, series y dias del
plan se aislan a traves de su padre y todas sus operaciones verifican el
propietario autenticado.

La tabla `local_data_migration` conserva el estado de la decision legacy:

- `available`: hay datos relevantes bajo `local-user` y se pide consentimiento.
- `linked`: los datos se vincularon transaccionalmente al primer usuario elegido.
- `archived`: el usuario eligio empezar de cero; los datos legacy se conservan,
  pero no se muestran ni se reasignan automaticamente.

En una instalacion nueva el estado queda en `none`, sin mostrar una propuesta
falsa de migracion.

## QA que necesita cuentas reales

La prueba completa requiere dos cuentas de prueba y, si Supabase exige confirmar
correo, acceso a sus bandejas. Se debe comprobar registro, confirmacion, login,
persistencia tras reinicio, onboarding, logout, aislamiento A/B/A y el flujo de
consentimiento en una instalacion que ya tenga datos de Fase 1B.
