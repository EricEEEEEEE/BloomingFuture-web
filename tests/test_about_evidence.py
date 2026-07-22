import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
ABOUT_CONTENT = (ROOT / "content/about.md").read_text(encoding="utf-8")


class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = {}

    def handle_starttag(self, tag, attrs):
        if tag != "img":
            return
        values = dict(attrs)
        if values.get("src"):
            self.images[values["src"]] = values


class AboutEvidenceTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        parser = ImageParser()
        parser.feed(INDEX)
        cls.images = parser.images

    def test_four_history_points_are_visible_and_synced(self):
        self.assertIn('class="history-timeline"', INDEX)
        self.assertEqual(4, INDEX.count('class="history-point"'))
        for value in ("1999 · 天津创立", "2015 · AI 探索", "2023 · 全球连接", "NOW · 智能学习"):
            self.assertIn(value, INDEX)
            self.assertIn(value, ABOUT_CONTENT)

    def test_three_real_education_images_have_stable_dimensions(self):
        expected = {
            "/assets/img/campus-1.jpg": ("404", "467", "教学活动"),
            "/assets/img/campus-2.jpg": ("480", "276", "课堂"),
            "/assets/img/campus-3.jpg": ("480", "276", "天津"),
        }
        for src, (width, height, alt_word) in expected.items():
            image = self.images.get(src)
            self.assertIsNotNone(image, src)
            self.assertEqual(width, image.get("width"))
            self.assertEqual(height, image.get("height"))
            self.assertEqual("lazy", image.get("loading"))
            self.assertIn(alt_word, image.get("alt", ""))

    def test_real_images_are_presented_as_an_evidence_grid(self):
        self.assertIn('class="education-evidence', INDEX)
        self.assertIn('class="evidence-grid', INDEX)
        self.assertIn('class="evidence-feature', INDEX)

    def test_low_resolution_certificates_are_complete_evidence_windows(self):
        expected = {
            "/assets/img/cert-mofcom.png": ("308", "251"),
            "/assets/img/cert-iso9001.png": ("308", "437"),
        }
        for src, (width, height) in expected.items():
            image = self.images.get(src)
            self.assertIsNotNone(image, src)
            self.assertEqual(width, image.get("width"))
            self.assertEqual(height, image.get("height"))
            self.assertEqual("lazy", image.get("loading"))
        self.assertIn("credential-evidence", INDEX)

    def test_missing_certificate_images_remain_text_only(self):
        self.assertIn("国家版权局作品登记", INDEX)
        self.assertIn("文旅部审批教材", INDEX)
        self.assertNotIn("cert-copyright", INDEX)
        self.assertNotIn("cert-mct", INDEX)

    def test_singapore_section_contains_no_image(self):
        singapore = INDEX.split("SECTION: singapore", 1)[1].split("END SECTION: singapore", 1)[0]
        self.assertNotIn("<img", singapore)

    def test_about_content_sync_date_is_current(self):
        self.assertIn("Last sync to index.html: 2026-07-22", ABOUT_CONTENT)
        self.assertIn("source: content/about.md  ·  last sync: 2026-07-22", INDEX)


if __name__ == "__main__":
    unittest.main()
