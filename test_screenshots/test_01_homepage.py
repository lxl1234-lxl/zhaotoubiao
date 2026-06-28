"""
测试1: 首页展示 — 公告栏、招标列表（含招标阶段标签、倒计时）
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # 清空 localStorage 以确保初始化数据被重新加载
    page.goto(BASE_URL)
    page.evaluate("localStorage.clear()")
    page.reload()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    
    # 截图全页
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_homepage.png"), full_page=True)
    
    # 检查公告栏
    announcements = page.locator("text=最新公告")
    print(f"✅ 公告栏存在: {announcements.count() > 0}")
    
    # 检查公告条目
    ann_items = page.locator("a[href*='/tender/'] span.text-xs.bg-gray-100, a[href*='/tender/'] span.text-xs.bg-blue-100")
    print(f"公告标签数量: {ann_items.count()}")
    
    # 检查招标卡片
    tender_cards = page.locator("a[href*='/tender/']")
    print(f"招标链接数量: {tender_cards.count()}")
    
    # 检查倒计时标签
    countdown = page.locator("text=截标倒计时")
    print(f"✅ 倒计时标签存在: {countdown.count() > 0}")
    
    # 检查阶段标签 (TenderStageBadge 组件中的span)
    stage_badges = page.locator("span:has-text('投标中'), span:has-text('报名阶段'), span:has-text('已定标')")
    print(f"阶段标签数量: {stage_badges.count()}")
    
    # 获取页面内容用于验证
    titles = page.locator("a.text-lg.font-semibold, a.text-xl.font-semibold")
    title_texts = titles.all_text_contents()
    print(f"显示的招标标题: {title_texts}")
    
    # 检查快捷入口
    quick_links = page.locator("text=快捷入口")
    print(f"✅ 快捷入口存在: {quick_links.count() > 0}")
    
    page.close()
    browser.close()
    print("\n✅ 测试1完成: 首页截图已保存为 01_homepage.png")
