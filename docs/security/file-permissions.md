# File Permissions and Ownership

Apply least-privilege file permissions. Prevent accidental disclosure of secrets and limit write access for runtime users.

## Recommended Defaults

- Source tree: owned by build user; no world-writable files.
- Secrets/config: `600` (owner read/write) with correct ownership.
- Logs: `640` (owner read/write, group read) where applicable.
- Executables/scripts: `750` (owner/group execute) where appropriate.

## Linux Commands (examples)

```bash
# Prevent world-writable files
chmod -R go-w .

# Lock down env files and keys
[ -f .env ] && chmod 600 .env || true
find . -type f -name "*.pem" -exec chmod 600 {} +

# Ensure scripts are executable by owner
find scripts -type f -name "*.sh" -exec chmod 750 {} + 2>/dev/null || true
```

## Terraform/Provisioning

- Apply permissions via `cloud-init` or configuration management.
- Ensure application user owns only necessary directories (uploads, cache, logs).

## Containers

- COPY files with correct ownership using `--chown`.
- Set restrictive file modes at build time; avoid mounting writable secrets.
