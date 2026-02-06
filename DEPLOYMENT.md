# Family Calendar Deployment Guide

This guide covers deploying the Family Calendar app from local development to a physical Android tablet.

## Prerequisites

- Windows PC with static IP on your home network
- Android tablet on the same network
- Node.js 18+ installed
- Docker Desktop installed
- Android Studio (for building APK)

## Step 1: Configure Static IP

Your PC needs a static IP so the tablet can reliably connect.

### Option A: Router DHCP Reservation (Recommended)

1. Find your PC's MAC address:
   ```cmd
   ipconfig /all
   ```
   Look for "Physical Address" under your network adapter.

2. Log into your router admin (usually http://192.168.1.1)
3. Find DHCP settings > Address Reservation
4. Add reservation for your PC's MAC to a fixed IP (e.g., 192.168.1.100)

### Option B: Windows Static IP

1. Settings > Network & Internet > Ethernet/Wi-Fi
2. Click on your network > Hardware properties
3. Edit IP assignment > Manual > IPv4 On
4. Set:
   - IP: 192.168.1.100 (or your chosen IP)
   - Subnet: 255.255.255.0
   - Gateway: 192.168.1.1 (your router)
   - DNS: 8.8.8.8

## Step 2: Update Backend Configuration

1. Copy the production environment template:
   ```cmd
   cd "Family Calendar\backend"
   copy .env.production.example .env
   ```

2. Edit `.env` and replace `YOUR_SERVER_IP` with your static IP:
   ```
   DATABASE_URL=postgresql://dashboard:dashboard_secret@192.168.1.100:5432/family_dashboard
   GOOGLE_REDIRECT_URI=http://192.168.1.100:3000/api/auth/google/callback
   ```

3. **Important**: Update Google Cloud Console with the new redirect URI:
   - Go to https://console.cloud.google.com/apis/credentials
   - Edit your OAuth 2.0 Client
   - Add `http://192.168.1.100:3000/api/auth/google/callback` to Authorized redirect URIs
   - Save

## Step 3: Start Backend Services

### Start PostgreSQL

```cmd
cd "Family Calendar"
docker-compose up -d
```

Verify it's running:
```cmd
docker ps
```

### Build and Start Backend

```cmd
cd "Family Calendar\backend"
npm install
npm run build
```

#### Option A: Using PM2 (Recommended)

```cmd
npm install -g pm2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

View logs:
```cmd
pm2 logs family-calendar-api
```

#### Option B: Simple Node

```cmd
node dist/index.js
```

### Verify Backend is Running

From another device on the network:
```
http://192.168.1.100:3000/health
```

Should return: `{"status":"ok","timestamp":"..."}`

## Step 4: Build Android APK

### Create Release Keystore (First Time Only)

```cmd
cd "Family Calendar\mobile\android"

keytool -genkeypair -v -storetype PKCS12 -keystore family-calendar.keystore -alias family-calendar -keyalg RSA -keysize 2048 -validity 10000
```

Follow prompts to set passwords.

### Configure Keystore

```cmd
copy keystore.properties.example keystore.properties
```

Edit `keystore.properties` with your keystore details:
```
storeFile=family-calendar.keystore
storePassword=your_password
keyAlias=family-calendar
keyPassword=your_password
```

### Build Release APK

```cmd
cd "Family Calendar\mobile"
npx react-native build-android --mode=release
```

Or using Gradle directly:
```cmd
cd "Family Calendar\mobile\android"
.\gradlew assembleRelease
```

APK location: `android/app/build/outputs/apk/release/app-release.apk`

## Step 5: Install on Tablet

### Option A: ADB Install

1. Enable Developer Options on tablet
2. Enable USB Debugging
3. Connect tablet via USB
4. Run:
   ```cmd
   adb install "Family Calendar\mobile\android\app\build\outputs\apk\release\app-release.apk"
   ```

### Option B: File Transfer

1. Copy APK to tablet via USB or cloud storage
2. Open APK on tablet to install
3. Allow installation from unknown sources if prompted

## Step 6: Configure App on Tablet

1. Open Family Calendar app
2. Go to Settings (gear icon)
3. In "Server Configuration", enter your backend URL:
   ```
   http://192.168.1.100:3000
   ```
4. Tap "Save URL"
5. Tap "Sign In with Google" to authenticate

## Verification Checklist

- [ ] Backend health check responds: `http://YOUR_IP:3000/health`
- [ ] PostgreSQL container running: `docker ps`
- [ ] App connects to backend (no network errors)
- [ ] OAuth sign-in works and returns to app
- [ ] Calendar events display
- [ ] Weather data displays
- [ ] Drive times display
- [ ] Data refreshes every 15 minutes

## Troubleshooting

### "Network request failed"

- Check tablet and PC are on same network
- Verify backend URL in app settings
- Check Windows Firewall allows port 3000
- Test: `http://YOUR_IP:3000/health` in tablet browser

### OAuth doesn't return to app

- Verify deep link scheme in AndroidManifest.xml
- Check Google Cloud Console has correct redirect URI
- Check backend .env has correct GOOGLE_REDIRECT_URI

### Database connection failed

- Verify PostgreSQL container is running: `docker ps`
- Check DATABASE_URL in .env uses correct IP
- Verify PostgreSQL port 5432 is accessible

### Windows Firewall

If tablet can't connect, add firewall rules:

```cmd
netsh advfirewall firewall add rule name="Family Calendar API" dir=in action=allow protocol=tcp localport=3000
netsh advfirewall firewall add rule name="PostgreSQL" dir=in action=allow protocol=tcp localport=5432
```

## Maintenance

### View Backend Logs

```cmd
pm2 logs family-calendar-api
```

### Restart Backend

```cmd
pm2 restart family-calendar-api
```

### Update Backend

```cmd
cd "Family Calendar\backend"
git pull
npm install
npm run build
pm2 restart family-calendar-api
```

### Backup Database

```cmd
docker exec family_dashboard_db pg_dump -U dashboard family_dashboard > backup.sql
```
