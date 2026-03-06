# EcoTrack

Aplicación web minimalista para **registrar y visualizar tu huella de carbono diaria** usando lenguaje natural.

## Características

- Escribe en texto libre tus actividades del día (transporte, comidas, etc.).
- Análisis con IA (OpenAI) para detectar actividades y estimar emisiones de CO₂.
- Desglose por actividad y recomendaciones para reducir tu impacto.
- Historial de registros y gráfico de tendencias.

## Requisitos

- Node.js 18+
- Cuenta en [OpenAI](https://platform.openai.com/) para obtener una API key.

## Instalación

```bash
npm install
```

Copia las variables de entorno:

```bash
cp .env.example .env
```

Edita `.env` y configura:

- **DATABASE_URL**: ruta a la base SQLite (por defecto `file:./dev.db`).
- **OPENAI_API_KEY**: tu API key de OpenAI (obligatoria para el análisis).

Crea las tablas en la base de datos:

```bash
npm run db:push
```

## Uso

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000). Escribe en el cuadro de texto qué hiciste hoy (por ejemplo: "Hoy comí carne y viajé 20 km en bus") y pulsa "Calcular huella".

## Scripts

| Comando        | Descripción                    |
|----------------|--------------------------------|
| `npm run dev`  | Servidor de desarrollo         |
| `npm run build`| Build de producción            |
| `npm run start`| Servidor de producción         |
| `npm run test` | Tests unitarios (emisiones)   |
| `npm run db:push` | Sincronizar esquema con la DB |

## Stack

- Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Prisma + SQLite
- OpenAI API (gpt-4o-mini) para extracción de actividades
- Factores de emisión aproximados (DEFRA, EPA, IPCC)
