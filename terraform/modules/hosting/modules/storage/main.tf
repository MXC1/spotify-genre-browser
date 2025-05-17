##################################################
# S3 Storage Module
##################################################

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

# S3 bucket for website hosting
resource "aws_s3_bucket" "website" {
  bucket = "${var.project_name}-${var.environment}-website"

  tags = {
    Name        = "${var.project_name}-website"
    Environment = var.environment
  }
}

# Bucket ownership controls
resource "aws_s3_bucket_ownership_controls" "website" {
  bucket = aws_s3_bucket.website.id

  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

# Public access block configuration
resource "aws_s3_bucket_public_access_block" "website" {
  bucket                  = aws_s3_bucket.website.id
  block_public_acls       = true
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

# Bucket policy to allow CloudFront access
resource "aws_s3_bucket_policy" "website" {
  bucket = aws_s3_bucket.website.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.website.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.website]
}

# Enable website hosting on the bucket
resource "aws_s3_bucket_website_configuration" "website" {
  bucket = aws_s3_bucket.website.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA routing - all errors route to index
  }
}

# S3 bucket for pipeline artifacts
resource "aws_s3_bucket" "artifacts" {
  bucket = "${var.project_name}-${var.environment}-artifacts"

  tags = {
    Name        = "${var.project_name}-artifacts"
    Environment = var.environment
  }
}

# Secure the artifacts bucket
resource "aws_s3_bucket_public_access_block" "artifacts" {
  bucket                  = aws_s3_bucket.artifacts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

output "website_bucket" {
  value = {
    id   = aws_s3_bucket.website.id
    arn  = aws_s3_bucket.website.arn
    name = aws_s3_bucket.website.bucket
  }
  description = "Website S3 bucket details"
}

output "artifacts_bucket" {
  value = {
    id   = aws_s3_bucket.artifacts.id
    arn  = aws_s3_bucket.artifacts.arn
    name = aws_s3_bucket.artifacts.bucket
  }
  description = "Artifacts S3 bucket details"
}

output "website_endpoint" {
  value       = aws_s3_bucket_website_configuration.website.website_endpoint
  description = "S3 static website hosting endpoint"
}