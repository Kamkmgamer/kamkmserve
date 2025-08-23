# Input variables for Terraform IaC scaffold

variable "aws_region" {
  description = "AWS region (when using AWS provider)"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "A short identifier for this project"
  type        = string
  default     = "kamkmserve"
}
