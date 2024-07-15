data "archive_file" "zip" {
  type = "zip"
  # source_dir  = "${path.module}/../bin"
  source_dir  = "${path.module}/../build"
  output_path = "observability.zip"
}

################################################################################
# NETWORK
################################################################################

# data "aws_subnets" "private" {
#   filter {
#     name   = "tag:Name"
#     values = ["Workloads Private Subnet *"]
#   }
# }

# data "aws_vpc" "workloads" {
#   filter {
#     name   = "tag:Name"
#     values = ["Workloads VPC"]
#   }
# }
