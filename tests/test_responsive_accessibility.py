import re
import unittest
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "index.html"
CSS_PATH = ROOT / "assets/css/main.css"
SCRIPT_PATH = ROOT / "assets/js/main.js"
INDEX = INDEX_PATH.read_text(encoding="utf-8")
CSS = CSS_PATH.read_text(encoding="utf-8")
SCRIPT = SCRIPT_PATH.read_text(encoding="utf-8")


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.images = []
        self.resources = []

    def handle_starttag(self, tag, attrs):
        values = dict(attrs)
        if tag == "img":
            self.images.append(values)
        if tag in {"img", "script"} and values.get("src"):
            self.resources.append(values["src"])
        if tag == "link" and values.get("href"):
            self.resources.append(values["href"])


class ResponsiveAccessibilityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.parser = PageParser()
        cls.parser.feed(INDEX)

    def test_static_file_budgets_stay_inside_red_lines(self):
        self.assertLess(INDEX_PATH.stat().st_size, 80 * 1024)
        self.assertLess(CSS_PATH.stat().st_size, 40 * 1024)
        self.assertLess(SCRIPT_PATH.stat().st_size, 20 * 1024)

    def test_every_image_has_intrinsic_dimensions_and_alt_text(self):
        self.assertGreaterEqual(len(self.parser.images), 14)
        for image in self.parser.images:
            self.assertTrue(image.get("alt"), image.get("src"))
            self.assertRegex(image.get("width", ""), r"^\d+$", image.get("src"))
            self.assertRegex(image.get("height", ""), r"^\d+$", image.get("src"))

    def test_runtime_assets_are_local_and_no_build_files_exist(self):
        for value in self.parser.resources:
            self.assertNotIn(urlparse(value).scheme, {"http", "https"}, value)
        for filename in ("package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock"):
            self.assertFalse((ROOT / filename).exists(), filename)

    def test_mobile_navigation_has_keyboard_close_focus_and_scroll_lock(self):
        for value in ("function closeNav", 'event.key === "Escape"', "nav-open", ".focus()"):
            self.assertIn(value, SCRIPT)
        self.assertIn("body.nav-open", CSS)
        self.assertIn('aria-controls="navLinks"', INDEX)
        self.assertIn('aria-expanded="false"', INDEX)

    def test_keyboard_focus_is_visibly_styled(self):
        self.assertIn(":focus-visible", CSS)
        self.assertRegex(CSS, r"outline:\s*2px\s+solid\s+var\(--bf-blue\)")

    def test_reduced_motion_disables_css_motion_and_js_loops(self):
        reduced = CSS.split("@media (prefers-reduced-motion: reduce)", 1)[1].split("@media", 1)[0]
        self.assertIn("animation-duration: .01ms", reduced)
        self.assertIn("transition-duration: .01ms", reduced)
        self.assertIn("scroll-behavior: auto", reduced)
        self.assertIn("if (reduceMotion) return", SCRIPT)

    def test_responsive_branches_cover_tablet_and_mobile_degradation(self):
        for breakpoint in ("1000px", "820px", "640px"):
            self.assertIn(f"@media (max-width: {breakpoint})", CSS)
        self.assertIn("codeCount = isMobile ? 0 : 4", SCRIPT)
        self.assertRegex(SCRIPT, r"if \(isMobile \|\|")
        self.assertIn('canvas.dataset.fps = isMobile ? "30" : "60"', SCRIPT)

    def test_canvas_is_hidden_from_screen_readers_and_spacing_is_nonnegative(self):
        self.assertIn('<canvas id="heroMatrix" aria-hidden="true"></canvas>', INDEX)
        self.assertNotRegex(CSS, r"letter-spacing:\s*-")
        self.assertRegex(SCRIPT, r"Math\.min\([^\n]*devicePixelRatio[^\n]*,\s*2\s*\)")


if __name__ == "__main__":
    unittest.main()
