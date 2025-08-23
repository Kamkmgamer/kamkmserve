# Network hardening placeholders — commented for safety by default.
# Uncomment and adapt to your provider when ready.

# Example AWS VPC + Security Group (ingress/egress restrictions)
# resource "aws_security_group" "app_sg" {
#   name        = "${var.project_name}-app-sg"
#   description = "Restrict inbound/outbound traffic for app"
#   vpc_id      = var.vpc_id
#
#   # Inbound: allow HTTPS only
#   ingress {
#     description = "HTTPS"
#     from_port   = 443
#     to_port     = 443
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#
#   # Optional: allow HTTP only behind load balancers or internal CIDRs
#   # ingress {
#   #   description = "HTTP from ALB"
#   #   from_port   = 80
#   #   to_port     = 80
#   #   protocol    = "tcp"
#   #   cidr_blocks = [var.lb_cidr]
#   # }
#
#   # Outbound: restrict to required destinations (e.g., HTTPS)
#   egress {
#     description = "HTTPS egress"
#     from_port   = 443
#     to_port     = 443
#     protocol    = "tcp"
#     cidr_blocks = ["0.0.0.0/0"]
#   }
#
#   tags = {
#     Project = var.project_name
#   }
# }

# variable "vpc_id" {
#   type        = string
#   description = "VPC to attach the security group"
# }
#
# variable "lb_cidr" {
#   type        = string
#   description = "CIDR of load balancer or internal network for HTTP access"
#   default     = "10.0.0.0/16"
# }
