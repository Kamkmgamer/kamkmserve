# Disabling Unused Ports and Services

Harden hosts and networks by closing all ports and stopping/removing unnecessary services. Only explicitly required ports should be allowed.

## Recommended Defaults

- Allow 80/tcp (HTTP) only when behind a load balancer or for redirects to HTTPS.
- Allow 443/tcp (HTTPS) — primary public ingress.
- Block all other inbound ports by default.
- Restrict outbound traffic to required destinations (e.g., HTTPS 443, database endpoints, monitoring).

## Examples (AWS)

- Security Group (ingress): allow 443 from 0.0.0.0/0; optionally 80 from LB CIDR; deny others.
- Security Group (egress): allow 443; optionally specific DB ports to known CIDRs (e.g., 5432 to RDS/Neon).

## System Services

Use cloud-init or provisioning to disable and mask unused services:

```bash
# Examples; adjust to your distro and needs
systemctl disable --now telnet || true
systemctl disable --now ftp || true
systemctl disable --now rsh || true
systemctl disable --now nfs || true
systemctl disable --now cups || true
systemctl disable --now avahi-daemon || true
systemctl disable --now rpcbind || true
```

On container images: remove unnecessary packages to reduce the attack surface.

## Verification

- Nmap (from a separate host): `nmap -Pn -sT <public_ip>` — only 80/443 should respond as designed.
- Host firewall (optional): configure `ufw`/`firewalld` in addition to cloud firewalls for defense in depth.

## Notes

- Keep these rules in code (Terraform) and in provisioning scripts so changes are reviewed and audited.
