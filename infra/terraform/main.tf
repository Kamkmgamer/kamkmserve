# Terraform IaC scaffold. All providers/resources are commented to be safe by default.

terraform {
  # Uncomment and set your chosen backend to store state remotely (recommended)
  # backend "s3" {
  #   bucket = "YOUR_BUCKET"
  #   key    = "terraform/state/kamkmserve.tfstate"
  #   region = "us-east-1"
  # }

  # required_version = ">= 1.6.0"
  # required_providers {
  #   aws = {
  #     source  = "hashicorp/aws"
  #     version = ">= 5.0"
  #   }
  #   vercel = {
  #     source  = "vercel/vercel"
  #     version = ">= 1.0"
  #   }
  # }
}

# Example: choose ONE provider and configure via environment variables or TF Cloud
# provider "aws" {
#   region = var.aws_region
# }

# provider "vercel" {
#   # token is read from VERCEL_TOKEN env var; never commit tokens
# }

# Example static hosting on AWS (S3 + CloudFront) — placeholder only
# module "static_site" {
#   source = "terraform-aws-modules/cloudfront/aws"
#   # ...configure inputs here
# }

# No resources defined yet. This scaffold exists to enable IaC practices and review.
