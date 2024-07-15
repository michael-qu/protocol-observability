output "teraform_aws_role_output" {
  value = aws_iam_role.this.name
}

output "teraform_aws_role_arn_output" {
  value = aws_iam_role.this.arn
}