#!/bin/bash
# ============================================================================
# Family Calendar - Oracle Cloud VM Provisioning Script
# Run this ONCE on a fresh Ubuntu 22.04/24.04 ARM instance
# Usage: ssh ubuntu@<VM_IP> 'bash -s' < provision-vm.sh
# ============================================================================

set -euo pipefail

echo "========================================="
echo "Family Calendar - VM Provisioning"
echo "========================================="

# --- System Updates ---
echo "[1/6] Updating system packages..."
sudo apt-get update -y
sudo apt-get upgrade -y

# --- Node.js 20 LTS ---
echo "[2/6] Installing Node.js 20 LTS..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

# --- PostgreSQL 15 ---
echo "[3/6] Installing PostgreSQL 15..."
sudo apt-get install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database user and database (matching docker-compose.yml config)
echo "[4/6] Configuring PostgreSQL database..."
sudo -u postgres psql -c "CREATE USER dashboard WITH PASSWORD 'dashboard_secret';" 2>/dev/null || echo "User 'dashboard' already exists"
sudo -u postgres psql -c "CREATE DATABASE family_dashboard OWNER dashboard;" 2>/dev/null || echo "Database 'family_dashboard' already exists"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE family_dashboard TO dashboard;"

# Configure PostgreSQL to accept local password connections
# Update pg_hba.conf to use md5 for local connections
PG_HBA=$(sudo -u postgres psql -t -c "SHOW hba_file;" | xargs)
echo "PostgreSQL hba_file: $PG_HBA"

# Backup original
sudo cp "$PG_HBA" "${PG_HBA}.bak"

# Replace 'peer' auth with 'md5' for local connections so the app can connect with password
sudo sed -i 's/local\s\+all\s\+all\s\+peer/local   all             all                                     md5/' "$PG_HBA"

# Restart PostgreSQL to apply auth changes
sudo systemctl restart postgresql

# Verify connection works
echo "Verifying database connection..."
PGPASSWORD=dashboard_secret psql -h 127.0.0.1 -U dashboard -d family_dashboard -c "SELECT 1;" > /dev/null 2>&1 && echo "Database connection OK" || echo "WARNING: Database connection failed - check pg_hba.conf"

# --- PM2 Process Manager ---
echo "[5/6] Installing PM2 globally..."
sudo npm install -g pm2
echo "PM2 version: $(pm2 -v)"

# Configure PM2 to start on boot
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ubuntu --hp /home/ubuntu
echo "PM2 startup configured"

# --- Firewall (iptables) ---
echo "[6/6] Opening port 3000 in OS firewall..."
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT

# Make iptables rule persistent across reboots
sudo apt-get install -y iptables-persistent
sudo sh -c 'iptables-save > /etc/iptables/rules.v4'

# --- Create app directory ---
mkdir -p /home/ubuntu/family-calendar

echo ""
echo "========================================="
echo "Provisioning complete!"
echo "========================================="
echo ""
echo "Installed:"
echo "  - Node.js $(node -v)"
echo "  - npm $(npm -v)"
echo "  - PostgreSQL $(psql --version | awk '{print $3}')"
echo "  - PM2 $(pm2 -v)"
echo ""
echo "Database:"
echo "  - User: dashboard"
echo "  - Database: family_dashboard"
echo "  - Connection: postgresql://dashboard:dashboard_secret@127.0.0.1:5432/family_dashboard"
echo ""
echo "Next step: Run the deployment script (deploy-backend.sh)"
echo "========================================="
