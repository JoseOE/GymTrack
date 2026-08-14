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

El cliente usa PKCE. El registro contempla las dos respuestas de Supabase: si
hay sesion, el flujo continua; si no la hay, muestra `Revisa tu correo` y no
simula un login. La confirmacion vuelve a GymTrack, intercambia una sola vez el
codigo mediante Supabase y muestra el resultado antes de continuar.

La recuperacion vuelve a una pantalla con `Nueva contrasena` y `Confirmar
contrasena`. Solo habilita el formulario despues de validar el callback PKCE y
actualiza mediante Supabase Auth. La app no analiza ni registra tokens.

En Supabase Dashboard, dentro de Auth > URL Configuration, deben autorizarse
exactamente estas Additional Redirect URLs:

```text
gymtrack://auth/callback
gymtrack://reset-password
```

El scheme ya esta declarado como `gymtrack` en `app.json`. Los callbacks nativos
deben validarse en un development build o binario Android; Expo Go no registra
el scheme propio de la aplicacion. PKCE requiere abrir el correo en el mismo
dispositivo e instalacion que inicio el flujo, porque alli se conserva el
verificador.

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
correo, acceso a sus bandejas. Se debe comprobar registro, confirmacion y
callback PKCE, login, recuperacion y cambio de contrasena, persistencia tras
reinicio, onboarding, logout, aislamiento A/B/A y el flujo de consentimiento en
una instalacion que ya tenga datos de Fase 1B.
