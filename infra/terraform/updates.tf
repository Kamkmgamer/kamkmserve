# Automatic security updates — placeholders via cloud-init (commented by default)

# Example for Debian/Ubuntu using unattended-upgrades
# data "cloudinit_config" "auto_updates" {
#   gzip          = false
#   base64_encode = false
#
#   part {
#     content_type = "text/cloud-config"
#     content = <<-CLOUDCFG
#     #cloud-config
#     packages:
#       - unattended-upgrades
#     write_files:
#       - path: /etc/apt/apt.conf.d/20auto-upgrades
#         permissions: '0644'
#         content: |
#           APT::Periodic::Update-Package-Lists "1";
#           APT::Periodic::Unattended-Upgrade "1";
#     runcmd:
#       - unattended-upgrades -v || true
#     CLOUDCFG
#   }
# }
#
# # Attach to your compute resource user_data
# # user_data = data.cloudinit_config.auto_updates.rendered
