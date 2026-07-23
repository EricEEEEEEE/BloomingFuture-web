import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
REPORT = (ROOT / "docs/v2.1-motion-report.md").read_text(encoding="utf-8")


class ProductionCacheTests(unittest.TestCase):
    def test_main_script_cache_key_is_rotated_and_documented(self):
        cache_key = "/assets/js/main.js?v=2.0.0-r1"
        self.assertIn(cache_key, INDEX)
        self.assertIn("main.js?v=2.0.0-r1", REPORT)
        self.assertIn("SHA-256", REPORT)


if __name__ == "__main__":
    unittest.main()
