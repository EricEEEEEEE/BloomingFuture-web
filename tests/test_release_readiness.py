import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
CSS = (ROOT / "assets/css/main.css").read_text(encoding="utf-8")
README = (ROOT / "README.md").read_text(encoding="utf-8")
REPORT_PATH = ROOT / "docs/v2-release-report.md"
REPORT = REPORT_PATH.read_text(encoding="utf-8") if REPORT_PATH.exists() else ""

ASSET_DIMENSIONS = {
    "campus-1.jpg": "404×467",
    "campus-2.jpg": "480×276",
    "campus-3.jpg": "480×276",
    "textbook-1.jpg": "643×510",
    "textbook-2.jpg": "631×510",
    "textbook-3.jpg": "584×510",
    "textbook-4.jpg": "608×510",
    "textbook-5.jpg": "590×366",
    "cert-mofcom.png": "308×251",
    "cert-iso9001.png": "308×437",
    "mascot-elephant.png": "450×400",
}


class ReleaseReadinessTests(unittest.TestCase):
    def test_release_report_records_all_automated_and_browser_evidence(self):
        self.assertTrue(REPORT_PATH.is_file())
        self.assertIn("53/53", REPORT)
        for viewport in ("1440×900", "1024×768", "768×1024", "390×844"):
            self.assertIn(viewport, REPORT)
        self.assertGreaterEqual(REPORT.count("横向溢出 0"), 4)
        self.assertIn("console warning/error 0", REPORT)

    def test_release_report_has_complete_real_asset_ledger(self):
        for filename, dimensions in ASSET_DIMENSIONS.items():
            self.assertIn(filename, REPORT)
            self.assertIn(dimensions, REPORT)
        self.assertIn("far1999.com", REPORT)
        self.assertIn("未使用 AI 生成图", REPORT)
        self.assertIn("官网当前未再暴露直接 URL", REPORT)

    def test_verified_direct_source_urls_are_preserved(self):
        for url in (
            "https://www.far1999.com/skin/images/home-tx.png",
            "https://www.far1999.com/skin/images/home-hk.png",
            "https://www.far1999.com/skin/images/about_23.jpg",
            "https://www.far1999.com/skin/images/courses_04-r.jpg",
        ):
            self.assertIn(url, REPORT)

    def test_all_content_sources_and_html_sections_are_synced(self):
        for name in ("hero", "about", "ai", "singapore", "philosophy", "contact"):
            content = (ROOT / f"content/{name}.md").read_text(encoding="utf-8")
            self.assertIn("Last sync to index.html: 2026-07-22", content)
            self.assertIn(f"source: content/{name}.md  ·  last sync: 2026-07-22", INDEX)

    def test_readme_explains_v2_and_dependency_free_local_preview(self):
        self.assertIn("## v2.0 Visual Upgrade", README)
        self.assertIn("python3 -m http.server", README)
        self.assertIn("No build step", README)
        self.assertIn("https://bloomingfuture.io", README)

    def test_release_cache_version_and_document_are_final(self):
        self.assertIn("/assets/css/main.css?v=2.0.0", INDEX)
        self.assertIn("/assets/js/main.js?v=2.0.0", INDEX)
        self.assertNotRegex(REPORT, re.compile(r"\b(?:TODO|TBD|PLACEHOLDER)\b", re.I))
        for value in ("git push origin main", "git revert", "Cloudflare Pages"):
            self.assertIn(value, REPORT)

    def test_footer_logo_keeps_its_square_intrinsic_ratio_when_rendered(self):
        block = re.search(r"\.foot-logo-img\s*\{(?P<body>[^}]*)\}", CSS)
        self.assertIsNotNone(block)
        self.assertRegex(block.group("body"), r"height:\s*auto")

    def test_ai_section_title_has_two_intentional_balanced_lines(self):
        self.assertIn(
            '<span class="cn ai-title-cn">二十六年真实教学，<br>进入 AI 学习系统</span>',
            INDEX,
        )
        breakpoint = "@media (min-width: 1001px) and (max-width: 1100px)"
        self.assertIn(breakpoint, CSS)
        narrow_desktop = CSS.split(
            breakpoint, 1
        )[-1].split("@media", 1)[0]
        self.assertIn(".ai .ai-title-cn", narrow_desktop)
        self.assertIn("font-size: 40px", narrow_desktop)


if __name__ == "__main__":
    unittest.main()
