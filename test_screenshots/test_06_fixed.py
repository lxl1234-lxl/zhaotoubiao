"""
测试6修正版: 评标阶段 — 打分并设为候选人
精确定位智慧园区项目，逐步推进到评标阶段
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

def ss(name):
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, name), full_page=True)

p = sync_playwright().start()
browser = p.chromium.launch(headless=True)
context = browser.new_context(viewport={"width": 1440, "height": 900})
page = context.new_page()

page.on("pageerror", lambda err: print(f"⚠️ PAGE ERROR: {err}"))

# 清空并初始化
page.goto(BASE_URL)
page.evaluate("localStorage.clear()")
page.reload()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1500)

# 登录招标方
page.click("text=登录")
page.wait_for_timeout(500)
page.fill("input[type='text']", "zhaobiao")
page.fill("input[type='password']", "123456")
page.click("button[type='submit']")
page.wait_for_timeout(1000)
print("✅ zhaobiao 登录")

# 进入招标管理
page.click("text=招标管理")
page.wait_for_timeout(1000)

# 找到智慧园区项目的卡片容器
tender_cards = page.locator("div.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-5")
print(f"招标卡片数: {tender_cards.count()}")

# 找到包含"智慧园区"的那个卡片
zhihui_card = tender_cards.filter(has_text="智慧园区")
print(f"智慧园区卡片存在: {zhihui_card.count() > 0}")

# 在该卡片内找"进入下一阶段"按钮
advance_btn = zhihui_card.locator("text=进入下一阶段")
print(f"智慧园区-进入下一阶段按钮: {advance_btn.count()}")

# 第1次推进: BIDDING → OPENING
advance_btn.click()
page.wait_for_timeout(1500)
print("✅ 第1次: BIDDING → OPENING")
ss("06f_01_after_adv1.png")

# 重新获取智慧园区卡片（DOM已更新）
tender_cards = page.locator("div.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-5")
zhihui_card = tender_cards.filter(has_text="智慧园区")
advance_btn2 = zhihui_card.locator("text=进入下一阶段")
print(f"还有进入下一阶段按钮: {advance_btn2.count()}")

# 第2次推进: OPENING → EVALUATION
if advance_btn2.count() > 0:
    advance_btn2.click()
    page.wait_for_timeout(1500)
    print("✅ 第2次: OPENING → EVALUATION")
else:
    print("⚠️ 无更多推进按钮")
ss("06f_02_after_adv2.png")

# 重新获取卡片，检查阶段
tender_cards = page.locator("div.bg-white.rounded-lg.shadow-sm.border.border-gray-200.p-5")
zhihui_card = tender_cards.filter(has_text="智慧园区")

# 检查当前阶段标签
stage_label = zhihui_card.locator("span").filter(has_text="评标中").or_(zhihui_card.locator("span").filter(has_text="开标")).or_(zhihui_card.locator("span").filter(has_text="中标公示"))
print(f"当前阶段标签: {stage_label.first.inner_text() if stage_label.count() > 0 else '未知'}")

# 点击"查看投标"
view_bid_btn = zhihui_card.locator("text=查看投标")
print(f"查看投标按钮数: {view_bid_btn.count()}")
view_bid_btn.first.click()
page.wait_for_timeout(1000)
print("✅ 展开投标详情")
ss("06f_03_bids_expanded.png")

# 查看展开后的所有input
all_inputs = page.locator("input[type='number']")
print(f"数字输入框数: {all_inputs.count()}")

if all_inputs.count() >= 3:
    all_inputs.nth(0).fill("35")
    all_inputs.nth(1).fill("30")
    all_inputs.nth(2).fill("20")
    print("✅ 已打分: 价格35, 技术30, 资质20")
    ss("06f_04_scores_filled.png")
    
    # 找"设为候选人"按钮
    candidate_btn = page.locator("button:has-text('设为候选人')")
    print(f"设为候选人按钮: {candidate_btn.count()}")
    if candidate_btn.count() > 0:
        candidate_btn.first.click()
        page.wait_for_timeout(1000)
        print("✅ 点击了'设为候选人'")
        ss("06f_05_candidate_set.png")
        
        # 验证阶段
        badge = page.locator("text=中标公示")
        print(f"阶段已变为中标公示: {badge.count() > 0}")
    else:
        print("❌ 无设为候选人按钮")
else:
    print(f"❌ 数字输入框不足 ({all_inputs.count()})")
    # 打印展开区域的所有文本看看
    bid_items = page.locator("div.bg-gray-50.rounded-lg.p-4")
    print(f"  投标条目数: {bid_items.count()}")
    for i, item in enumerate(bid_items.all()):
        print(f"  投标{i+1}: {item.inner_text()[:200]}")

ss("06f_99_final.png")
page.close()
context.close()
browser.close()
p.stop()
print("\n✅ 测试完成")
