locals {
  table_name = "BlockchainDataFetcher"
}

resource "aws_dynamodb_table" "this" {
  name         = local.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "BlockType"

  attribute {
    name = "BlockType"
    type = "S"
  }

  tags = {
    Name        = local.table_name
    Environment = "test"
  }
}

data "aws_iam_policy_document" "dynamodb_read_write_policy_document" {
  statement {
    effect = "Allow"
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem"
    ]
    resources = [
      aws_dynamodb_table.this.arn,
      "${aws_dynamodb_table.this.arn}/*"
    ]
  }
}

resource "aws_iam_policy" "dynamodb_read_write_policy" {
  name        = "dynamodb_read_write_policy"
  description = "dynamodb_read_write_policy"
  policy      = data.aws_iam_policy_document.dynamodb_read_write_policy_document.json
}

# Grant lambda function with read/write access to above DynamoDB table
resource "aws_iam_role_policy_attachment" "lambda_dynamodb_read_write_access" {
  role       = aws_iam_role.this.name
  policy_arn = aws_iam_policy.dynamodb_read_write_policy.arn
}
