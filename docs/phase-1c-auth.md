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

## Confirmación de registro por OTP

El flujo principal de registro usa un código OTP de 8 dígitos dentro de
GymTrack. Si `signUp` no devuelve sesión, la app solicita el código, lo valida
con `verifyOtp({ email, token, type: 'email' })` y solo entonces hidrata la
sesión real. El código y la contraseña no se guardan en SQLite ni se registran.

En Supabase Dashboard abre **Authentication > Emails > Email Templates >
Confirm signup**. El contenido debe mostrar `{{ .Token }}` y no depender de
`{{ .ConfirmationURL }}` para el flujo principal. Ejemplo sencillo:

```html
<h2>Confirma tu cuenta de GymTrack</h2>
<p>Tu código de verificación es:</p>
<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px;">{{ .Token }}</p>
<p>Ingresa este código de 8 dígitos en GymTrack.</p>
```

La compatibilidad con `gymtrack://auth/callback` se conserva para correos
anteriores que todavía contengan un enlace. El registro nuevo guía al usuario
por OTP.

## Recuperación de contraseña

La recuperación continúa usando PKCE y `gymtrack://reset-password`. Vuelve a
una pantalla con `Nueva contraseña` y `Confirmar contraseña`, valida el callback
antes de habilitar el formulario y actualiza mediante Supabase Auth. La app no
analiza ni registra tokens.

El template **Reset password** debe conservar un enlace con
`href="{{ .ConfirmationURL }}"`. No debe sustituirse por `{{ .RedirectTo }}`:
`ConfirmationURL` incluye la verificación de Supabase y devuelve a la app con el
código PKCE. Durante ese intercambio, GymTrack mantiene
`gymtrack://reset-password` por encima de Inicio u onboarding hasta recibir
`PASSWORD_RECOVERY` y completar el cambio de contraseña.

En Supabase Dashboard, dentro de Auth > URL Configuration, deben autorizarse
exactamente estas Additional Redirect URLs:

```text
gymtrack://auth/callback
gymtrack://reset-password
```

El scheme ya está declarado como `gymtrack` en `app.json`. Los callbacks nativos
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

La prueba completa requiere dos cuentas de prueba y acceso a sus bandejas. Se
debe comprobar registro y confirmación por OTP, el callback de compatibilidad de
registro, login, recuperación PKCE y cambio de contraseña, persistencia tras
reinicio, onboarding, logout, aislamiento A/B/A y el flujo de consentimiento en
una instalación que ya tenga datos de Fase 1B.
