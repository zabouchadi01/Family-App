# Family Calendar - Oracle Cloud Deployment Guide

## Prerequisites
- Credit card for Oracle Cloud verification (won't be charged)
- SSH client (Windows Terminal, PuTTY, or WSL)
- Your existing `.env` file from `backend/.env` (for API keys)

---

## Step 1: Create Oracle Cloud Account (10 min)

1. Go to [cloud.oracle.com](https://cloud.oracle.com) and click "Sign Up"
2. Fill in your details, verify email
3. Enter credit card (verification only, never charged for free-tier)
4. Select home region: **us-ashburn-1** or **us-phoenix-1** (closest to you)
5. Wait for account to be provisioned (can take a few minutes)

---

## Step 2: Create a Free ARM VM Instance (10 min)

1. Log into Oracle Cloud Console
2. Navigate: **Compute** > **Instances** > **Create Instance**
3. Configure:
   - **Name:** `family-calendar`
   - **Compartment:** Leave default
   - **Placement:** Leave default
   - **Image:** Click "Change image" > Select **Ubuntu 22.04** (or 24.04) > **aarch64** (ARM)
   - **Shape:** Click "Change shape" > **Ampere** > **VM.Standard.A1.Flex**
     - OCPUs: **1** (can use up to 4 for free)
     - Memory: **6 GB** (can use up to 24 for free)
   - **Networking:** Use default VCN, or create new one. Ensure **"Assign a public IPv4 address"** is selected
   - **SSH keys:** Either upload your existing public key (`~/.ssh/id_rsa.pub`) or click "Generate a key pair" and **download the private key**

4. Click **Create** and wait for the instance to be "Running" (1-2 min)
5. **Copy the Public IP** from the instance details page — you'll need this everywhere

> **Note:** If you get "Out of capacity" error, try a different availability domain or try again later. Free tier ARM instances are popular.

---

## Step 3: Open Port 3000 in Oracle Cloud Network (5 min)

Oracle has its own network firewall (Security Lists) in addition to the VM's OS firewall. You need to open port 3000 in both.

### 3a. Oracle Cloud Security List (web console)

1. Go to: **Networking** > **Virtual Cloud Networks**
2. Click your VCN (e.g., `vcn-20240101-xxxx`)
3. Click your **Public Subnet** (e.g., `subnet-20240101-xxxx`)
4. Click the **Security List** (e.g., `Default Security List for vcn-...`)
5. Click **Add Ingress Rules**
6. Fill in:
   - **Source CIDR:** `0.0.0.0/0`
   - **IP Protocol:** TCP
   - **Destination Port Range:** `3000`
   - **Description:** `Family Calendar API`
7. Click **Add Ingress Rules**

### 3b. VM OS Firewall (handled by provision script)

The provisioning script (Step 4) automatically runs:
```bash
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
```

---

## Step 4: Provision the VM (15 min)

### 4a. SSH into your VM

```bash
# If you downloaded Oracle's generated key:
ssh -i ~/Downloads/ssh-key-*.key ubuntu@<VM_PUBLIC_IP>

# If you used your own key:
ssh ubuntu@<VM_PUBLIC_IP>
```

> **Windows tip:** If using PuTTY, convert the .key file to .ppk with PuTTYgen first. Or use Windows Terminal with OpenSSH: `ssh -i C:\Users\abouc\Downloads\ssh-key.key ubuntu@<VM_PUBLIC_IP>`

### 4b. Run the provisioning script

From your PC (sends the script to the VM and runs it):
```bash
scp deploy/provision-vm.sh ubuntu@<VM_PUBLIC_IP>:/home/ubuntu/
ssh ubuntu@<VM_PUBLIC_IP> 'bash /home/ubuntu/provision-vm.sh'
```

Or copy-paste the script contents into the SSH session.

This installs: Node.js 20, PostgreSQL 15, PM2, and configures the database.

---

## Step 5: Deploy the Backend Code (10 min)

### 5a. Copy the backend code to the VM

From your PC, in the `Family Calendar` directory:

```bash
scp -r backend ubuntu@<VM_PUBLIC_IP>:/home/ubuntu/family-calendar/
scp -r deploy ubuntu@<VM_PUBLIC_IP>:/home/ubuntu/family-calendar/
```

> **Windows (PowerShell):** Same `scp` command works in Windows Terminal.

### 5b. Verify the files arrived

```bash
ssh ubuntu@<VM_PUBLIC_IP> 'ls /home/ubuntu/family-calendar/backend/'
```

You should see: `package.json`, `src/`, `tsconfig.json`, etc.

---

## Step 6: Configure Environment Variables (10 min)

### 6a. Create the .env file on the VM

```bash
ssh ubuntu@<VM_PUBLIC_IP>
cd /home/ubuntu/family-calendar
cp deploy/.env.template backend/.env
nano backend/.env
```

### 6b. Fill in your values

Copy the API keys from your existing `backend/.env` on your PC. The values you need to fill in:

| Variable | Where to get it |
|----------|----------------|
| `GOOGLE_CLIENT_ID` | Copy from your PC's `backend/.env` |
| `GOOGLE_CLIENT_SECRET` | Copy from your PC's `backend/.env` |
| `GOOGLE_REDIRECT_URI` | `http://<VM_PUBLIC_IP>:3000/api/auth/google/callback` |
| `OPENWEATHER_API_KEY` | Copy from your PC's `backend/.env` |
| `GOOGLE_MAPS_API_KEY` | Copy from your PC's `backend/.env` |
| `UNSPLASH_ACCESS_KEY` | Copy from your PC's `backend/.env` |
| `GEMINI_API_KEY` | Copy from your PC's `backend/.env` |
| `FRONTEND_URL` | `http://<VM_PUBLIC_IP>:8081` |

**DATABASE_URL stays as-is** — it points to the local PostgreSQL on the VM.

Save with `Ctrl+O`, `Enter`, `Ctrl+X`.

---

## Step 7: Update Google OAuth Redirect URI (5 min)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate: **APIs & Services** > **Credentials**
3. Click your OAuth 2.0 Client ID (the Web application one)
4. Under **Authorized redirect URIs**, add:
   ```
   http://<VM_PUBLIC_IP>:3000/api/auth/google/callback
   ```
5. You can keep the `localhost` one too (useful for local dev)
6. Click **Save**

> **Important:** Also add `http://<VM_PUBLIC_IP>:3000` to **Authorized JavaScript origins** if it's not there.

---

## Step 8: Run the Deployment Script (5 min)

```bash
ssh ubuntu@<VM_PUBLIC_IP>
cd /home/ubuntu/family-calendar
bash deploy/deploy-backend.sh
```

This will:
- Install npm dependencies
- Run database migrations
- Start the backend with PM2
- Configure PM2 to auto-start on VM reboot

### Verify it's running

```bash
# On the VM:
curl http://localhost:3000/health

# From your PC browser:
# http://<VM_PUBLIC_IP>:3000/health
```

Expected response: `{"status":"ok","timestamp":"2026-..."}`

---

## Step 9: Re-do Google OAuth (2 min)

Since the VM has a fresh database with no OAuth tokens, you need to sign in again:

1. Open in your PC browser: `http://<VM_PUBLIC_IP>:3000/api/auth/setup`
2. Click "Sign in with Google"
3. Complete the Google sign-in flow
4. You should see a success page
5. Tokens are now stored in the VM's PostgreSQL

---

## Step 10: Update Tablet App (2 min)

**Option A: Change URL in app settings (no rebuild needed)**
1. Open the Family Calendar app on your tablet
2. Tap the settings gear icon
3. Change the API URL to: `http://<VM_PUBLIC_IP>:3000`
4. Save and go back — the app will now talk to the cloud VM

**Option B: Rebuild APK with new default URL**
- I'll update `mobile/src/config/constants.ts` and rebuild the APK
- Only needed if you want the new URL as the default

---

## Step 11: Turn Off Your Desktop PC and Verify

1. On your tablet, confirm all widgets are loading (calendar, weather, drive times)
2. Shut down your desktop PC
3. Wait 30 seconds, then pull-to-refresh on the tablet
4. Everything should still work — the backend is running on the cloud VM now

---

## Ongoing Management

### SSH into the VM
```bash
ssh ubuntu@<VM_PUBLIC_IP>
```

### View logs
```bash
pm2 logs family-calendar
pm2 logs family-calendar --lines 100   # last 100 lines
```

### Restart the backend
```bash
pm2 restart family-calendar
```

### Update the backend code
```bash
# From your PC:
scp -r backend ubuntu@<VM_PUBLIC_IP>:/home/ubuntu/family-calendar/

# On the VM:
cd /home/ubuntu/family-calendar/backend
npm install
npm run migrate
pm2 restart family-calendar
```

### Monitor resource usage
```bash
pm2 monit
htop
```

### Check PM2 auto-startup
```bash
pm2 status
pm2 save --force  # re-save current process list
```

---

## Troubleshooting

| Problem | Diagnosis | Solution |
|---------|-----------|---------|
| Can't SSH into VM | Key permissions or wrong IP | `chmod 600 key.pem`, verify IP in Oracle Console |
| Port 3000 not accessible | Security List or iptables | Check Step 3a (Oracle firewall) and run `sudo iptables -L -n` |
| Database connection error | PostgreSQL auth config | Check `pg_hba.conf` allows md5 auth, restart PostgreSQL |
| `npm install` fails | Might need build tools | `sudo apt-get install -y build-essential python3` |
| PM2 not starting on reboot | Startup script not saved | `pm2 save && pm2 startup` |
| OAuth redirect fails | Wrong redirect URI | Verify URI in Google Console matches `.env` exactly |
| "Out of capacity" creating VM | Free tier ARM is popular | Try different availability domain, or try again in a few hours |
| App shows stale data after deploy | Old tokens might be invalid | Re-do OAuth at `/api/auth/setup` |

---

## Architecture After Migration

```
[Tablet App]  ──HTTP──>  [Oracle Cloud VM:3000]  ──>  [PostgreSQL (local)]
                              │                        [Google Calendar API]
                              │                        [OpenWeatherMap API]
                              │                        [Google Maps API]
                              │                        [Unsplash API]
                              │                        [Gemini API]
                              │                        [BART API]
                              │
[PC Browser]  ──HTTP──>  (OAuth setup only, one-time)
```

Your desktop PC is no longer needed for the backend. The tablet talks directly to the Oracle Cloud VM.
