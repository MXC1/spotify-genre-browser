##################################################
# CDN Module (CloudFront)
##################################################

variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Deployment environment"
  type        = string
}

variable "website_bucket" {
  description = "S3 bucket details for website"
  type        = object({
    id   = string
    arn  = string
    name = string
  })
}

variable "domain_name" {
  description = "Domain name for the website"
  type        = string
  default     = ""
}

variable "use_existing_domain" {
  description = "Whether to use an existing domain configuration"
  type        = bool
  default     = false
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for ${var.project_name}-${var.environment}"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "website" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_100" # Use only North America and Europe edge locations
  comment             = "${var.project_name}-${var.environment} distribution"
  
  # Use custom domain if provided
  aliases = var.domain_name != "" && var.use_existing_domain ? [var.domain_name] : []

  # S3 origin configuration
  origin {
    domain_name = "${var.website_bucket.name}.s3.amazonaws.com"
    origin_id   = "S3-${var.website_bucket.name}"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  # Default cache behavior
  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.website_bucket.name}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Cache behavior for React router
  ordered_cache_behavior {
    path_pattern           = "/*"
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${var.website_bucket.name}"
    viewer_protocol_policy = "redirect-to-https"
    compress               = true

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  # Geo restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL Certificate configuration
  viewer_certificate {
    # Use custom certificate if domain provided
    acm_certificate_arn      = var.domain_name != "" && var.use_existing_domain ? data.aws_acm_certificate.cert[0].arn : null
    ssl_support_method       = var.domain_name != "" && var.use_existing_domain ? "sni-only" : null
    minimum_protocol_version = var.domain_name != "" && var.use_existing_domain ? "TLSv1.2_2021" : null
    
    # Use CloudFront certificate if no domain provided
    cloudfront_default_certificate = var.domain_name == "" || !var.use_existing_domain ? true : false
  }

  # SPA routing - all paths route to index.html
  custom_error_response {
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  custom_error_response {
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
    error_caching_min_ttl = 10
  }

  tags = {
    Name        = "${var.project_name}-cloudfront"
    Environment = var.environment
  }
}

# Look up existing ACM certificate if domain provided
data "aws_acm_certificate" "cert" {
  count    = var.domain_name != "" && var.use_existing_domain ? 1 : 0
  domain   = var.domain_name
  statuses = ["ISSUED"]
  provider = aws.us-east-1  # ACM certs for CloudFront must be in us-east-1
}

# Provider alias for us-east-1 region (for ACM)
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}

# Outputs
output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.website.id
  description = "ID of the CloudFront distribution"
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.website.domain_name
  description = "Domain name of the CloudFront distribution"
}