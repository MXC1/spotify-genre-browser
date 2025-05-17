##################################################
# CI/CD Module (CodePipeline & CodeBuild)
##################################################

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "repository_name" {
  description = "Name of the source code repository"
  type        = string
}

variable "repository_branch" {
  description = "Repository branch to deploy from"
  type        = string
  default     = "main"
}

variable "website_bucket" {
  description = "S3 bucket details for website"
  type = object({
    id   = string
    arn  = string
    name = string
  })
}

variable "cloudfront_dist_id" {
  description = "CloudFront distribution ID"
  type        = string
}

variable "feedback_endpoint" {
  description = "Feedback endpoint for React app"
  type        = string
}

variable "pkce_endpoint" {
  description = "PKCE endpoint for React app"
  type        = string
}

variable "log_endpoint" {
  description = "Log endpoint for React app"
  type        = string
}

variable "spotify_client_id" {
  description = "Spotify Client ID for React app"
  type        = string
  sensitive   = true
}

# IAM role for CodeBuild
resource "aws_iam_role" "codebuild_role" {
  name = "${var.project_name}-${var.environment}-codebuild-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codebuild.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM policy for CodeBuild
resource "aws_iam_role_policy" "codebuild_policy" {
  name = "${var.project_name}-${var.environment}-codebuild-policy"
  role = aws_iam_role.codebuild_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:GetLogGroupFields",
          "logs:GetLogRecord",
          "logs:GetQueryResults",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:GetObjectVersion",
          "s3:ListBucket"
        ]
        Resource = [
          "${var.website_bucket.arn}",
          "${var.website_bucket.arn}/*",
          "${aws_s3_bucket.pipeline_artifacts.arn}",
          "${aws_s3_bucket.pipeline_artifacts.arn}/*"
        ]
      },
      {
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation"
        ]
        Resource = "*"
      }
    ]
  })
}

# CodeBuild project for React build
resource "aws_codebuild_project" "react_build" {
  name         = "${var.project_name}-${var.environment}-build"
  description  = "Build and deploy React application"
  service_role = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:7.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false

    environment_variable {
      name  = "ENVIRONMENT"
      value = var.environment
    }

    environment_variable {
      name  = "S3_BUCKET"
      value = var.website_bucket.name
    }

    environment_variable {
      name  = "CLOUDFRONT_DISTRIBUTION_ID"
      value = var.cloudfront_dist_id
    }

    # React environment variables
    environment_variable {
      name  = "REACT_APP_SPOTIFY_CLIENT_ID"
      value = var.spotify_client_id
    }

    environment_variable {
      name  = "REACT_APP_ENV"
      value = var.environment
    }

    environment_variable {
      name  = "REACT_APP_FEEDBACK_ENDPOINT"
      value = var.feedback_endpoint
    }

    environment_variable {
      name  = "REACT_APP_PKCE_ENDPOINT"
      value = var.pkce_endpoint
    }

    environment_variable {
      name  = "REACT_APP_LOG_ENDPOINT"
      value = var.log_endpoint
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = <<BUILDSPEC
version: 0.2

phases:
  install:
    runtime-versions:
      nodejs: 18
    commands:
      - echo Installing dependencies...
      - npm install

  build:
    commands:
      - echo Building React application...
      - npm run build

  post_build:
    commands:
      - echo Deploying to S3...
      - aws s3 sync build/ s3://$S3_BUCKET/ --delete
      - echo Creating CloudFront invalidation...
      - aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

artifacts:
  files:
    - build/**/*
  base-directory: '.'
BUILDSPEC
  }

  logs_config {
    cloudwatch_logs {
      status      = "ENABLED"
      group_name  = "/aws/codebuild/${var.project_name}-${var.environment}"
      stream_name = "build-logs"
    }

    s3_logs {
      status = "DISABLED"
    }
  }

  tags = {
    Name        = "${var.project_name}-codebuild"
    Environment = var.environment
  }
}

# IAM role for CodePipeline
resource "aws_iam_role" "codepipeline_role" {
  name = "${var.project_name}-${var.environment}-pipeline-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "codepipeline.amazonaws.com"
        }
        Action = "sts:AssumeRole"
      }
    ]
  })
}

# IAM policy for CodePipeline
resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "${var.project_name}-${var.environment}-pipeline-policy"
  role = aws_iam_role.codepipeline_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents",
          "logs:GetLogEvents",
          "logs:DescribeLogGroups",
          "logs:DescribeLogStreams"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:GetObjectVersion",
          "s3:GetBucketVersioning"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "codebuild:BatchGetBuilds",
          "codebuild:StartBuild"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow",
        Action = [
          "codestar-connections:UseConnection"
        ],
        Resource = aws_codestarconnections_connection.github[0].arn
      },
      {
        Effect = "Allow"
        Action = [
          "codecommit:GetBranch",
          "codecommit:GetCommit",
          "codecommit:UploadArchive",
          "codecommit:GetUploadArchiveStatus",
          "codecommit:CancelUploadArchive"
        ]
        Resource = "*"
      }
    ]
  })
}

# CloudWatch Log Group for Pipeline
resource "aws_cloudwatch_log_group" "pipeline_logs" {
  name              = "/aws/codepipeline/${var.project_name}-${var.environment}"
  retention_in_days = 30

  tags = {
    Name        = "${var.project_name}-pipeline-logs"
    Environment = var.environment
  }
}

# Determine if using CodeCommit or GitHub connection
locals {
  is_github_repo  = can(regex("^https://github.com", var.repository_name)) || can(regex("^github.com", var.repository_name))
  source_provider = local.is_github_repo ? "CodeStarSourceConnection" : "CodeCommit"
}

# Create a CodeCommit repository if not using GitHub
resource "aws_codecommit_repository" "app_repo" {
  count           = local.is_github_repo ? 0 : 1
  repository_name = var.repository_name
  description     = "Repository for ${var.project_name} React application"
}

# GitHub connection (placeholder - you'll need to create this connection manually in the AWS console)
resource "aws_codestarconnections_connection" "github" {
  count         = local.is_github_repo ? 1 : 0
  name          = "${var.project_name}-github-connection"
  provider_type = "GitHub"
}

# CodePipeline definition
resource "aws_codepipeline" "react_pipeline" {
  name     = "${var.project_name}-${var.environment}-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.pipeline_artifacts.bucket
    type     = "S3"
  }

  # Source stage
  stage {
    name = "Source"

    action {
      name             = "Source"
      category         = "Source"
      owner            = "AWS"
      provider         = local.source_provider
      version          = "1"
      output_artifacts = ["source_output"]

      configuration = local.is_github_repo ? {
        ConnectionArn = aws_codestarconnections_connection.github[0].arn
        # Extract just the owner/repo portion if a full URL is provided
        FullRepositoryId     = replace(replace(var.repository_name, "https://github.com/", ""), "github.com/", "")
        BranchName           = var.repository_branch
        OutputArtifactFormat = "CODE_ZIP" # Add this line for GitHub connections
        } : {
        RepositoryName = var.repository_name
        BranchName     = var.repository_branch
      }


    }
  }

  # Build stage
  stage {
    name = "Build"

    action {
      name             = "BuildAndDeploy"
      category         = "Build"
      owner            = "AWS"
      provider         = "CodeBuild"
      version          = "1"
      input_artifacts  = ["source_output"]
      output_artifacts = ["build_output"]

      configuration = {
        ProjectName = aws_codebuild_project.react_build.name
      }
    }
  }

  tags = {
    Name        = "${var.project_name}-pipeline"
    Environment = var.environment
  }
}

# S3 bucket for pipeline artifacts
resource "aws_s3_bucket" "pipeline_artifacts" {
  bucket = "${var.project_name}-${var.environment}-pipeline-artifacts"

  tags = {
    Name        = "${var.project_name}-pipeline-artifacts"
    Environment = var.environment
  }
}

# Secure the pipeline artifacts bucket
resource "aws_s3_bucket_public_access_block" "pipeline_artifacts" {
  bucket                  = aws_s3_bucket.pipeline_artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# Outputs
output "codepipeline_name" {
  value       = aws_codepipeline.react_pipeline.name
  description = "Name of the created CodePipeline"
}

output "source_repository" {
  value       = local.is_github_repo ? var.repository_name : (length(aws_codecommit_repository.app_repo) > 0 ? aws_codecommit_repository.app_repo[0].clone_url_http : "")
  description = "Source code repository URL"
}

output "deployment_role_arn" {
  value       = aws_iam_role.codebuild_role.arn
  description = "ARN of the deployment IAM role"
}

output "github_repo_config" {
  value = local.is_github_repo ? {
    is_github      = true
    repo_name      = var.repository_name
    connection_arn = length(aws_codestarconnections_connection.github) > 0 ? aws_codestarconnections_connection.github[0].arn : "none"
    } : {
    is_github = false
    repo_name = var.repository_name
  }
}
