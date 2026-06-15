resource "aws_db_subnet_group" "amx_erp" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = module.vpc.private_subnets

  tags = {
    Name = "${local.name}-db-subnet-group"
  }
}

resource "aws_security_group" "rds_sg" {
  name        = "${local.name}-rds-sg"
  description = "Security group for RDS Aurora Serverless"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.node_group_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

module "aurora" {
  source  = "terraform-aws-modules/rds-aurora/aws"
  version = "~> 9.0"

  name           = "${local.name}-aurora"
  engine         = "aurora-postgresql"
  engine_version = "16.1"
  engine_mode    = "provisioned"

  serverlessv2_scaling_configuration = {
    min_capacity = 0.5
    max_capacity = 16
  }

  instance_class = "db.serverless"
  instances = {
    1 = {}
    2 = {}
  }

  vpc_id                 = module.vpc.vpc_id
  db_subnet_group_name   = aws_db_subnet_group.amx_erp.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  create_db_cluster_parameter_group      = true
  db_cluster_parameter_group_name        = "${local.name}-aurora-postgres16"
  db_cluster_parameter_group_family      = "aurora-postgresql16"

  master_username = "amx_admin"
  database_name   = "amx_erp"

  storage_encrypted   = true
  apply_immediately   = true
  skip_final_snapshot = true

  tags = {
    Environment = var.environment
  }
}
