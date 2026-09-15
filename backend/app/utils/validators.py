"""Input validation + sanitization."""
import re

ALLOWED_EXTENSIONS = {"pdf", "docx", "txt"}
CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")


def sanitize_text(text: str, max_chars: int = 120000) -> str:
    """Strip control chars, collapse whitespace, enforce length."""
    if not text:
        return ""
    text = CONTROL_CHARS.sub(" ", text)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()[:max_chars]


def validate_extension(filename: str) -> str:
    ext = (filename.rsplit(".", 1)[-1] if "." in filename else "").lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Unsupported file type '.{ext}'. Supported: PDF, DOCX, TXT.")
    return ext


def validate_size(size_bytes: int, max_mb: int) -> None:
    if size_bytes > max_mb * 1024 * 1024:
        raise ValueError(f"File too large. Maximum size is {max_mb} MB.")


def word_count(text: str) -> int:
    return len(re.findall(r"\S+", text))


def reading_minutes(text: str, wpm: int = 200) -> float:
    return round(max(word_count(text) / wpm, 0.1), 1)
