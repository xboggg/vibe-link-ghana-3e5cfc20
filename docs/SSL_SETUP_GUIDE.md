# VibeLink SSL Setup Guide

## Server Configuration

| Setting | Value |
|---------|-------|
| **Server IP** | 38.242.195.0 |
| **SSH Port** | 80 (also 22 as backup) |
| **HTTP Port** | 8080 |
| **HTTPS Port** | 443 |
| **Web Root** | /var/www/ |

## The Problem

The Contabo server uses **SSH on port 80** (non-standard). Let's Encrypt requires port 80 to validate SSL certificates. This creates a conflict.

## The Solution

Temporarily stop the SSH socket, run certbot, then immediately restart the socket.

---

## SSL Certificate Setup Process

### Prerequisites

1. DNS must be pointing to server (38.242.195.0)
2. You need an active SSH session that will stay connected
3. Site directory and nginx config must already exist

### Step 1: Prepare the Site (Before SSL)

```bash
# Create directory
mkdir -p /var/www/SUBDOMAIN.vibelinkgh.com/images

# Create initial nginx config (HTTP only)
cat > /etc/nginx/sites-available/SUBDOMAIN.vibelinkgh.com << 'EOF'
server {
    listen 8080;
    server_name SUBDOMAIN.vibelinkgh.com;
    root /var/www/SUBDOMAIN.vibelinkgh.com;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

# Enable site
ln -sf /etc/nginx/sites-available/SUBDOMAIN.vibelinkgh.com /etc/nginx/sites-enabled/

# Test and reload nginx
nginx -t && systemctl reload nginx
```

### Step 2: Get SSL Certificate

**IMPORTANT: Run these commands quickly in sequence. Do NOT close your terminal.**

```bash
# Step 1: Stop SSH socket (this frees port 80)
systemctl stop ssh.socket

# Step 2: Run certbot IMMEDIATELY (port 80 is now free)
certbot certonly --standalone -d SUBDOMAIN.vibelinkgh.com --non-interactive --agree-tos --email admin@vibelinkgh.com

# Step 3: Restart SSH socket IMMEDIATELY after certbot finishes
systemctl start ssh.socket
```

**WARNING:** Between stopping and starting ssh.socket, you cannot open new SSH connections. Your existing session stays alive, so don't close it!

### Step 3: Update Nginx for HTTPS

```bash
cat > /etc/nginx/sites-available/SUBDOMAIN.vibelinkgh.com << 'EOF'
server {
    listen 443 ssl;
    server_name SUBDOMAIN.vibelinkgh.com;
    root /var/www/SUBDOMAIN.vibelinkgh.com;
    index index.html;

    ssl_certificate /etc/letsencrypt/live/SUBDOMAIN.vibelinkgh.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/SUBDOMAIN.vibelinkgh.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        try_files $uri $uri/ =404;
    }

    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot|mp4|webm)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
}

server {
    listen 8080;
    server_name SUBDOMAIN.vibelinkgh.com;
    return 301 https://$host$request_uri;
}
EOF

# Test and reload
nginx -t && systemctl reload nginx
```

### Step 4: Verify

```bash
# Check certificate
curl -sI https://SUBDOMAIN.vibelinkgh.com | head -5

# Should show: HTTP/1.1 200 OK
```

---

## Quick Reference Commands

### Check SSH Socket Status
```bash
systemctl status ssh.socket
```

### Check What's Using Port 80
```bash
netstat -tlnp | grep ':80'
```

### List All SSL Certificates
```bash
ls /etc/letsencrypt/live/
```

### Check Certificate Expiry
```bash
certbot certificates
```

### Manual Certificate Renewal
```bash
# Stop socket, renew, start socket
systemctl stop ssh.socket
certbot renew
systemctl start ssh.socket
```

### Test Nginx Configuration
```bash
nginx -t
```

### Reload Nginx
```bash
systemctl reload nginx
```

---

## Troubleshooting

### "Could not bind TCP port 80"
- SSH socket is still running
- Run: `systemctl stop ssh.socket`
- Then run certbot immediately

### Lost SSH Connection
- SSH socket was stopped and your session died
- Access server via **Contabo VNC Console**
- Run: `systemctl start ssh.socket`

### Certificate Not Found
- Check if certbot succeeded: `ls /etc/letsencrypt/live/`
- If not, re-run the SSL process

### Nginx Won't Reload
- Check config syntax: `nginx -t`
- Look for typos in domain name or paths

---

## Certificate Auto-Renewal

Certbot sets up automatic renewal. However, because SSH uses port 80, auto-renewal will fail.

### Option 1: Manual Renewal (Every 60-90 days)
```bash
systemctl stop ssh.socket
certbot renew
systemctl start ssh.socket
```

### Option 2: Cron Job with Socket Management
```bash
# Add to crontab (crontab -e)
0 3 1 */2 * systemctl stop ssh.socket && certbot renew && systemctl start ssh.socket
```
This runs at 3 AM on the 1st of every 2nd month.

---

## Existing VibeLink SSL Certificates

| Subdomain | Certificate Location | Created |
|-----------|---------------------|---------|
| vibelinkgh.com | /etc/letsencrypt/live/vibelinkgh.com/ | - |
| babyadjoa.vibelinkgh.com | /etc/letsencrypt/live/babyadjoa.vibelinkgh.com/ | Jan 24, 2026 |
| babykwame.vibelinkgh.com | /etc/letsencrypt/live/babykwame.vibelinkgh.com/ | Jan 24, 2026 |
| drmensah.vibelinkgh.com | /etc/letsencrypt/live/drmensah.vibelinkgh.com/ | Jan 24, 2026 |
| evmin.vibelinkgh.com | /etc/letsencrypt/live/evmin.vibelinkgh.com/ | Jan 8, 2026 |
| kwekuefua.vibelinkgh.com | /etc/letsencrypt/live/kwekuefua.vibelinkgh.com/ | Jan 24, 2026 |
| mamaakosua.vibelinkgh.com | /etc/letsencrypt/live/mamaakosua.vibelinkgh.com/ | Jan 24, 2026 |
| nana60.vibelinkgh.com | /etc/letsencrypt/live/nana60.vibelinkgh.com/ | Jan 24, 2026 |
| nanayaw.vibelinkgh.com | /etc/letsencrypt/live/nanayaw.vibelinkgh.com/ | Jan 24, 2026 |
| novastream.vibelinkgh.com | /etc/letsencrypt/live/novastream.vibelinkgh.com/ | Jan 24, 2026 |
| osupresec70.vibelinkgh.com | /etc/letsencrypt/live/osupresec70.vibelinkgh.com/ | Jan 8, 2026 |
| pastormensah.vibelinkgh.com | /etc/letsencrypt/live/pastormensah.vibelinkgh.com/ | - |
| sarahjohn.vibelinkgh.com | /etc/letsencrypt/live/sarahjohn.vibelinkgh.com/ | Jan 24, 2026 |
| wo1deku.vibelinkgh.com | /etc/letsencrypt/live/wo1deku.vibelinkgh.com/ | Jan 30, 2026 |

---

## New Subdomain Checklist

- [ ] DNS A record pointing to 38.242.195.0
- [ ] Create /var/www/SUBDOMAIN.vibelinkgh.com/
- [ ] Upload site files
- [ ] Create nginx config (HTTP first)
- [ ] Enable site and reload nginx
- [ ] Test HTTP works: `curl -I http://SUBDOMAIN.vibelinkgh.com:8080`
- [ ] Stop ssh.socket
- [ ] Run certbot
- [ ] Start ssh.socket
- [ ] Update nginx config for HTTPS
- [ ] Reload nginx
- [ ] Test HTTPS: `curl -I https://SUBDOMAIN.vibelinkgh.com`

---

## Important Notes

1. **Never close your terminal** during the SSL process
2. **Port 22 works as backup** if port 80 is unavailable
3. **Certificates expire in 90 days** - set calendar reminder
4. **Keep this guide handy** for future subdomains

---

**Last Updated:** January 30, 2026
**Created For:** wo1deku.vibelinkgh.com SSL setup
