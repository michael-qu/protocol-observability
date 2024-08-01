resource "aws_sns_topic" "anomaly_alert_topic" {
  name = "${local.function_name}-anomaly-alert"
}

resource "aws_sns_topic_policy" "anomaly_alert_policy" {
  arn    = aws_sns_topic.anomaly_alert_topic.arn
  policy = data.aws_iam_policy_document.anomaly_alert_policy.json
}

data "aws_iam_policy_document" "anomaly_alert_policy" {
  policy_id = "__default_policy_ID"

  statement {
    actions = [
      #   "SNS:Subscribe",
      #   "SNS:SetTopicAttributes",
      #   "SNS:RemovePermission",
      #   "SNS:Receive",
      "SNS:Publish",
      #   "SNS:ListSubscriptionsByTopic",
      #   "SNS:GetTopicAttributes",
      #   "SNS:DeleteTopic",
      #   "SNS:AddPermission",
    ]

    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    resources = [
      aws_sns_topic.anomaly_alert_topic.arn,
    ]

    sid = "__default_statement_ID"
  }
}

resource "aws_sns_topic_subscription" "user_updates_email_target" {
  topic_arn = aws_sns_topic.anomaly_alert_topic.arn
  # Delivers messages via SMTP to achieve A2P messaging, partially supported by Terraform
  # If the subscription is not confirmed,
  # either through automatic confirmation or means outside of Terraform
  # (e.g., clicking on a "Confirm Subscription" link in an email),
  # Terraform cannot delete / unsubscribe the subscription.
  # Attempting to destroy an unconfirmed subscription
  # will remove the aws_sns_topic_subscription from Terraform's state
  # but will not remove the subscription from AWS.
  protocol = "email"
  endpoint = "michael.lb.qu@hotmail.com"
}