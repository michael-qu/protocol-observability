# Protocol Observability Framework

## Background and Motivation
Ironclad Finance (https://www.ironclad.finance/) is a decentralized, user-driven borrowing and lending liquidity market inspired by Aave. Users can participate as depositors or borrowers. Depositors provide liquidity to the market to earn a passive income, while borrowers are able to borrow in an overcollateralized (perpetually) or undercollateralized (one-block liquidity) fashion.

There are a large number of metrics to be monitored due to complexity of its asset profile and many smart contracts involved. To monitor such a complicated protocol, we have our current observability tool which has its own custom UI.

However, the current observability tool has the following problems:
- Scalability: it is difficult to handle increased data volume and complexity, or accommodate additional asset types
- Flexibility: it is difficult to adjust according to needs in different use cases
- Maintenance: it is costy to maintain this custom UI for complicated visualizations

## About The Project
This project provides a solution to solve the above observability problems leveraging two technologies:

1. AWS-Managed Services

AWS Lambda and DynamoDB
- Highly scalable and serverless services
- Pay-as-you-go model with no upfront costs

CloudWatch
- Powerful log & metric management system with minimum operational burden
- Standardized dashboard with rich visualization choices
- Automatedtime-based event-triggering mechanisms
- Smart alert system with machine learning algorithms to determine thresholds dynamically

SNS (Simple-Notification-Service)
- Easy integration with multiple message delivery protocols

IAM (Identity and Access Management)
- Fully-managed,role/policy-based access control with minimum administrative tasks

2. Infrastructure-as-Code (IaC)

Terraform by Hashicorp
- Automate the deployment process, provision/maintain complicated infrastructure resources programmatically
- Cloud-agnostic

## Project Architecture



## How to use it

## How to configure it

## References