#!/bin/bash

echo "=================================="
echo "   VIBELINKGH ROLLBACK UTILITY"
echo "=================================="
echo ""
echo "Recent commits:"
git log -5 --oneline --decorate

echo ""
read -p "Enter commit hash to rollback to (or press Enter to cancel): " COMMIT

if [ -z "$COMMIT" ]; then
    echo "❌ No commit specified. Aborting rollback."
    exit 1
fi

# Confirm
echo ""
echo "⚠️  WARNING: You are about to rollback to commit: $COMMIT"
read -p "Are you sure? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Rollback cancelled."
    exit 1
fi

echo ""
echo "🔄 Starting rollback process..."

# Backup current state
timestamp=$(date +%Y%m%d-%H%M%S)
echo "📦 Backing up current state..."
cp -r dist /var/www/backups/dist-pre-rollback-$timestamp

# Checkout specified commit
echo "⏪ Checking out commit: $COMMIT"
git checkout $COMMIT

# Rebuild
echo "🔨 Rebuilding project..."
npm install
npm run build

# Update production
echo "🚀 Updating production directory..."
rm -rf /var/www/vibelinkgh.com/*
cp -r dist/* /var/www/vibelinkgh.com/
chown -R www-data:www-data /var/www/vibelinkgh.com
chmod -R 755 /var/www/vibelinkgh.com

echo ""
echo "✅ Rollback completed to commit: $COMMIT"
echo "📋 Backup saved: /var/www/backups/dist-pre-rollback-$timestamp"
echo "🌐 Verify site: https://vibelinkgh.com"
echo ""
echo "↩️  To return to main branch: git checkout main && npm run build"
