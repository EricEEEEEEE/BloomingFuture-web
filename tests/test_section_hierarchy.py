import re
import unittest
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "assets/css/main.css").read_text(encoding="utf-8")
SINGAPORE_CONTENT = (ROOT / "content/singapore.md").read_text(encoding="utf-8")
PHILOSOPHY_CONTENT = (ROOT / "content/philosophy.md").read_text(encoding="utf-8")
CONTACT_CONTENT = (ROOT / "content/contact.md").read_text(encoding="utf-8")


def section(name):
    start = f"<!-- ==================== SECTION: {name} ==================== -->"
    end = f"<!-- ================== END SECTION: {name} ================== -->"
    return INDEX.split(start, 1)[1].split(end, 1)[0]


SINGAPORE = section("singapore")
PHILOSOPHY = section("philosophy")
CONTACT = section("contact")


class ImageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []

    def handle_starttag(self, tag, attrs):
        if tag == "img":
            self.images.append(dict(attrs))


class SectionHierarchyTests(unittest.TestCase):
    def test_singapore_is_a_compact_image_free_global_band(self):
        self.assertIn('class="singapore-band', SINGAPORE)
        self.assertNotIn('class="sg-card', SINGAPORE)
        self.assertNotIn("<img", SINGAPORE)
        tags = SINGAPORE.split('class="sg-tags"', 1)[1].split("</div>", 1)[0]
        self.assertEqual(5, len(re.findall(r"<span>.*?</span>", tags, re.S)))

    def test_singapore_facts_remain_reachable_and_tags_share_width(self):
        for value in (
            "Blooming Future Education and Culture Pte. Ltd.",
            "2 Kallang Avenue, #06-15, CT Hub, Singapore 339407",
            "+65 6015 0790",
            "sgfar1999@outlook.com",
        ):
            self.assertIn(value, INDEX)
        tag_rule = CSS.split(".sg-tags span {", 1)[1].split("}", 1)[0]
        self.assertRegex(tag_rule, r"flex:\s*1\s+1")

    def test_mascot_is_the_final_static_philosophy_banner(self):
        self.assertLess(PHILOSOPHY.index('class="phil-body"'), PHILOSOPHY.index('class="mascot-callout"'))
        parser = ImageParser()
        parser.feed(PHILOSOPHY)
        mascot = next(image for image in parser.images if image.get("src") == "/assets/img/mascot-elephant.png")
        self.assertEqual("450", mascot.get("width"))
        self.assertEqual("400", mascot.get("height"))
        self.assertEqual("lazy", mascot.get("loading"))
        mascot_rule = CSS.split(".mascot-callout {", 1)[1].split("}", 1)[0]
        self.assertIn("padding: 64px 0", mascot_rule)
        self.assertIn("border-block: 1px solid var(--line)", mascot_rule)
        mascot_styles = CSS.split(".mascot-callout {", 1)[1].split(".phil-body", 1)[0]
        self.assertNotIn("animation:", mascot_styles)

    def test_contact_orders_tianjin_singapore_then_departments(self):
        tianjin = CONTACT.index("Tianjin HQ · 天津集团总部")
        singapore = CONTACT.index("Singapore HQ · 新加坡总部")
        departments = CONTACT.index("Departments · 各部门专线")
        self.assertLess(tianjin, singapore)
        self.assertLess(singapore, departments)
        self.assertIn('class="contact-card departments"', CONTACT)
        departments_rule = CSS.split(".contact-card.departments {", 1)[1].split("}", 1)[0]
        self.assertRegex(departments_rule, r"grid-column:\s*1\s*/\s*-1")

    def test_only_tianjin_contact_card_has_a_real_photo(self):
        cards = CONTACT.split('<article class="contact-card')
        tianjin_card = next(card for card in cards if "Tianjin HQ · 天津集团总部" in card)
        singapore_card = next(card for card in cards if "Singapore HQ · 新加坡总部" in card)
        self.assertIn('src="/assets/img/campus-3.jpg"', tianjin_card)
        self.assertIn('width="480"', tianjin_card)
        self.assertIn('height="276"', tianjin_card)
        self.assertIn('loading="lazy"', tianjin_card)
        self.assertNotIn("<img", singapore_card)

    def test_contact_values_and_links_remain_exact(self):
        for value in (
            "天津市津南区·启迪科技园 35 号楼",
            'href="tel:+8602259185201"',
            'href="tel:4000006909"',
            'href="tel:+6560150790"',
            'href="mailto:sgfar1999@outlook.com"',
            "09:00–11:30 · 13:00–17:00 SGT",
            "08:00–12:15 · 14:15–18:30 SGT",
        ):
            self.assertIn(value, CONTACT)

    def test_three_content_sources_are_synced_and_typo_free(self):
        for value in (SINGAPORE_CONTENT, PHILOSOPHY_CONTENT, CONTACT_CONTENT):
            self.assertIn("Last sync to index.html: 2026-07-22", value)
        for name in ("singapore", "philosophy", "contact"):
            self.assertIn(f"source: content/{name}.md  ·  last sync: 2026-07-22", INDEX)
        self.assertNotIn("安顶", PHILOSOPHY_CONTENT)
        self.assertNotIn("安顶", PHILOSOPHY)


if __name__ == "__main__":
    unittest.main()
