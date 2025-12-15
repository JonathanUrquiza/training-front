# 🏋️ Training Tracker Frontend

Frontend de la aplicación Training Tracker, construido con **Next.js 15**, **TypeScript** y **Tailwind CSS**.

## 🚀 Tecnologías

- **Next.js 15** - App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **TanStack Query** - Server state
- **Recharts** - Charts
- **Lucide React** - Icons

## 🏗️ Estructura

```
frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, Register
│   │   ├── (dashboard)/     # Dashboard, Workout, Records, etc.
│   │   ├── layout.tsx       # Root layout
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles
│   ├── components/
│   │   ├── layout/          # Sidebar, DashboardLayout
│   │   ├── ui/              # Reusable UI components
│   │   ├── dashboard/       # Dashboard specific
│   │   ├── workout/         # Workout components
│   │   └── records/         # Records components
│   ├── lib/
│   │   └── api.ts           # API client
│   ├── store/
│   │   └── authStore.ts     # Auth state (Zustand)
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   └── hooks/               # Custom hooks
├── public/
└── package.json
```

## 🚀 Setup

### Requisitos
- Node.js 18+
- npm o yarn

### Instalación

```bash
# Navegar al directorio
cd frontend

# Instalar dependencias
npm install

# Crear archivo de variables de entorno
cp .env.local.example .env.local
# Editar .env.local con la URL del backend
```

### Desarrollo

```bash
npm run dev
```

La app estará disponible en `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## 🔧 Variables de Entorno

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Para producción (Vercel):
```env
NEXT_PUBLIC_API_URL=https://tu-backend.herokuapp.com/api
```

## 🚢 Deploy en Vercel

### Opción 1: CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy producción
vercel --prod
```

### Opción 2: GitHub Integration

1. Conectar repositorio a Vercel
2. Configurar variables de entorno:
   - `NEXT_PUBLIC_API_URL`: URL del backend en Heroku
3. Deploy automático en cada push

### Configuración en Vercel

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `.next` |

## 📱 Páginas

| Ruta | Descripción |
|------|-------------|
| `/` | Redirect a dashboard o login |
| `/login` | Inicio de sesión |
| `/register` | Registro de usuario |
| `/dashboard` | Panel principal |
| `/workout` | Generar/ver entrenamientos |
| `/calendar` | Calendario de entrenamientos |
| `/progress` | Gráficos de progreso |
| `/goals` | Gestión de metas |
| `/records` | Marcas personales (PRs) |
| `/history` | Historial de entrenamientos |

## 🎨 Diseño

### Paleta de Colores

| Variable | Color | Uso |
|----------|-------|-----|
| `--bg-primary` | #0f0f14 | Fondo principal |
| `--bg-card` | #1e1e28 | Tarjetas |
| `--accent-primary` | #ff6b35 | Acento principal (naranja) |
| `--accent-secondary` | #f7c948 | Acento secundario (amarillo) |
| `--accent-tertiary` | #00d4aa | Acento terciario (verde) |

### Tipografías

- **Outfit** - Texto general
- **JetBrains Mono** - Números y código

## 🔐 Autenticación

El frontend usa JWT para autenticación:

1. Token almacenado en cookie (`js-cookie`)
2. Estado persistido en Zustand
3. Interceptor Axios agrega token a requests
4. Redirect automático a login si token expira

## 📝 Licencia

MIT
