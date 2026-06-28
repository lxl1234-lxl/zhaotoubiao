"""
测试6精确版: 评标阶段 — 打分并设为候选人
需要先清空数据，重新初始化，然后精确控制流程
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

def screenshot(name):
    path = os.path.join(SCREENSHOT_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f"  📸 {name}")

p = sync_playwright().start()
browser = p.chromium.launch(headless=True)
context = browser.new_context(viewport={"width": 1440, "height": 900})
page = context.new_page()

# 清空数据并重新初始化
page.goto(BASE_URL)
page.evaluate("localStorage.clear()")
page.reload()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1500)

# 1. 用 zhaobiao 登录
page.click("text=登录")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)
page.fill("input[type='text']", "zhaobiao")
page.fill("input[type='password']", "123456")
page.click("button[type='submit']")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)
print("✅ zhaobiao 登录成功")

# 2. 用 toubiao 登录另一个浏览器实例 投标
# (先在本页面以zhaobiao身份进入招标管理)
page.click("text=招标管理")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)
screenshot("06a_dashboard_initial.png")

# 查看当前各招标的阶段状态
tender_cards = page.locator(".bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-5")
print(f"招标管理页面项目数: {tender_cards.count()}")

# 找到智慧园区的进入下一阶段按钮逐个点击
# 需要：BIDDING → OPENING → EVALUATION（然后打分）
print("逐步推进招标阶段...")

# 第1次：BIDDING → OPENING
btn1 = page.locator("text=进入下一阶段").first
btn1.click()
page.wait_for_timeout(800)
print("  第1次推进: BIDDING → OPENING")

# 第2次：OPENING → EVALUATION  
btn2 = page.locator("text=进入下一阶段").first
btn2.click()
page.wait_for_timeout(800)
print("  第2次推进: OPENING → EVALUATION")

screenshot("06b_evaluation_reached.png")

# 现在应该能看到评标阶段的打分了
# 点击"查看投标"
view_bids = page.locator("text=查看投标").first
if view_bids.count() > 0:
    view_bids.click()
    page.wait_for_timeout(1000)
    print("✅ 点击了'查看投标'")
    
    screenshot("06c_bids_expanded.png")
    
    # 查找打分输入框
    score_inputs = page.locator("input[type='number']")
    print(f"  数字输入框总数: {score_inputs.count()}")
    
    if score_inputs.count() >= 3:
        # 价格、技术、资质
        score_inputs.nth(0).fill("35")
        score_inputs.nth(1).fill("30")
        score_inputs.nth(2).fill("20")
        print("✅ 评分: 价格35 + 技术30 + 资质20 = 总分85")
        
        screenshot("06d_scores_filled.png")
        
        # 点击"设为候选人"
        candidate_btn = page.locator("text=设为候选人")
        if candidate_btn.count() > 0:
            candidate_btn.first.click()
            page.wait_for_timeout(1000)
            print("✅ 已设为候选人")
            screenshot("06e_candidate_set.png")
            
            # 验证阶段变为"中标公示"
            badge = page.locator("text=中标公示")
            print(f"  阶段变为'中标公示': {badge.count() > 0}")
        else:
            print("❌ 找不到'设为候选人'按钮")
    else:
        print(f"❌ 打分输入框不足 (需要3, 实际{score_inputs.count()})")
else:
    print("❌ 找不到'查看投标'按钮")

# 最后截图
screenshot("06f_final_state.png")

page.close()
context.close()
browser.close()
p.stop()
print("\n✅ 测试6精确测试完成")
