import tempfile
import unittest
from pathlib import Path

from scripts.site_contract import inspect_project


CONTACT_VALUES = (
    "天津市津南区·启迪科技园 35 号楼",
    "+86 022-5918-5201",
    "400-000-6909",
    "+65 6015 0790",
    "sgfar1999@outlook.com",
)

REQUIRED_ASSETS = (
    "campus-1.jpg",
    "campus-2.jpg",
    "campus-3.jpg",
    "textbook-1.jpg",
    "textbook-2.jpg",
    "textbook-3.jpg",
    "textbook-4.jpg",
    "textbook-5.jpg",
    "cert-mofcom.png",
    "cert-iso9001.png",
    "mascot-elephant.png",
    "bloomingfuture-logo.png",
)


class SiteContractTests(unittest.TestCase):
    def setUp(self):
        self.tempdir = tempfile.TemporaryDirectory()
        self.root = Path(self.tempdir.name)
        (self.root / "assets/css").mkdir(parents=True)
        (self.root / "assets/js").mkdir(parents=True)
        (self.root / "assets/img").mkdir(parents=True)
        (self.root / "content").mkdir()

        for filename in REQUIRED_ASSETS:
            (self.root / "assets/img" / filename).write_bytes(b"fixture")

        contact_text = "\n".join(CONTACT_VALUES)
        (self.root / "content/contact.md").write_text(contact_text, encoding="utf-8")
        (self.root / "index.html").write_text(
            """<!doctype html><html lang=\"zh-Hans\"><head>
<link rel=\"stylesheet\" href=\"/assets/css/main.css\">
<script src=\"/assets/js/main.js\" defer></script></head><body>
<img src=\"/assets/img/campus-1.jpg\" alt=\"天津教学现场\">
<p>{contacts}</p></body></html>""".format(contacts=contact_text),
            encoding="utf-8",
        )
        (self.root / "assets/css/main.css").write_text(
            """:root {
  --bf-red: #c30d23; --bf-orange: #ef7a00; --bf-green: #8fc31f;
  --bf-blue: #2ea7e0; --bf-navy: #004089;
  --sans: \"Manrope\"; --serif: \"Cormorant Garamond\";
  --serif-cn: \"Noto Serif SC\"; --mono: \"JetBrains Mono\";
}""",
            encoding="utf-8",
        )
        (self.root / "assets/js/main.js").write_text(
            """const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const dpr = Math.min(devicePixelRatio || 1, 2);
const isMobile = innerWidth < 720;
const codeCount = isMobile ? 0 : 4;
if (isMobile) connections.length = 0;""",
            encoding="utf-8",
        )

    def tearDown(self):
        self.tempdir.cleanup()

    def test_valid_static_site_passes(self):
        self.assertEqual([], inspect_project(self.root))

    def test_external_runtime_asset_is_blocked(self):
        index = self.root / "index.html"
        index.write_text(
            index.read_text(encoding="utf-8").replace(
                "/assets/js/main.js", "https://cdn.example.com/app.js"
            ),
            encoding="utf-8",
        )
        self.assertTrue(any("external runtime asset" in item for item in inspect_project(self.root)))

    def test_missing_real_asset_is_blocked(self):
        (self.root / "assets/img/textbook-5.jpg").unlink()
        self.assertTrue(any("required asset" in item for item in inspect_project(self.root)))

    def test_contact_drift_is_blocked(self):
        index = self.root / "index.html"
        index.write_text(
            index.read_text(encoding="utf-8").replace("400-000-6909", "400-CHANGED"),
            encoding="utf-8",
        )
        self.assertTrue(any("contact value" in item for item in inspect_project(self.root)))

    def test_missing_mobile_motion_degrade_is_blocked(self):
        script = self.root / "assets/js/main.js"
        script.write_text("requestAnimationFrame(draw);", encoding="utf-8")
        issues = inspect_project(self.root)
        self.assertTrue(any("reduced motion" in item for item in issues))
        self.assertTrue(any("mobile motion" in item for item in issues))
        self.assertTrue(any("DPR cap" in item for item in issues))


if __name__ == "__main__":
    unittest.main()
