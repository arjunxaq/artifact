from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.fernet import Fernet
import base64
import os
from dotenv import load_dotenv

load_dotenv()

MASTER_KEY = os.getenv("MASTER_KEY")

# Derive Fernet key from MASTER_KEY
fernet_key = base64.urlsafe_b64encode(
    MASTER_KEY.encode().ljust(32)[:32]
)
fernet = Fernet(fernet_key)


def generate_rsa_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )

    public_key = private_key.public_key()

    # Serialize private key
    private_bytes = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )

    # Serialize public key
    public_bytes = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    # Encrypt private key
    encrypted_private_key = fernet.encrypt(private_bytes)

    return (
        public_bytes.decode(),
        encrypted_private_key.decode()
    )


def decrypt_private_key(encrypted_private_key: str):
    decrypted_bytes = fernet.decrypt(
        encrypted_private_key.encode()
    )

    private_key = serialization.load_pem_private_key(
        decrypted_bytes,
        password=None
    )

    return private_key