import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
AI_CONTENT = (ROOT / "content/ai.md").read_text(encoding="utf-8")
SCRIPT = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")
CSS = (ROOT / "assets/css/main.css").read_text(encoding="utf-8")

LOOP_STEPS = (
    "真实教材 · Curriculum source",
    "识别知识点 · Map concepts",
    "启发式提问 · Ask to reason",
    "学生表达 · Listen for meaning",
    "教师反馈 · Return insight",
)

TEXTBOOK_DIMENSIONS = {
    "/assets/img/textbook-1.jpg": ("643", "510"),
    "/assets/img/textbook-2.jpg": ("631", "510"),
    "/assets/img/textbook-3.jpg": ("584", "510"),
    "/assets/img/textbook-4.jpg": ("608", "510"),
    "/assets/img/textbook-5.jpg": ("590", "366"),
}


class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = {}

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            values = dict(attrs)
            if values.get("src"):
                self.images[values["src"]] = values


class AiLearningSystemTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        parser = ImageParser()
        parser.feed(INDEX)
        cls.images = parser.images

    def test_learning_loop_has_five_visible_method_steps(self):
        self.assertIn('class="learning-loop', INDEX)
        self.assertEqual(5, INDEX.count('class="loop-step"'))
        for value in LOOP_STEPS:
            self.assertIn(value, INDEX)
            self.assertIn(value, AI_CONTENT)

    def test_learning_loop_is_not_a_fake_chat_product(self):
        loop = INDEX.split('class="learning-loop', 1)[1].split("</section>", 1)[0]
        self.assertIn("教学方法图", loop)
        self.assertNotIn("<input", loop)
        self.assertNotIn("<textarea", loop)
        self.assertNotIn("Send message", loop)

    def test_learning_loop_animation_has_lifecycle_controls(self):
        for value in ("startLearningLoop", "stopLearningLoop", "learningLoopObserver", "document.hidden"):
            self.assertIn(value, SCRIPT)
        self.assertRegex(SCRIPT, r"reduceMotion[^\n]*(?:return|else)")

    def test_five_real_textbook_sets_have_dimensions_and_alt_text(self):
        for src, (width, height) in TEXTBOOK_DIMENSIONS.items():
            image = self.images.get(src)
            self.assertIsNotNone(image, src)
            self.assertEqual(width, image.get("width"))
            self.assertEqual(height, image.get("height"))
            self.assertEqual("lazy", image.get("loading"))
            self.assertIn("教材", image.get("alt", ""))

    def test_textbook_gallery_is_manual_scroll_snap_only(self):
        self.assertIn('class="textbook-rail"', INDEX)
        self.assertIn("scroll-snap-type", CSS)
        self.assertNotIn("textbookAutoplay", SCRIPT)

    def test_products_and_rituals_keep_complete_counts(self):
        self.assertEqual(4, INDEX.count('class="product-card"'))
        self.assertEqual(9, INDEX.count('class="ritual-card"'))
        self.assertEqual(3, len(re.findall(r"ritual-accent.*--bf-red", INDEX)))
        self.assertEqual(3, len(re.findall(r"ritual-accent.*--bf-orange", INDEX)))
        self.assertEqual(3, len(re.findall(r"ritual-accent.*--bf-green", INDEX)))

    def test_ai_content_sync_date_is_current(self):
        self.assertIn("Last sync to index.html: 2026-07-22", AI_CONTENT)
        self.assertIn("source: content/ai.md  ·  last sync: 2026-07-22", INDEX)


if __name__ == "__main__":
    unittest.main()
