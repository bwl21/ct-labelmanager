# Backup Workflow für ChurchTools Label Manager

## Problem
Bei Conversation-Kompaktierung gehen detaillierte Änderungsschritte verloren, die für Rekonstruktion funktionierender Zustände notwendig sind.

## Lösung: Systematisches Backup

### 1. Vor jeder größeren Änderung
```bash
# Backup der aktuellen funktionierenden Version
cp index.html backups/index-working-$(date +%Y%m%d-%H%M).html
git add . && git commit -m "backup: Working state before [CHANGE_DESCRIPTION]"
```

### 2. Nach jeder funktionierenden Änderung
```bash
# Commit des funktionierenden Zustands
git add . && git commit -m "feat: [DESCRIPTION] - confirmed working"
```

### 3. Bei Problemen
```bash
# Zurück zur letzten funktionierenden Version
git log --oneline -10  # Finde letzten "confirmed working" commit
git checkout [COMMIT_HASH] -- index.html
```

### 4. Backup-Verzeichnis
- `backups/` - Timestamped working versions
- `real-app.html` - Bekannte funktionierende Basis
- Git commits mit "confirmed working" tags

## Aktueller Status
- ✅ `real-app.html` = Funktionierende Basis (Login + Tag Loading)
- ✅ `index.html` = Identisch mit real-app.html (Clean Start)
- ✅ Development Infrastructure committed
- ✅ Broken versions removed

## Nächste Schritte
1. Teste aktuelle Version
2. Bei jeder Änderung: Backup → Change → Test → Commit
3. Nie ohne Backup arbeiten