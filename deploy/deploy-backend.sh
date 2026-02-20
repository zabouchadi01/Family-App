#!/bin/bash
# ============================================================================
# Family Calendar - Backend Deployment Script
# Run this on the VM after provisioning and after copying the backend code
# Usage: cd /home/ubuntu/family-calendar && bash deploy-backend.sh
# ============================================================================

set -euo pipefail

APP_DIR="/home/ubuntu/family-calendar/backend"

echo "========================================="
echo "Family Calendar - Backend Deployment"
echo "========================================="

# --- Verify backend directory exists ---
if [ ! -d "$APP_DIR" ]; then
  echo "ERROR: Backend directory not found at $APP_DIR"
  echo "First, copy the backend code to the VM:"
  echo "  scp -r backend/ ubuntu@<VM_IP>:/home/ubuntu/family-calendar/"
  exit 1
fi

cd "$APP_DIR"

# --- Verify .env exists ---
if [ ! -f ".env" ]; then
  echo "ERROR: .env file not found in $APP_DIR"
  echo "Copy .env.template and fill in your values:"
  echo "  cp /home/ubuntu/family-calendar/deploy/.env.template $APP_DIR/.env"
  echo "  nano $APP_DIR/.env"
  exit 1
fi

# --- Install dependencies ---
echo "[1/4] Installing npm dependencies..."
npm install --production=false
# Need devDependencies for ts-node-dev and TypeScript compilation

# --- Run database migrations ---
echo "[2/4] Running database migrations..."
npm run migrate

# --- Stop existing PM2 process if running ---
echo "[3/4] Setting up PM2..."
pm2 delete family-calendar 2>/dev/null || true

# --- Start with PM2 ---
echo "[4/4] Starting backend with PM2..."
pm2 start npm --name "family-calendar" -- run dev
pm2 save

echo ""
echo "========================================="
echo "Deployment complete!"
echo "========================================="
echo ""
echo "Backend is running. Verify with:"
echo "  curl http://localhost:3000/health"
echo ""
echo "PM2 commands:"
echo "  pm2 status          - Check process status"
echo "  pm2 logs             - View logs"
echo "  pm2 restart family-calendar  - Restart"
echo "  pm2 monit            - Live monitoring"
echo ""
echo "From your PC/tablet, test:"
echo "  http://<VM_PUBLIC_IP>:3000/health"
echo "========================================="
