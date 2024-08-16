locals {
  function_name      = "protocol-observability"
  lambda_timeout_sec = 60
}

###############################################################################
# FUNCTION
###############################################################################

resource "aws_lambda_function" "this" {
  function_name = local.function_name
  description   = "${local.function_name} is a protocol monitoring function"

  role          = aws_iam_role.this.arn
  handler       = "index.handler"
  runtime       = "nodejs18.x"
  architectures = ["arm64"]
  timeout       = local.lambda_timeout_sec
  memory_size   = 200

  # publish = true

  filename         = data.archive_file.zip.output_path
  source_code_hash = data.archive_file.zip.output_base64sha256

  tracing_config {
    mode = "Active"
  }

  # vpc_config {
  #   security_group_ids = [aws_security_group.this.id]
  #   subnet_ids         = data.aws_subnets.private.ids
  # }

  depends_on = [
    aws_cloudwatch_log_group.this,
    aws_iam_role_policy_attachment.lambda_vpc_executioner,
    aws_iam_role.this,
  ]
}

resource "aws_lambda_function_event_invoke_config" "this" {
  function_name          = aws_lambda_function.this.function_name
  maximum_retry_attempts = 0
}

###############################################################################
# SECURITY GROUP
###############################################################################

# resource "aws_security_group" "this" {
#   name        = "${local.function_name}-lambda"
#   description = "Security group for Lambda Function ${local.function_name}"
#   vpc_id      = data.aws_vpc.workloads.id

#   lifecycle {
#     create_before_destroy = true
#   }
# }

# resource "aws_vpc_security_group_egress_rule" "https_egress" {
#   description       = "Allow HTTPS egress"
#   security_group_id = aws_security_group.this.id

#   cidr_ipv4   = "0.0.0.0/0"
#   from_port   = 443
#   ip_protocol = "tcp"
#   to_port     = 443
# }