import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
README = (ROOT / "README.md").read_text(encoding="utf-8")
PROJECT_DOC = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
REPORT_PATH = ROOT / "docs/v2.1-motion-report.md"
REPORT = REPORT_PATH.read_text(encoding="utf-8") if REPORT_PATH.exists() else ""


class MotionReleaseTests(unittest.TestCase):
    def test_report_records_full_browser_matrix(self):
        self.assertTrue(REPORT_PATH.is_file())
        self.assertIn("73/73", REPORT)
        for viewport in ("1440×900", "1024×768", "768×1024", "390×844"):
            self.assertIn(viewport, REPORT)
        self.assertGreaterEqual(REPORT.count("横向溢出 0"), 4)
        self.assertIn("console warning/error 0", REPORT)

    def test_report_records_motion_lifecycle_and_accessibility(self):
        for evidence in (
            "单一 requestAnimationFrame 调度器",
            "页面隐藏时暂停",
            "prefers-reduced-motion",
            "移动端关闭自定义光标、图片残影与 3D tilt",
            "Esc 关闭并归还焦点",
        ):
            self.assertIn(evidence, REPORT)

    def test_report_records_exact_css_and_javascript_budgets(self):
        css_bytes = sum(
            (ROOT / path).stat().st_size
            for path in (
                "assets/css/main.css",
                "assets/css/motion.css",
                "assets/css/motion-scenes.css",
            )
        )
        js_bytes = sum(
            (ROOT / path).stat().st_size
            for path in ("assets/js/main.js", "assets/js/motion.js")
        )
        self.assertLessEqual(css_bytes, 52 * 1024)
        self.assertLessEqual(js_bytes, 32 * 1024)
        self.assertIn(f"CSS {css_bytes:,} B", REPORT)
        self.assertIn(f"JavaScript {js_bytes:,} B", REPORT)

    def test_readme_and_project_doc_register_v21_motion_system(self):
        self.assertIn("## v2.1 Motion Upgrade", README)
        for path in (
            "assets/css/motion.css",
            "assets/css/motion-scenes.css",
            "assets/js/motion.js",
        ):
            self.assertIn(path, README)
        self.assertIn("FullSiteMotion", PROJECT_DOC)
        self.assertIn("FinePointer", PROJECT_DOC)

    def test_report_preserves_real_assets_and_release_controls(self):
        for evidence in (
            "未新增或生成图片",
            "far1999.com",
            "git push origin main",
            "git revert <release-commit>",
            "Cloudflare Pages",
            "https://bloomingfuture.io",
            "https://github.com/tsparticles/tsparticles",
            "https://github.com/michalsnik/aos",
        ):
            self.assertIn(evidence, REPORT)
        self.assertIn("/assets/js/motion.js?v=2.1.0-r4", INDEX)


if __name__ == "__main__":
    unittest.main()
