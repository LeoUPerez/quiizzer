# quiizzer

Quiizzer. Next.js 16 (App Router) + Supabase.

El listado de exámenes es público. Para tomar uno, el alumno crea una cuenta o
inicia sesión mediante correo y contraseña o Google. La sesión queda en cookies
y todos los intentos se enlazan a ella. Toda la lectura y escritura pasa por las rutas de API de Next
(`src/app/api/*`); el navegador nunca habla con Supabase directamente, y las
respuestas correctas solo se entregan cuando un intento está finalizado.

## Requisitos

- Node 26 (`nvm use` lee el `.nvmrc`)
- Un proyecto de Supabase con las tablas `profiles`, `quizzes`, `questions`,
  `question_options`, `attempts` y `attempt_answers`. La app espera además
  la columna `quizzes.subject` (área del examen) y que el proveedor **Email**
  esté activado en Authentication → Sign In / Providers (lo está por defecto).
  No se envían correos: el servidor genera y canjea el enlace de acceso.

## Puesta en marcha

1. Copia `.env.example` a `.env.local` y completa:
   - `NEXT_PUBLIC_SUPABASE_KEY`: clave *publishable* (o *anon*) del proyecto.
   - `SUPABASE_SECRET_KEY`: clave *secret* (o *service_role*). Solo la usa el servidor.
2. Carga los exámenes en Supabase con `is_public = true`.
3. `npm install` y `npm run dev`.

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Compilación de producción |
| `npm run start` | Sirve la compilación |
| `npm run typecheck` | `tsc --noEmit` |

## API

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/quizzes` | Listado público; incluye el último intento si hay sesión |
| GET | `/api/profile` | Perfil registrado en este navegador, o `null` |
| POST | `/api/profile` | Registra `{ fullName, email }`; crea la cuenta si no existe e inicia sesión |
| POST | `/api/auth/signout` | Cierra la sesión de este navegador ("No soy yo") |
| POST | `/api/auth/login` | Inicia sesión con correo y contraseña |
| POST | `/api/auth/google` | Genera la URL OAuth de Google conservando el destino actual |
| GET | `/api/auth/callback` | Canjea el código OAuth o de recuperación por una sesión |
| POST | `/api/auth/recover` | Envía el correo para restablecer la contraseña |
| PUT | `/api/auth/password` | Actualiza la contraseña durante una sesión de recuperación |
| POST | `/api/attempts` | Crea un intento `{ quizId }`; exige perfil registrado |
| GET | `/api/attempts/:id` | Intento con preguntas; incluye soluciones si está finalizado |
| PUT | `/api/attempts/:id/answers` | Guarda una respuesta `{ questionId, selectedAnswer }` |
| POST | `/api/attempts/:id/complete` | Recalifica en el servidor y cierra el intento |

## Configuración de autenticación

- Activa el proveedor **Email** y el proveedor **Google** en Supabase Authentication.
- Configura en Google las credenciales OAuth que Supabase muestra para el proveedor.
- Agrega las URLs de la aplicación local y desplegada a **Authentication → URL Configuration → Redirect URLs**. Los flujos regresan mediante `/api/auth/callback`.
- Configura el proveedor de correo SMTP y la plantilla de recuperación de Supabase para que “¿Olvidaste tu contraseña?” pueda entregar el enlace.

## Despliegue en Vercel

Importa el repositorio y define `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_KEY` y `SUPABASE_SECRET_KEY` en Project Settings →
Environment Variables antes del primer deploy. Las variables `NEXT_PUBLIC_*`
se incrustan al compilar.
