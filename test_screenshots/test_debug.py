"""
测试6调试版: 评标阶段详细调试
"""
from playwright.sync_api import sync_playwright
import os

BASE_URL = "http://localhost:4173/招标投标网站/"
SCREENSHOT_DIR = os.path.dirname(os.path.abspath(__file__))

def ss(name):
    path = os.path.join(SCREENSHOT_DIR, name)
    page.screenshot(path=path, full_page=True)

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

# 进入招标管理
page.click("text=招标管理")
page.wait_for_timeout(1000)
ss("debug_01_dashboard.png")

# 查看页面文本
body = page.locator("body").inner_text()
print(f"BODY前1500字符:\n{body[:1500]}")

# 查找所有"进入下一阶段"按钮
advance_btns = page.locator("text=进入下一阶段")
print(f"\n'进入下一阶段'按钮数: {advance_btns.count()}")

# 检查每个招标的阶段标签
stage_spans = page.locator("span").filter(has_text="投标中").or_(page.locator("span").filter(has_text="开标")).or_(page.locator("span").filter(has_text="评标中")).or_(page.locator("span").filter(has_text="报名阶段")).or_(page.locator("span").filter(has_text="已定标"))
for i, s in enumerate(stage_spans.all()):
    print(f"  阶段标签{i}: {s.inner_text()}")

# 第1次推进
if advance_btns.count() > 0:
    advance_btns.first.click()
    page.wait_for_timeout(1000)
    ss("debug_02_after_adv1.png")
    
    body2 = page.locator("body").inner_text()
    print(f"\n第1次推进后阶段标签:")
    stage_spans2 = page.locator("span").filter(has_text="投标中").or_(page.locator("span").filter(has_text="开标")).or_(page.locator("span").filter(has_text="评标中")).or_(page.locator("span").filter(has_text="报名阶段"))
    for i, s in enumerate(stage_spans2.all()):
        print(f"  {s.inner_text()}")

# 第2次推进
advance_btns2 = page.locator("text=进入下一阶段")
print(f"\n第2次前'进入下一阶段'按钮数: {advance_btns2.count()}")
if advance_btns2.count() > 0:
    advance_btns2.first.click()
    page.wait_for_timeout(1000)
    ss("debug_03_after_adv2.png")
    
    body3 = page.locator("body").inner_text()
    print(f"\n第2次推进后阶段标签:")
    stage_spans3 = page.locator("span").filter(has_text="开标").or_(page.locator("span").filter(has_text="评标中")).or_(page.locator("span").filter(has_text="中标公示"))
    for i, s in enumerate(stage_spans3.all()):
        print(f"  {s.inner_text()}")

# 找"查看投标"按钮
view_btns = page.locator("text=查看投标")
print(f"\n'查看投标'按钮数: {view_btns.count()}")

if view_btns.count() > 0:
    view_btns.first.click()
    page.wait_for_timeout(1000)
    ss("debug_04_after_view_bids.png")
    
    # 检查展开后的全部内容
    body4 = page.locator("body").inner_text()
    idx = body4.find("设为候选人")
    if idx > 0:
        print(f"\n'设为候选人'附近内容: {body4[idx-100:idx+100]}")
    else:
        # 找评标相关内容
        eval_idx = body4.find("评标")
        if eval_idx > 0:
            print(f"\n'评标'附近内容: {body4[eval_idx-50:eval_idx+200]}")
        else:
            print("\n未找到评标相关内容")
            # 输出所有包含"投标"的行
            for line in body4.split("\n"):
                if "投标" in line or "评分" in line or "价格" in line or "技术" in line:
                    print(f"  > {line}")
    
    # 检查打分输入框
    all_inputs = page.locator("input")
    print(f"\n所有input元素: {all_inputs.count()}")
    for i in range(min(all_inputs.count(), 20)):
        inp = all_inputs.nth(i)
        attrs = inp.evaluate("el => ({type: el.type, placeholder: el.placeholder, name: el.name, value: el.value})")
        print(f"  input[{i}]: {attrs}")

# 用 JS 检查 localStorage 中的招标数据
data = page.evaluate("""
    () => {
        const tenders = JSON.parse(localStorage.getItem('tender_tenders') || '[]');
        const bids = JSON.parse(localStorage.getItem('tender_bids') || '[]');
        return tenders.map(t => ({
            title: t.title.substring(0, 20),
            stage: t.stage,
            id: t.id.substring(0, 8)
        })).concat([{title: '---BIDS---', stage: '', id: ''}]).concat(bids.map(b => ({
            title: b.bidderName,
            stage: b.status,
            id: b.tenderId.substring(0, 8)
        })));
    }
""")
print(f"\nlocalStorage数据:")
for d in data:
    print(f"  {d}")

page.close()
context.close()
browser.close()
p.stop()
