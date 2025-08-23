# Automatic Security Updates

Keep hosts up-to-date with security patches automatically. Combine OS package updates with kernel/livepatching strategies appropriate to your environment.

## Debian/Ubuntu (unattended-upgrades)

Install and enable:

```bash
apt-get update && apt-get install -y unattended-upgrades
unattended-upgrades -v
```

Configure `/etc/apt/apt.conf.d/50unattended-upgrades` to include security origins and auto-reboot during maintenance windows if desired.

Enable periodic updates in `/etc/apt/apt.conf.d/20auto-upgrades`:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

## RHEL/CentOS/Alma/Rocky (dnf-automatic)

```bash
dnf install -y dnf-automatic
systemctl enable --now dnf-automatic.timer
```

Configure `/etc/dnf/automatic.conf` to install security updates automatically and notify via email/SSM.

## Amazon Linux

Use `dnf-automatic` (AL2023) or `yum-cron` (AL2) with similar settings.

## Verification

- Check timers/services: `systemctl list-timers | grep automatic`
- Review logs for applied updates: `/var/log/unattended-upgrades/` or `/var/log/dnf.rpm.log`

## Notes

- Coordinate reboots with availability requirements. Consider live patching (e.g., Canonical Livepatch, Ksplice) for kernel updates.
- Use infrastructure as code and cloud-init to apply consistent settings across instances.
