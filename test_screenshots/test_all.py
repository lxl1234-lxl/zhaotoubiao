"""
招标投标网站 — 综合功能测试
测试所有6项功能并截图
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

def log(msg):
    print(f"  {msg}")

p = sync_playwright().start()
browser = p.chromium.launch(headless=True)
context = browser.new_context(viewport={"width": 1440, "height": 900})
page = context.new_page()

page.on("pageerror", lambda err: print(f"⚠️ PAGE ERROR: {err}"))

# =============================================
# 初始化: 清空 localStorage 并加载首页
# =============================================
log("初始化: 清空 localStorage 并加载首页...")
page.goto(BASE_URL)
page.evaluate("localStorage.clear()")
page.reload()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1500)

# =============================================
# 测试1: 首页展示
# =============================================
print("\n" + "="*60)
print("📋 测试1: 首页 — 公告栏、招标列表(阶段标签、倒计时)")
print("="*60)

# 截图全页
page.screenshot(path=os.path.join(SCREENSHOT_DIR, "01_homepage.png"), full_page=True)
print("✅ 截图已保存: 01_homepage.png")

# 公告栏
ann_section = page.locator("text=最新公告")
if ann_section.count() > 0:
    print("✅ 公告栏 '最新公告' 模块存在")
    # 检查公告条目
    ann_items = page.locator("a[href*='/tender/']")
    print(f"   公告区域可点击链接数: {ann_items.count()}")
else:
    print("❌ 公告栏不存在")

# 阶段标签
badges = page.locator("span").filter(has_text="已定标").or_(page.locator("span").filter(has_text="报名阶段")).or_(page.locator("span").filter(has_text="投标中"))
print(f"   阶段标签数: {badges.count()}")
for i, b in enumerate(badges.all()):
    print(f"   标签{i+1}: {b.inner_text()}")

# 倒计时
countdown = page.locator("text=截标倒计时")
if countdown.count() > 0:
    print(f"✅ 倒计时标签存在: {countdown.first.inner_text()}")
else:
    print("❌ 倒计时标签不存在")

# 招标卡片列表
titles = page.locator("a.font-semibold")  # 招标标题链接
print(f"   招标项目数: {titles.count()}")
for i, t in enumerate(titles.all()):
    print(f"   项目{i+1}: {t.inner_text()}")

# =============================================
# 测试2: 招标详情页
# =============================================
print("\n" + "="*60)
print("📋 测试2: 招标详情页 — 招标流程时间线 + 招标公告板块")
print("="*60)

# 点击第一个招标项目（智慧园区项目 - 投标中阶段）
tender_link = page.locator("a:has-text('智慧园区综合管理平台建设项目')").first
tender_name = tender_link.inner_text()
tender_link.click()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

page.screenshot(path=os.path.join(SCREENSHOT_DIR, "02_detail_timeline.png"), full_page=True)
print("✅ 截图已保存: 02_detail_timeline.png")

# 检查招标流程时间线
timeline = page.locator("text=招标流程")
if timeline.count() > 0:
    print("✅ '招标流程' 时间线模块存在")
else:
    print("❌ '招标流程' 时间线模块不存在")

# 检查招标公告
ann_section_detail = page.locator("text=招标公告")
if ann_section_detail.count() > 0:
    print("✅ '招标公告' 板块存在")
    # 检查公告条目
    ann_detail_items = page.locator("text=智慧园区综合管理平台建设项目招标公告")
    print(f"   公告条目: {ann_detail_items.first.inner_text() if ann_detail_items.count() > 0 else 'N/A'}")
else:
    print("❌ '招标公告' 板块不存在")

# 回到首页
page.goto(BASE_URL)
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

# =============================================
# 测试3: 招标方登录 — 发布公告按钮
# =============================================
print("\n" + "="*60)
print("📋 测试3: 招标方(zhaobiao/123456)登录 — 发布公告按钮")
print("="*60)

# 导航到登录页
page.click("text=登录")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

# 填写登录表单
page.fill("input[type='text']", "zhaobiao")
page.fill("input[type='password']", "123456")
page.click("button[type='submit']")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

# 验证登录成功
login_success = page.locator("text=华夏建设工程有限公司")
if login_success.count() > 0:
    print("✅ 招标方登录成功: 华夏建设工程有限公司")
else:
    print("❌ 招标方登录失败")

# 点击第一个招标项目进入详情页
tender_link2 = page.locator("a:has-text('智慧园区综合管理平台建设项目')").first
tender_link2.click()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

page.screenshot(path=os.path.join(SCREENSHOT_DIR, "03_owner_publish_btn.png"), full_page=True)
print("✅ 截图已保存: 03_owner_publish_btn.png")

# 检查发布公告按钮
publish_btn = page.locator("text=+ 发布公告")
if publish_btn.count() > 0:
    print("✅ '发布公告' 按钮存在（以招标方身份）")
else:
    print("❌ '发布公告' 按钮不存在")

# 退出登录
page.click("text=退出")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

# =============================================
# 测试4: 投标方登录 — 两步投标流程
# =============================================
print("\n" + "="*60)
print("📋 测试4: 投标方(toubiao/123456)登录 — 两步投标流程")
print("="*60)

page.click("text=登录")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

page.fill("input[type='text']", "toubiao")
page.fill("input[type='password']", "123456")
page.click("button[type='submit']")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

login_success2 = page.locator("text=东方智能科技有限公司")
if login_success2.count() > 0:
    print("✅ 投标方登录成功: 东方智能科技有限公司")
else:
    print("❌ 投标方登录失败")

# 点击第二个招标（报名阶段的项目 - 办公楼中央空调）
tender_link3 = page.locator("a:has-text('办公楼中央空调系统采购及安装')").first
tender_link3.click()
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

# 点击"我要投标"
bid_btn = page.locator("text=我要投标")
if bid_btn.count() > 0:
    bid_btn.first.click()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    print("✅ 进入投标页面")
else:
    print("❌ 找不到'我要投标'按钮")
    # 尝试直接用URL进入投标页
    bidder_dashboard_btn = page.locator("text=我的投标")
    if bidder_dashboard_btn.count() > 0:
        bidder_dashboard_btn.first.click()
        page.wait_for_load_state('networkidle')
        page.wait_for_timeout(500)

# 截图第一步：投标报名
page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_bid_step1.png"), full_page=True)
print("✅ 截图已保存: 04_bid_step1.png")

# 检查是否有第一步标题
step1_title = page.locator("text=第一步：投标报名")
step2_title = page.locator("text=第二步：递交投标文件")
steps = page.locator("text=投标报名").or_(page.locator("text=递交投标文件"))

if step1_title.count() > 0:
    print("✅ '第一步：投标报名' 步骤标题存在")
if step2_title.count() > 0:
    print("✅ '第二步：递交投标文件' 步骤标题存在")

print(f"   步骤指示器: {'✓' if steps.count() >= 2 else '❌ 步骤不足'} (找到{steps.count()}个步骤)")

# 填写报名表单
company_input = page.locator("input[name='companyName']")
if company_input.count() > 0:
    print("✅ 报名表单存在")
    company_input.fill("东方智能科技有限公司")
    page.fill("input[name='contactName']", "陈经理")
    page.fill("input[name='contactPhone']", "15000150000")
    
    # 勾选保证金确认
    deposit_check = page.locator("input[name='depositConfirmed']")
    if deposit_check.count() > 0:
        deposit_check.check()
        print("   已勾选保证金确认")
    
    # 点击进入下一步
    next_btn = page.locator("text=确认报名，进入下一步")
    if next_btn.count() > 0:
        next_btn.first.click()
        page.wait_for_timeout(1000)
        print("✅ 进入第二步")
        
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_bid_step2.png"), full_page=True)
        print("✅ 截图已保存: 04_bid_step2.png")
        
        # 检查第二步表单
        price_input = page.locator("input[name='price']")
        if price_input.count() > 0:
            print("✅ 第二步：投标报价表单存在")
            price_input.fill("2200000")
            page.fill("textarea[name='commercialDoc']", "付款方式: 30%预付款, 70%验收后付清。质保期5年。")
            page.fill("textarea[name='techProposal']", "本公司拥有15年暖通工程经验，提供大金品牌中央空调系统，含安装调试服务。")
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_bid_step2_filled.png"), full_page=True)
    else:
        print("❌ 无'确认报名'按钮")
else:
    print("❌ 报名表单不存在")
    # 可能已经投标过或不在报名阶段，截图看看当前状态
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "04_bid_status.png"), full_page=True)

# 退出登录，用zhaobiao重新登录
page.click("text=退出")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

# =============================================
# 测试5: 招标管理 — 进入下一阶段
# =============================================
print("\n" + "="*60)
print("📋 测试5: 招标管理 — 进入下一阶段")
print("="*60)

page.click("text=登录")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(500)

page.fill("input[type='text']", "zhaobiao")
page.fill("input[type='password']", "123456")
page.click("button[type='submit']")
page.wait_for_load_state('networkidle')
page.wait_for_timeout(1000)

# 进入招标管理
owner_dash = page.locator("text=招标管理")
if owner_dash.count() > 0:
    owner_dash.first.click()
    page.wait_for_load_state('networkidle')
    page.wait_for_timeout(1000)
    print("✅ 进入招标管理页面")
else:
    print("❌ 找不到'招标管理'导航")

page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_owner_dashboard.png"), full_page=True)
print("✅ 截图已保存: 05_owner_dashboard.png")

# 找一个可以推进阶段的招标，点击"进入下一阶段"
advance_btn = page.locator("text=进入下一阶段")
if advance_btn.count() > 0:
    print(f"✅ 找到'进入下一阶段'按钮 ({advance_btn.count()}个)")
    # 点击第一个可推进的
    advance_btn.first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "05_after_advance.png"), full_page=True)
    print("✅ 截图已保存: 05_after_advance.png (阶段推进后)")
    
    # 再次检查阶段是否变化
    new_advance = page.locator("text=进入下一阶段")
    print(f"   推进后仍有按钮: {new_advance.count()}个")
else:
    print("⚠️ 没有找到'进入下一阶段'按钮（可能所有项目已到最后阶段）")

# =============================================
# 测试6: 评标阶段 — 打分并设为候选人
# =============================================
print("\n" + "="*60)
print("📋 测试6: 评标阶段 — 打分并设为候选人")
print("="*60)

# 推进到评标阶段：多次点击"进入下一阶段"
max_clicks = 10
clicks = 0
while clicks < max_clicks:
    adv_btn = page.locator("text=进入下一阶段")
    if adv_btn.count() > 0:
        adv_btn.first.click()
        page.wait_for_timeout(800)
        clicks += 1
        log(f"   点击推进 {clicks} 次")
    else:
        break

page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_evaluation_stage.png"), full_page=True)
print("✅ 截图已保存: 06_evaluation_stage.png")

# 检查是否有投标可以查看/打分
view_bids = page.locator("text=查看投标")
print(f"   '查看投标'按钮数: {view_bids.count()}")

# 点击查看投标
if view_bids.count() > 0:
    view_bids.first.click()
    page.wait_for_timeout(1000)
    page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_bids_expanded.png"), full_page=True)
    print("✅ 截图已保存: 06_bids_expanded.png")
    
    # 查找打分输入框
    score_inputs = page.locator("input[placeholder='价格'], input[placeholder='技术'], input[placeholder='资质']")
    print(f"   评标打分输入框数: {score_inputs.count()}")
    
    if score_inputs.count() > 0:
        # 输入分数
        score_inputs.nth(0).fill("35")
        score_inputs.nth(1).fill("30")
        score_inputs.nth(2).fill("20")
        print("✅ 已输入评标分数: 价格35, 技术30, 资质20")
        
        page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_scored.png"), full_page=True)
        print("✅ 截图已保存: 06_scored.png")
        
        # 查找"设为候选人"按钮
        candidate_btn = page.locator("text=设为候选人")
        if candidate_btn.count() > 0:
            candidate_btn.first.click()
            page.wait_for_timeout(1000)
            page.screenshot(path=os.path.join(SCREENSHOT_DIR, "06_candidate_set.png"), full_page=True)
            print("✅ 截图已保存: 06_candidate_set.png (设为候选人后)")
            print("✅ 已设为候选人")
            
            # 检查阶段是否变为"中标公示"
            candidate_badge = page.locator("text=中标公示")
            if candidate_badge.count() > 0:
                print("✅ 阶段已变更为'中标公示'")
        else:
            print("⚠️ 无'设为候选人'按钮（可能不在评标阶段）")
else:
    print("⚠️ 无投标可查看")

# 关闭浏览器
page.close()
context.close()
browser.close()
p.stop()

print("\n" + "="*60)
print("🎉 所有测试完成！截图已保存到 test_screenshots/ 目录")
print("="*60)
