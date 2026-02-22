from jinja2 import Template
from weasyprint import HTML
import hashlib
import tempfile
import os


def render_template_to_pdf(html_template: str, context: dict):
    """
    Renders Jinja template into PDF and returns:
    - temp_pdf_path
    - sha256_hash
    """

    # Render HTML
    template = Template(html_template)
    rendered_html = template.render(**context)

    # Create temp PDF file
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    temp_pdf_path = temp_file.name
    temp_file.close()

    # Convert HTML → PDF
    HTML(string=rendered_html).write_pdf(temp_pdf_path)

    # Compute SHA256 hash
    with open(temp_pdf_path, "rb") as f:
        file_bytes = f.read()

    pdf_hash = hashlib.sha256(file_bytes).hexdigest()

    return temp_pdf_path, pdf_hash