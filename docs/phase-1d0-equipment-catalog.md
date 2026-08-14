# Fase 1D.0 — Catálogo universal e inventario de gimnasio

## 1. Problema original

El catálogo inicial describía correctamente el gimnasio usado para crear GymTrack, pero mezclaba dos conceptos: lo que GymTrack conoce y lo que cada usuario tiene disponible. Además, los IDs se derivaban de la posición en los arrays del seed, por lo que insertar un elemento podía cambiar identidades ya persistidas.

## 2. Catálogo global vs. inventario privado

El catálogo global local contiene músculos, equipos conocidos, aliases, ejercicios y relaciones entre ejercicios y equipo. El inventario privado indica qué elementos de ese catálogo existen en cada ubicación del usuario. Quitar un equipo del gimnasio no lo elimina del catálogo.

Catálogo global:

- `muscle_group`
- `equipment`
- `equipment_alias`
- `exercise`
- `exercise_secondary_muscle`
- `exercise_equipment`

Datos privados por cuenta:

- `training_location`
- `training_location_equipment`
- `custom_equipment`
- `custom_equipment_exercise`

## 3. IDs explícitos y compatibilidad catalog-v1

Los 38 equipos y 86 ejercicios originales conservan exactamente la correspondencia histórica `equipment-001…038` y `exercise-001…086`. El seed ahora declara cada ID explícitamente; nunca vuelve a calcularlo por posición. Así, una base actualizada y una instalación nueva usan las mismas identidades.

`catalog-v1` sigue siendo el seed base. No se reordena ni se reemplaza. La ampliación usa un estado de seed independiente.

## 4. catalog-v2

`catalog-v2` es incremental e idempotente. Agrega 23 equipos (`equipment-039…061`), 23 ejercicios (`exercise-087…109`), sus músculos secundarios, sus requisitos de equipo y 45 aliases. `INSERT OR IGNORE`, IDs explícitos y `_seed_state` evitan duplicados al reiniciar.

Los equipos agregados son: press de pecho convergente, press inclinado y declinado en máquina, remo pecho apoyado, remo iso-lateral, pullover en máquina, jalón convergente, reverse pec deck, press hombro plate-loaded, pendulum squat, belt squat, curl femoral sentado, prensa horizontal, prensa de pantorrilla, máquina hip thrust, máquina de fondos, máquina curl predicador, banco romano, máquina crunch abdominal, caminadora, bicicleta estática, escaladora y remo ergómetro.

Los ejercicios nuevos son movimientos convencionales correspondientes a esos equipos. Cada uno declara ID, músculo principal y secundarios, equipo requerido, familia, patrón, tipo, dificultad, unilateralidad, minutos estimados y tags.

## 5. Metadata, aliases y búsqueda

SQLite v5 amplía `equipment` con descripción, tipo controlado, términos de búsqueda y versión de catálogo. Los tipos permitidos son `free_weight`, `machine`, `cable`, `bench`, `rack`, `bodyweight`, `cardio`, `accessory` y `other`.

`equipment_alias` conserva el texto visible y su forma normalizada. `normalizeSearchText` convierte a minúsculas, elimina diacríticos, recorta y colapsa espacios. La búsqueda usa nombre, categoría, `search_terms` y aliases. Por ejemplo, `JALÓN`, `jalon`, `lat pulldown`, `hack` y `leg curl` encuentran los equipos relacionados sin depender de acentos o mayúsculas.

## 6. Ubicaciones e inventario inicial

Cada `training_location` pertenece a una cuenta y tiene tipo `gym`, `home` u `other`. Índices parciales de SQLite garantizan como máximo una ubicación activa y una predeterminada por usuario. Las claves foráneas compuestas de las tablas hijas incluyen `owner_user_id`, evitando combinar una ubicación de una cuenta con datos de otra.

La migración crea de forma determinista una ubicación activa y predeterminada llamada “Mi gimnasio” para cada perfil existente. `ensureDefaultTrainingLocation` hace lo mismo para cuentas nuevas. Esa ubicación recibe exactamente los 38 equipos originales; los 23 equipos de catalog-v2 permanecen deshabilitados hasta que el usuario los agrega. Reiniciar no crea ubicaciones ni filas de inventario duplicadas.

La aplicación permite crear, renombrar, activar, marcar como predeterminada y eliminar ubicaciones. No se puede eliminar la única ubicación. Si se elimina la activa o predeterminada, otra ubicación asume ese estado dentro de la misma transacción.

## 7. Equipo personalizado

Una máquina personalizada pertenece simultáneamente al usuario y a una ubicación. En esta fase solo se crea con `source = manual`; `ai` queda como valor reservado. Se guarda nombre normalizado, categoría y notas opcionales, y puede tener un `catalog_match_id` futuro.

`custom_equipment_exercise` permite vincularla únicamente con ejercicios oficiales. No existen ejercicios libres en esta fase. Todas las operaciones privadas filtran y validan `owner_user_id`.

## 8. Disponibilidad de ejercicios

La capa de dominio aplica una única regla:

1. Un ejercicio oficial es posible si todos sus equipos requeridos están habilitados en la ubicación activa.
2. Como excepción explícita, una máquina personalizada activa vinculada manualmente con el ejercicio también lo hace disponible.

Un press con barra y banco no está disponible si falta cualquiera de los dos. Un custom vinculado constituye una confirmación del usuario y puede cubrir el equivalente oficial ausente.

## 9. Integración con Coach y sesiones

El generador local añade la ubicación activa y la disponibilidad de equipo a sus filtros de músculos, duración y cantidad. Nunca completa una rutina con ejercicios imposibles. Si existen menos opciones de las solicitadas, devuelve las compatibles y explica cuántas encontró en la ubicación actual.

La selección automática al iniciar un entrenamiento futuro usa la misma disponibilidad. Una rutina ya guardada o una sesión activa no se reescribe al cambiar inventario. Las sesiones completadas, ejercicios históricos, series, pesos y repeticiones tampoco se modifican.

## 10. UI “Mi gimnasio”

Perfil muestra la ubicación activa, el número de equipos disponibles y el acceso tipado `/equipment`. La pantalla mantiene el sistema oscuro de GymTrack y ofrece:

- selector y administración de ubicaciones;
- búsqueda y filtros por categoría;
- secciones “Mi equipo” y “Otros equipos”;
- agregar/quitar sin borrar catálogo;
- detalle `/equipment/[equipmentId]` con descripción, tipo, estado, aliases y ejercicios compatibles;
- alta, edición y eliminación de equipo manual;
- búsqueda y selección de ejercicios oficiales para cada custom;
- estados de carga, pressed, vacíos, toasts y `ConfirmDialog`.

## 11. Offline y multiusuario

Todo funciona en SQLite sin red. Inventario, ubicaciones y customs son privados por cuenta. Una modificación de la cuenta A no aparece en la cuenta B. La migración de datos legacy transfiere también la ownership de ubicaciones y deja que las claves compuestas propaguen el nuevo owner a sus inventarios.

No se almacenan contraseñas, tokens ni credenciales en estas tablas.

## 12. Futura sincronización cloud

La Fase 1D.1 deberá usar SQLite v6 y tratar por separado:

- catálogo global, eventualmente descargable/cacheable desde Supabase para recibir actualizaciones;
- datos privados por usuario, sujetos a sincronización y políticas de acceso.

Esta fase no incluye esquema Supabase, outbox, push/pull, Realtime ni sincronización.

## 13. Futuro reconocimiento con IA

La UI muestra “Escanear máquina · IA próximamente” deshabilitado. No abre cámara, no solicita permisos, no usa image picker, no sube fotos y no llama APIs.

El flujo previsto es: el usuario toma una foto; un servicio futuro analiza estructura, palancas, trayectoria, asiento, agarres, placas/pesas y texto visible; después busca primero una coincidencia en el catálogo GymTrack. Con confianza alta muestra una propuesta para confirmar; con confianza media muestra hasta tres candidatos; sin coincidencia clara ofrece crear equipo personalizado. El usuario siempre confirma antes de guardar.

La IA futura nunca modificará el catálogo global, creará ejercicios oficiales, afirmará certeza con confianza baja, dará recomendaciones médicas basadas solo en la imagen ni guardará automáticamente. Atributos como `ai_confidence`, `recognition_status` y metadata se posponen hasta que exista una necesidad real.

## 14. Migración SQLite v5

La migración se registra con versión `5` y nombre `personal_equipment_inventory`. Solo agrega columnas, tablas, índices y el inventario inicial; no renombra ni elimina estructuras existentes. `PRAGMA foreign_keys = ON` continúa activándose antes de migrar. El histórico y los IDs anteriores permanecen intactos.
