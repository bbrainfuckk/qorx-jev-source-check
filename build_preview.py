"""Build the browser's four request downloads with the same code as the CLI."""

import json
from pathlib import Path

from jev_check import EVIDENCE, requests_for


if __name__ == "__main__":
    evidence = json.loads(EVIDENCE.read_text(encoding="utf-8-sig"))
    preview = {item["id"]: dict(requests_for(evidence, item["id"])) for item in evidence["questions"]}
    Path(__file__).with_name("requests.json").write_text(
        json.dumps(preview, indent=2, ensure_ascii=False) + "\n", encoding="utf-8"
    )
