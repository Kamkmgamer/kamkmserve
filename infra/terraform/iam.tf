# IAM least-privilege examples — commented for safety by default.

# Example: an IAM policy with narrowly scoped permissions
# data "aws_iam_policy_document" "app_read_secrets" {
#   statement {
#     sid    = "ReadSpecificSecrets"
#     effect = "Allow"
#     actions = [
#       "secretsmanager:GetSecretValue",
#       "secretsmanager:DescribeSecret"
#     ]
#     resources = [
#       "arn:aws:secretsmanager:${var.aws_region}:ACCOUNT_ID:secret:kamkmserve/*"
#     ]
#   }
# }
#
# resource "aws_iam_policy" "app_read_secrets" {
#   name   = "${var.project_name}-read-secrets"
#   policy = data.aws_iam_policy_document.app_read_secrets.json
# }
#
# resource "aws_iam_role" "app_runtime" {
#   name               = "${var.project_name}-runtime"
#   assume_role_policy = jsonencode({
#     Version = "2012-10-17"
#     Statement = [{
#       Effect = "Allow"
#       Principal = { Service = "ec2.amazonaws.com" }
#       Action   = "sts:AssumeRole"
#     }]
#   })
# }
#
# resource "aws_iam_role_policy_attachment" "app_attach_read_secrets" {
#   role       = aws_iam_role.app_runtime.name
#   policy_arn = aws_iam_policy.app_read_secrets.arn
# }
