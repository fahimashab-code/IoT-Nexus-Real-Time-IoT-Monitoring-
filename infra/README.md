# Infrastructure (Terraform)

This folder contains Terraform for AWS infrastructure. Keep it separate from the Next.js app so infrastructure changes are isolated and easier to review.

## Folder Structure

```
infra/
  README.md               # This guide
  main.tf                 # Resources live here
  providers.tf            # Provider configuration
  variables.tf            # Input variables
  outputs.tf              # Outputs for app integration
  versions.tf             # Terraform + provider versions
  terraform.tfvars.example
```

## Prerequisites

- Terraform installed (`terraform -version`)
- AWS credentials configured locally (one of):
  - `aws configure`
  - environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

## Quick Start

1) Copy the example tfvars:
```
cp terraform.tfvars.example terraform.tfvars
```

2) Initialize:
```
terraform init
```

3) Review the plan:
```
terraform plan
```

4) Apply:
```
terraform apply
```

## Outputs

Terraform outputs (like Cognito IDs) should be copied into your app `.env.local` file.

Example:
```
NEXT_PUBLIC_COGNITO_USER_POOL_ID=...
NEXT_PUBLIC_COGNITO_CLIENT_ID=...
```

## Notes

- State files (`*.tfstate`) should not be committed. This repo ignores them by default.
- When you are ready, use a remote backend (S3 + DynamoDB) for state locking.
