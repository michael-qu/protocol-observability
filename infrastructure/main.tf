locals {
  function_name      = "Blockchain-Data-Fetcher"
  lambda_timeout_sec = 30
}

provider "aws" {
  region = "us-east-1"
}

resource "aws_iam_role" "lambda_role" {
  name = "terraform_aws_lambda_role"
  # Terraform's "jsonencode" function converts a
  # Terraform expression result to valid JSON syntax.
  assume_role_policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : "sts:AssumeRole",
          "Principal" : {
            "Service" : "lambda.amazonaws.com"
          },
          "Effect" : "Allow",
          "Sid" : ""
        }
      ]
  })
}

# IAM policy for logging from a lambda

resource "aws_iam_policy" "iam_policy_for_lambda" {

  name        = "aws_iam_policy_for_terraform_aws_lambda_role"
  path        = "/"
  description = "AWS IAM Policy for managing aws lambda role"
  policy = jsonencode(
    {
      "Version" : "2012-10-17",
      "Statement" : [
        {
          "Action" : [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:PutLogEvents"
          ],
          "Resource" : "arn:aws:logs:*:*:*",
          "Effect" : "Allow"
        }
      ]
  })
}

# Policy Attachment on the role.

resource "aws_iam_role_policy_attachment" "attach_iam_policy_to_iam_role" {
  role       = aws_iam_role.lambda_role.name
  policy_arn = aws_iam_policy.iam_policy_for_lambda.arn
}

# Generates an archive from content, a file, or a directory of files.

# data "archive_file" "zip_the_ts_code" {
#   type        = "zip"
#   source_file = "${path.module}/../build/index.js"
#   output_path = "${path.module}/src/index.zip"
# }

data "archive_file" "zip" {
  type        = "zip"
  source_dir  = "${path.module}/../build"
  output_path = "observability.zip"
}

# Create a lambda function
# In terraform ${path.module} is the current directory.

resource "aws_lambda_function" "terraform_lambda_func_ts" {
  filename      = data.archive_file.zip.output_path
  function_name = local.function_name
  role          = aws_iam_role.lambda_role.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  architectures = ["arm64"]
  timeout       = local.lambda_timeout_sec
  memory_size   = 200
  depends_on    = [aws_iam_role_policy_attachment.attach_iam_policy_to_iam_role]
}


output "teraform_aws_role_output" {
  value = aws_iam_role.lambda_role.name
}

output "teraform_aws_role_arn_output" {
  value = aws_iam_role.lambda_role.arn
}

output "teraform_logging_arn_output" {
  value = aws_iam_policy.iam_policy_for_lambda.arn
}