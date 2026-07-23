import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX_PATH = ROOT / "index.html"
CORE_CSS_PATH = ROOT / "assets/css/main.css"
CORE_JS_PATH = ROOT / "assets/js/main.js"
MOTION_CSS_PATH = ROOT / "assets/css/motion.css"
MOTION_JS_PATH = ROOT / "assets/js/motion.js"

INDEX = INDEX_PATH.read_text(encoding="utf-8")
MOTION_CSS = MOTION_CSS_PATH.read_text(encoding="utf-8") if MOTION_CSS_PATH.exists() else ""
MOTION_JS = MOTION_JS_PATH.read_text(encoding="utf-8") if MOTION_JS_PATH.exists() else ""


class MotionSystemTests(unittest.TestCase):
    def test_versioned_motion_assets_are_local_and_loaded(self):
        self.assertTrue(MOTION_CSS_PATH.is_file())
        self.assertTrue(MOTION_JS_PATH.is_file())
        self.assertIn('/assets/css/motion.css?v=2.1.0', INDEX)
        self.assertIn('/assets/js/motion.js?v=2.1.0', INDEX)
        self.assertNotRegex(MOTION_CSS + MOTION_JS, r"https?://|@import|\bimport\s+|\brequire\(")

    def test_motion_files_and_aggregate_payload_stay_bounded(self):
        self.assertLess(CORE_CSS_PATH.stat().st_size, 40 * 1024)
        self.assertLess(CORE_JS_PATH.stat().st_size, 20 * 1024)
        self.assertLess(MOTION_CSS_PATH.stat().st_size, 12 * 1024)
        self.assertLess(MOTION_JS_PATH.stat().st_size, 12 * 1024)
        self.assertLess(
            CORE_CSS_PATH.stat().st_size + MOTION_CSS_PATH.stat().st_size,
            52 * 1024,
        )
        self.assertLess(
            CORE_JS_PATH.stat().st_size + MOTION_JS_PATH.stat().st_size,
            32 * 1024,
        )

    def test_every_text_block_gets_viewport_motion_and_short_labels_get_glyph_motion(self):
        for selector in ("main h1", "main h2", "main h3", "main h4", "main p", "footer"):
            self.assertIn(selector, MOTION_JS)
        for token in (
            "IntersectionObserver",
            "motion-copy",
            "motion-glyph",
            'setAttribute("aria-label"',
            'setAttribute("aria-hidden", "true")',
        ):
            self.assertIn(token, MOTION_JS)
        self.assertIn("@keyframes motionTextEnter", MOTION_CSS)
        self.assertIn("@keyframes motionGlyphDecode", MOTION_CSS)

    def test_every_real_image_gets_reveal_tilt_glitch_and_bounded_same_image_trail(self):
        for token in (
            'querySelectorAll("img")',
            "motion-image-shell",
            "motion-image",
            "motion-image-ghost",
            "MAX_IMAGE_GHOSTS = 6",
            "GHOST_LIFETIME = 600",
            "image.currentSrc || image.src",
            "--tilt-x",
            "--tilt-y",
        ):
            self.assertIn(token, MOTION_JS)
        for token in (
            "clip-path",
            "@keyframes motionImageReveal",
            "@keyframes motionImageGlitch",
            "@keyframes motionGhost",
        ):
            self.assertIn(token, MOTION_CSS)

    def test_fine_pointer_uses_one_shared_cursor_scheduler(self):
        for token in (
            'matchMedia("(hover: hover) and (pointer: fine)")',
            "motion-cursor-canvas",
            "motion-cursor",
            'addEventListener("pointermove"',
            "requestAnimationFrame",
            'addEventListener("visibilitychange"',
            "document.hidden",
        ):
            self.assertIn(token, MOTION_JS)
        self.assertNotIn("setInterval", MOTION_JS)
        self.assertLessEqual(MOTION_JS.count("requestAnimationFrame"), 2)

    def test_each_section_has_a_distinct_signature_motion(self):
        for selector in (
            ".about.motion-active .history-timeline",
            ".about.motion-active .evidence-grid",
            ".ai.motion-active .learning-loop",
            ".ai.motion-active .textbook-item",
            ".ai.motion-active .ritual-card",
            ".singapore.motion-active .sg-tags",
            ".philosophy.motion-active .quote-cn",
            ".philosophy.motion-active .mascot-callout",
            ".contact.motion-active .contact-card",
        ):
            self.assertIn(selector, MOTION_CSS)
        self.assertIn("motion-signal", MOTION_JS)

    def test_pointer_effects_cannot_intercept_page_interaction(self):
        for selector in (".motion-cursor-canvas", ".motion-cursor", ".motion-image-ghost"):
            block = re.search(rf"{re.escape(selector)}\s*\{{(?P<body>[^}}]*)\}}", MOTION_CSS)
            self.assertIsNotNone(block, selector)
            self.assertIn("pointer-events: none", block.group("body"), selector)

    def test_mobile_and_reduced_motion_have_complete_static_fallbacks(self):
        self.assertIn("@media (max-width: 820px)", MOTION_CSS)
        self.assertIn("@media (prefers-reduced-motion: reduce)", MOTION_CSS)
        reduced = MOTION_CSS.split("@media (prefers-reduced-motion: reduce)", 1)[1]
        for token in (
            ".motion-cursor-canvas",
            ".motion-cursor",
            ".motion-image-ghost",
            "animation: none",
            "transition: none",
            "clip-path: none",
        ):
            self.assertIn(token, reduced)
        self.assertIn("if (reduceMotion) return", MOTION_JS)


if __name__ == "__main__":
    unittest.main()
