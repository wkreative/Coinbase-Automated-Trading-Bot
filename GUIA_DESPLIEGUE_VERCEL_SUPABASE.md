# 🚀 Guía Completa de Despliegue: GitHub + Vercel + Supabase (24/7)

El código del proyecto ya ha sido inicializado y guardado en un **commit listo (`main`)** en tu máquina local.

---

## 📌 PASO 1: Subir el Código a GitHub

Ejecuta el siguiente comando en la terminal de tu máquina para subir el código al repositorio `wkreative/Coinbase-Automated-Trading-Bot`:

```bash
git push -u origin main
```

*(Si utilizas autenticación por HTTPS o GitHub Desktop, simplemente publica la rama `main` a `https://github.com/wkreative/Coinbase-Automated-Trading-Bot`).*

---

## ⚡ PASO 2: Configurar Supabase (Backend & Edge Functions 24/7)

### 2.1 Crear el Proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com) e inicia sesión.
2. Haz clic en **"New Project"**.
3. Ponle nombre al proyecto (ej. `coinbase-trading-bot`) y guarda tu contraseña de la base de datos.

### 2.2 Ejecutar Migraciones SQL (Tablas y Datos Iniciales)
1. En el dashboard de Supabase, ve a **SQL Editor** en el menú izquierdo.
2. Copia y ejecuta el contenido del archivo `migrations/20260903000000_initial_schema.sql`.
3. Copia y ejecuta el contenido del archivo `migrations/20260903000001_seed_data.sql`.

### 2.3 Desplegar las Edge Functions
Desde la terminal de tu computadora local, ejecuta:

```bash
# 1. Iniciar sesión en la CLI de Supabase
npx supabase login

# 2. Vincular con tu proyecto de Supabase (reemplaza YOUR_PROJECT_REF con el ID de tu proyecto)
npx supabase link --project-ref YOUR_PROJECT_REF

# 3. Guardar las variables de entorno / secretos en Supabase Secrets
npx supabase secrets set BOT_CRON_SECRET="crea_una_clave_secreta_aqui"
npx supabase secrets set TRADING_MODE="PAPER"
npx supabase secrets set LIVE_TRADING_ENABLED="false"

# (Si en el futuro deseas operar con dinero real, añade tus llaves de Coinbase)
# npx supabase secrets set COINBASE_API_KEY="organizations/..."
# npx supabase secrets set COINBASE_API_SECRET="-----BEGIN EC PRIVATE KEY..."

# 4. Desplegar las Edge Functions
npx supabase functions deploy trading-engine
npx supabase functions deploy bot-control
npx supabase functions deploy emergency-stop
```

---

## 🌐 PASO 3: Desplegar el Dashboard en Vercel

1. Ingresa a [vercel.com](https://vercel.com) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **"Add New Project"** e importa el repositorio: `wkreative/Coinbase-Automated-Trading-Bot`.
3. En la sección **Environment Variables**, añade:
   * `NEXT_PUBLIC_SUPABASE_URL`: Tu URL de Supabase (ej. `https://xyz.supabase.co`).
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Tu Anon Public Key de Supabase.
   * `TRADING_MODE`: `PAPER`
   * `LIVE_TRADING_ENABLED`: `false`
4. Haz clic en **"Deploy"**. En ~1 minuto tu Dashboard estará público en HTTPS con URL de Vercel.

---

## ⏰ PASO 4: Automatizar la Ejecución 24/7 con `pg_cron`

Para que el bot escanee el mercado automáticamente cada 5 minutos sin necesidad de tener tu PC ni el navegador abiertos:

1. En Supabase, ve a **Database** -> **Extensions** y activa la extensión **`pg_cron`** y **`pg_net`**.
2. Ve al **SQL Editor** y ejecuta la siguiente tarea programada:

```sql
SELECT cron.schedule(
  'trigger-trading-engine-every-5min',
  '*/5 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/trading-engine',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer YOUR_ANON_KEY',
      'x-cron-secret', 'crea_una_clave_secreta_aqui'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

---

## ✅ ¡Listo! El Bot Estará Operando 24/7

* Tu Dashboard en **Vercel** te permitirán monitorear saldos, posiciones y cambiar configuraciones desde cualquier dispositivo o teléfono móvil.
* El motor en **Supabase Edge Functions** se ejecutará de forma autónoma cada 5 minutos evaluando las reglas cuantitativas y protegiendo tu capital.
