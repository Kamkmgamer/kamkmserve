# Terraform IaC Scaffold

This directory contains a minimal Terraform scaffold to manage infrastructure as code (IaC).

- Provider blocks are stubbed and commented to avoid accidental provisioning.
- Start by choosing a target provider (e.g., Vercel, AWS) and uncommenting the relevant sections.
- All resources are optional and safe by default.

## Getting Started

1. Install Terraform: https://developer.hashicorp.com/terraform/install
2. Copy `terraform.tfvars.example` to `terraform.tfvars` and fill values.
3. Initialize the working directory:

```bash
terraform init
```

4. Plan changes:

```bash
terraform plan -out tf.plan
```

5. Apply (when ready):

```bash
terraform apply tf.plan
```

## Files

- `main.tf` — Core configuration and providers (commented).
- `variables.tf` — Input variables.
- `outputs.tf` — Outputs (none yet).
- `terraform.tfvars.example` — Example variable values.

## Notes

- Keep credentials out of source control. Use environment variables or a secrets manager.
- For Vercel deployments, consider the official Vercel Terraform provider.
- For AWS-based hosting, consider AWS providers (Route53, ACM, CloudFront, S3, Lambda, etc.).
