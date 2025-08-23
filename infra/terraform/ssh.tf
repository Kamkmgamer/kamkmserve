# SSH hardening placeholders — commented for safety by default.
# Apply via your chosen compute service (EC2, droplet, VM, etc.).

# Example AWS EC2 launch template with hardening via user_data (cloud-init)
# resource "aws_launch_template" "app" {
#   name_prefix   = "${var.project_name}-lt-"
#   image_id      = var.ami_id
#   instance_type = var.instance_type
#
#   # Enforce key-based auth: associate an SSH key
#   key_name = var.ssh_key_name
#
#   user_data = base64encode(<<-EOT
#   #cloud-config
#   ssh_pwauth: false
#   disable_root: true
#   chpasswd:
#     expire: false
#   # Optionally, further harden SSHD config
#   write_files:
#     - path: /etc/ssh/sshd_config.d/99-hardening.conf
#       permissions: '0644'
#       content: |
#         PermitRootLogin no
#         PasswordAuthentication no
#         ChallengeResponseAuthentication no
#         KbdInteractiveAuthentication no
#         PubkeyAuthentication yes
#         X11Forwarding no
#         AllowTcpForwarding no
#         ClientAliveInterval 300
#         ClientAliveCountMax 2
#   runcmd:
#     - systemctl restart sshd
#   EOT
#   )
# }
#
# variable "ami_id" { type = string }
# variable "instance_type" { type = string  default = "t3.micro" }
# variable "ssh_key_name" { type = string }
