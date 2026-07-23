import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS = (ROOT / "assets/css/motion.css").read_text(encoding="utf-8")
SCRIPT = (ROOT / "assets/js/motion.js").read_text(encoding="utf-8")


class MotionImageRuntimeTests(unittest.TestCase):
    def test_image_planes_hide_their_backface_during_tilt(self):
        block = re.search(r"\.motion-image\s*\{(?P<body>[^}]*)\}", CSS)
        self.assertIsNotNone(block)
        self.assertIn("backface-visibility: hidden", block.group("body"))

    def test_ghost_pool_is_paint_contained_and_height_bounded(self):
        block = re.search(r"\.motion-image-ghost\s*\{(?P<body>[^}]*)\}", CSS)
        self.assertIsNotNone(block)
        self.assertIn("contain: layout paint", block.group("body"))
        self.assertIn("max-height: 96px", block.group("body"))

    def test_ghosts_only_copy_decoded_real_images(self):
        self.assertIn('ghost.decoding = "async"', SCRIPT)
        self.assertIn("if (!image.complete || !image.naturalWidth) return", SCRIPT)


if __name__ == "__main__":
    unittest.main()
