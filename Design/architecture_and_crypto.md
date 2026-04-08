# Project Architecture and Operations

This document explains how the contract management platform functions, detailing both the overarching system architecture and the specifics of its cryptographic digital signature implementation.

## 1. High-Level Architecture
The platform is an end-to-end contract lifecycle management system designed to generate, dispatch, and securely sign legal documents.

- **Frontend Core**: A responsive React application providing interfaces for dashboard management, contract creation from dynamic templates, manual PDF uploads, and signing flows.
- **Backend Services**: A FastAPI backend that handles business logic, including PDF generation from HTML templates (via Jinja2), contract linking, expiration checking, routing, and cryptographic signing.
- **Database / Storage**: Supabase serves as the core real-time PostgreSQL database mapping users, contracts, templates, and cryptographic keys. It also acts as the object store (S3 equivalent) where signed and finalized PDF documents are securely housed.
- **Caching**: Redis (Upstash) is utilized to rapidly serve heavily accessed endpoints, such as users' assigned and managed contract lists.

## 2. Document Flow
1. **Creation**: Users initiate a contract by either selecting a predefined HTML template (where dynamic variables like `landlord_name`, `rent_amount` are populated via the UI to generate a PDF) or manually uploading their own PDF. 
2. **Setup**: The backend computes a SHA-256 hash of the generated or uploaded PDF. This forms the verifiable fingerprint of the document. The contract record, along with invited prospective signees, is stored in the database.
3. **Execution**: Assigned signees log into the platform. A secure link is provided to each to accept or reject the contract.

## 3. Digital Signatures and Cryptography
The platform implements legitimate cryptographic digital signatures to ensure non-repudiation and document integrity, as opposed to simple digitized signatures (like drawing a name on a screen).

### A. Key Provisioning
During onboarding or initial transaction setup, the system generates an asymmetric **RSA key pair** (2048-bit) for the user:
- The **Public Key** is stored openly in the database and tied to the user's identity.
- The **Private Key** is immediately encrypted symmetrically. A global `MASTER_KEY` runs through a Key Derivation Function to yield a `Fernet` encryption key. This Fernet key encrypts the user's RSA private key before storing it in the database. 

### B. The Signing Process
When an authorized user agrees to sign a pending contract:
1. The backend retrieves the original `pdf_hash` (the SHA-256 checksum) of the specific contract.
2. The system retrieves the user's encrypted private key and dynamically decrypts it in-memory using the server's securely sequestered `MASTER_KEY`.
3. The RSA private key signs the `pdf_hash` utilizing the rigorous **RSA-PSS** (Probabilistic Signature Scheme) padding configuration and a SHA-256 digest algorithm.
4. The resulting signature is successfully calculated, encoded in hexadecimal format, and persisted in the `signatures` table explicitly paired with the `signed_hash`, the associated algorithm (`RSA-PSS-SHA256`), and the `signer_id`.

### C. Verification and Integrity Check
Verification provides cryptographic cryptographic assurance of the document's authenticity:
1. **Document Integrity Check**: The system downloads the PDF bytes stored in Supabase and recalculates the SHA-256 hash. If it matches the `pdf_hash` in the database, the document has not been altered since generation.
2. **Signature Validity Check**: The system loops through all records in the `signatures` table. For each, the system queries the associated user's `public_key`. Using the RSA public key, the system validates the corresponding signature against the `signed_hash`. 
3. **Audit Results**: If the payload hasn't drifted and the signatures algebraically align with the respective public keys under RSA-PSS, the contract is deemed legally and cryptographically authentic.
