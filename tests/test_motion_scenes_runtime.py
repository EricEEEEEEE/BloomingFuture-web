import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
MAIN_CSS = ROOT / "assets/css/main.css"
MOTION_CSS = ROOT / "assets/css/motion.css"
SCENES_PATH = ROOT / "assets/css/motion-scenes.css"
SCENES = SCENES_PATH.read_text(encoding="utf-8") if SCENES_PATH.exists() else ""


class MotionScenesRuntimeTests(unittest.TestCase):
    def test_scene_stylesheet_is_versioned_local_and_inside_total_budget(self):
        self.assertTrue(SCENES_PATH.is_file())
        self.assertIn('/assets/css/motion-scenes.css?v=2.1.0-r1', INDEX)
        self.assertLess(SCENES_PATH.stat().st_size, 8 * 1024)
        self.assertLess(
            MAIN_CSS.stat().st_size + MOTION_CSS.stat().st_size + SCENES_PATH.stat().st_size,
            52 * 1024,
        )

    def test_all_six_sections_have_executable_signature_keyframes(self):
        for keyframe in (
            "motionTimelineDraw",
            "motionElasticGrid",
            "motionSignalRun",
            "motionRitualWave",
            "motionTagsWake",
            "motionQuoteWord",
            "motionMascotReveal",
            "motionContactRise",
            "motionLogoBloom",
        ):
            self.assertIn(f"@keyframes {keyframe}", SCENES)
        self.assertGreaterEqual(SCENES.count("animation:"), 12)

    def test_scene_motion_cannot_create_horizontal_overflow_and_degrades_cleanly(self):
        self.assertIn("overflow-x: clip", SCENES)
        self.assertIn("@media (max-width: 820px)", SCENES)
        self.assertIn("@media (prefers-reduced-motion: reduce)", SCENES)
        self.assertIn("animation: none", SCENES)


if __name__ == "__main__":
    unittest.main()
