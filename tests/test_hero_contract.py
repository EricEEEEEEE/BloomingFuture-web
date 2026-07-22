import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
HERO_CONTENT = (ROOT / "content/hero.md").read_text(encoding="utf-8")
SCRIPT = (ROOT / "assets/js/main.js").read_text(encoding="utf-8")

HERO_CN = "二十六年真实教学，正在成为每个孩子的 AI 学习系统。"
HERO_EN = "Twenty-six years of real teaching, becoming an intelligent learning system for every child."


class HeroContractTests(unittest.TestCase):
    def test_new_positioning_is_visible_and_synced(self):
        for value in (HERO_CN, HERO_EN):
            self.assertIn(value, INDEX)
            self.assertIn(value, HERO_CONTENT)

    def test_scene_has_separate_update_and_draw_phases(self):
        self.assertIn("function updateScene", SCRIPT)
        self.assertIn("function drawScene", SCRIPT)

    def test_reduced_motion_renders_a_static_frame(self):
        self.assertIn("renderStaticFrame", SCRIPT)
        self.assertNotIn("if (!canvas || reduceMotion) return;", SCRIPT)

    def test_animation_pauses_when_document_is_hidden(self):
        self.assertIn("visibilitychange", SCRIPT)
        self.assertIn("document.hidden", SCRIPT)

    def test_animation_pauses_when_hero_leaves_viewport(self):
        self.assertIn("heroObserver", SCRIPT)
        self.assertIn("IntersectionObserver", SCRIPT)

    def test_canvas_uses_resize_observer_and_dpr_cap(self):
        self.assertIn("ResizeObserver", SCRIPT)
        self.assertRegex(SCRIPT, r"Math\.min\([^\n]*devicePixelRatio[^\n]*,\s*2\s*\)")

    def test_desktop_and_mobile_frame_intervals_are_explicit(self):
        self.assertIn("DESKTOP_FRAME_INTERVAL", SCRIPT)
        self.assertIn("MOBILE_FRAME_INTERVAL", SCRIPT)
        self.assertIn("1000 / 60", SCRIPT)
        self.assertIn("1000 / 30", SCRIPT)

    def test_pointer_relationship_is_desktop_only(self):
        self.assertIn('addEventListener("pointermove"', SCRIPT)
        self.assertIn('addEventListener("pointerleave"', SCRIPT)
        self.assertIn("POINTER_RADIUS", SCRIPT)

    def test_particles_respect_the_content_exclusion_zone(self):
        self.assertIn("heroBody", SCRIPT)
        self.assertIn("getBoundingClientRect", SCRIPT)
        self.assertIn("isInsideExclusion", SCRIPT)


if __name__ == "__main__":
    unittest.main()
