variable "aws_region" {
  description = "AWS region for all resources."
  type        = string
}

variable "aws_account_id" {
  description = "Allowed AWS account ID for safety."
  type        = string
}

variable "cognito_user_pool_name" {
  description = "Cognito User Pool name."
  type        = string
  default     = "iot-dashboard-users"
}

variable "cognito_app_client_name" {
  description = "Cognito User Pool app client name."
  type        = string
  default     = "iot-dashboard-web"
}
