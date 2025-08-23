# Run Services Under Non-Root Users

Reduce blast radius by running application processes as an unprivileged user.

## Linux Hosts

- Create a dedicated system user and group with no login shell:

```bash
useradd --system --home /opt/app --shell /usr/sbin/nologin appuser || true
install -d -o appuser -g appuser /opt/app /var/log/app /var/lib/app
```

- Configure systemd unit to run as this user:

```
[Service]
User=appuser
Group=appuser
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/log/app /var/lib/app
```

## Containers

- Use `USER` directive in Dockerfile to drop root:

```dockerfile
# After installing dependencies and creating directories with correct ownership
USER 10001:10001
```

- Avoid root in Kubernetes: set `securityContext.runAsUser`, `runAsNonRoot: true`.

## Terraform/Provisioning

- Create OS users/groups via cloud-init or config management.
- Ensure directories (logs, cache, uploads) are owned by the app user.
