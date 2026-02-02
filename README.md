# Artifact – A Simple Contract Management Platform

### Overview

Artifact is a web-based contract management platform designed to simplify the creation, management, storage, and tracking of contracts for individuals, freelancers, startups, and small organizations. Unlike traditional enterprise-heavy contract management systems, Artifact focuses on accessibility, usability, and affordability for everyday users who frequently engage in legal agreements but lack structured tools to manage them.

The platform enables users to generate contracts using templates, customize clauses through variables, securely store agreements, track contract lifecycles, and manage renewals and deadlines. It aims to bridge the gap between informal agreements and complex enterprise contract systems by offering a streamlined, user-friendly solution.

## Problem It Solves
### Current Problems

Unorganized Contract Storage: 
Many individuals and small teams store contracts across emails, local folders, or cloud drives, making retrieval and tracking difficult.

Missed Deadlines and Renewals: 
Important dates such as renewals, expirations, or notice periods are often forgotten due to the absence of reminders.

Enterprise Tools Are Overkill:
Existing contract management systems are expensive, complex, and designed primarily for large organizations.

Manual Contract Creation
Repetitive drafting of similar contracts wastes time and introduces inconsistency.

## Why This Matters

Poor contract management can result in financial loss, legal disputes, and missed opportunities. ContractEase addresses these problems by providing structure, automation, and clarity without requiring legal or technical expertise.

## Target Users: 
1. Freelancer / Independent Professional

Needs: Simple contracts for clients, NDAs, payment terms, renewal tracking

Pain Points: Uses Word/Google Docs, forgets contract deadlines

Goal: Professional and legally sound agreements with minimal effort

2. Startup Founder / Small Business Owner

Needs: Vendor contracts, employee agreements, service contracts

Pain Points: No centralized contract system, limited legal budget

Goal: Organized contract lifecycle management without enterprise costs

3. Students & Academic Users

Needs: Project agreements, internship contracts, collaboration MOUs

Pain Points: Lack of awareness of contract importance

Goal: Learn and manage contracts easily in early professional life

4. HR Teams for medium sized companies

Needs: Employee agreements, Internship agreements

Goal: Simple, understandable contract tools

## Vision Statement

“To make contract management simple, accessible, and reliable for everyone — transforming contracts from complex legal documents into easy-to-manage digital assets.”

This vision emphasizes simplicity, inclusivity, and trust, focusing on empowering users rather than overwhelming them with legal complexity.

## Key Features / Goals
Core Features:

Contract Templates

Predefined templates (NDA, service agreement, employment, rental, etc.)

Customizable with insertable variables (name, date, amount, duration)

Contract Creation & Editing

Clause-level customization

Secure Storage

Centralized contract repository

Version control and document history

Lifecycle Tracking: 
Contract status: Draft, Active, Expired, Terminated,
Important dates (start, end, renewal)

Reminders & Notifications:
Alerts for renewals, expirations, and deadlines

Search & Filtering: 
Search by party name, contract type, date, or status


## Project Goals

Reduce contract creation time

Improve contract organization and visibility

Minimize missed deadlines

Provide a learning-friendly contract system for non-experts

## Success Metrics
### Quantitative Metrics

Number of registered users

Number of contracts created per user

Percentage of contracts with reminders enabled

Reduction in missed contract deadlines

User retention rate

### Qualitative Metrics

User satisfaction and feedback

Ease-of-use ratings

Perceived reduction in contract-related stress

Adoption by non-legal users

Academic / Project Metrics

Feature completeness within timeline

Code quality and architecture clarity

Documentation and usability evaluation

Jury or faculty assessment scores

## Assumptions

Users have basic digital literacy

Internet access is available

Users prefer simplicity over legal depth

Contracts are primarily text-based documents

Legal compliance varies by region and is not automated initially

## Constraints

Time Constraint: 3-month development timeline

Team Constraint: Student developer

Budget Constraint: Limited or zero budget

Legal Constraint: Platform does not replace professional legal advice

Technical Constraint: Initial version may not support advanced AI or multi-language contracts


## Quick Start – Local Development

This project is designed to run fully on your local machine using Docker. The frontend can also be run independently for UI development.

### Prerequisites

Ensure the following tools are installed on your system:

Git (v2.30+ recommended)

Docker Desktop (with Docker Compose enabled)

Node.js (v18+ recommended, only required for non-Docker frontend development)

Verify installations:

git --version
docker --version
docker compose version
node --version

1. Clone the Repository
git clone https://github.com/arjunxaq/artifact.git
cd artifact

2. Project Structure Overview:
   
artifact/

├── backend/        # FastAPI backend (API services)

├── frontend/       # React + Tailwind frontend (dashboard UI)

├── docker-compose.yml

└── README.md

### Build and Start Containers

From the project root:

docker compose build
docker compose up

### Access the Application

Frontend (Dashboard UI):
http://localhost:3000

Backend API (if enabled):
http://localhost:8000

### To stop containers:

docker compose down

### Branching Strategy:
1. main:
Represents stable and deployable code, Always contains working, tested features

2️. Develop: 
Active development branch
All features are merged here first

Used for:
Integration testing
Combining completed features

3️. feature/*: 
Used to develop individual features
Created from develop
Merged back into develop when complete

Examples:
feature/authentication
feature/contract-upload
feature/contract-list

