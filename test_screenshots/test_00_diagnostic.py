"""
诊断: 检查页面渲染情况
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    console_errors = []
    page.on("console", lambda msg: print(f"[CONSOLE {msg.type}] {msg.text}") if msg.type in ('error', 'warning') else None)
    page.on("pageerror", lambda err: console_errors.append(f"PAGE ERROR: {err}"))
    
    page.goto(BASE_URL)
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(2000)
    
    # 截图
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "00_diagnostic.png"), full_page=True)
    
    # 获取HTML
    html = page.content()
    print(f"页面 HTML 长度: {len(html)}")
    
    # 检查body内容
    body_text = page.locator("body").inner_text()
    print(f"Body 文本: {body_text[:500]}")
    
    if console_errors:
        print(f"页面错误: {console_errors}")
    
    # 检查是否有React根节点
    root = page.locator("#root")
    print(f"#root 存在: {root.count() > 0}")
    if root.count() > 0:
        root_html = root.inner_html()
        print(f"#root 内容长度: {len(root_html)}")
        print(f"#root 内容前500字符: {root_html[:500]}")
    
    # 检查请求
    print(f"\n当前URL: {page.url}")
    print(f"页面标题: {page.title()}")
    
    page.close()
    browser.close()
