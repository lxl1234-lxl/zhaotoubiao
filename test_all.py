"""
全流程验证脚本：首页 → zhaobiao登录招标管理 → toubiao登录投标
"""
import os
import sys
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:4174/%E6%8B%9B%E6%A0%87%E6%8A%95%E6%A0%87%E7%BD%91%E7%AB%99/"
SCREENSHOT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "test_screenshots_new")
os.makedirs(SCREENSHOT_DIR, exist_ok=True)

results = []

def screenshot(page, name):
    path = os.path.join(SCREENSHOT_DIR, name)
    page.screenshot(path=path, full_page=True)
    print(f"  [截图] {path}")
    return path

def report(test_name, passed, detail=""):
    status = "✅ 通过" if passed else "❌ 失败"
    results.append((test_name, passed, detail))
    print(f"  [{status}] {test_name} {detail}")

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        # ================================================================
        # 1. 首页验证
        # ================================================================
        print("\n" + "=" * 60)
        print("【验证1】首页展示")
        print("=" * 60)

        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(1000)

        # Check header
        header = page.locator("header")
        report("页面头部存在", header.count() > 0)

        # Check "招标投标信息平台" heading
        h1 = page.locator("h1")
        h1_text = h1.first.text_content()
        report("首页标题", "招标投标" in h1_text, f"标题文本: {h1_text}")

        # Check right sidebar "最新公告"
        announcement_section = page.locator("text=最新公告")
        report("右侧「最新公告」栏", announcement_section.count() > 0,
               f"找到 {announcement_section.count()} 个")

        # Check "快捷入口"
        quick_links = page.locator("text=快捷入口")
        report("右侧「快捷入口」栏", quick_links.count() > 0)

        # Check tender cards - look for cards with links to /tender/
        tender_links = page.locator('a[href*="/tender/"]')
        report("招标卡片存在", tender_links.count() >= 3,
               f"找到 {tender_links.count()} 个招标链接")

        screenshot(page, "01_homepage.png")

        # ================================================================
        # 2. zhaobiao 登录 → 招标管理
        # ================================================================
        print("\n" + "=" * 60)
        print("【验证2】zhaobiao 登录 → 招标管理")
        print("=" * 60)

        # Navigate to login
        page.goto(BASE_URL + "login")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Fill login form
        page.fill('input[type="text"]', "zhaobiao")
        page.fill('input[type="password"]', "123456")
        page.click('button:has-text("登录")')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Verify login success - check header for user info
        company_info = page.locator("header").text_content()
        report("zhaobiao 登录成功", "华夏建设" in company_info,
               f"Header内容包含: {company_info[:80]}")

        # Navigate to 招标管理
        nav_link = page.locator('a:has-text("招标管理")')
        if nav_link.count() > 0:
            nav_link.first.click()
        else:
            page.goto(BASE_URL + "owner-dashboard")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Verify "招标管理" title
        dashboard_h1 = page.locator("h1").first.text_content()
        report("招标管理页面标题", "招标管理" in dashboard_h1,
               f"标题: {dashboard_h1}")

        # Check for advance buttons
        advance_btns = page.locator('button:has-text("进入下一阶段")')
        candidate_btns = page.locator('button:has-text("确认定标")')
        total_advance = advance_btns.count() + candidate_btns.count()
        report("流程推进按钮存在", total_advance > 0,
               f"「进入下一阶段」{advance_btns.count()}个 + 「确认定标」{candidate_btns.count()}个")

        # Check for "编辑" button
        edit_btns = page.locator('button:has-text("编辑")')
        report("编辑按钮存在", edit_btns.count() > 0)

        # Check for "查看投标" button
        view_bids = page.locator('button:has-text("查看投标")')
        report("查看投标按钮存在", view_bids.count() > 0)

        screenshot(page, "02_owner_dashboard.png")

        # Logout
        logout_btn = page.locator('button:has-text("退出")')
        if logout_btn.count() > 0:
            logout_btn.first.click()
            page.wait_for_timeout(500)

        # ================================================================
        # 3. toubiao 登录 → 投标
        # ================================================================
        print("\n" + "=" * 60)
        print("【验证3】toubiao 登录 → 两步投标流程")
        print("=" * 60)

        # Navigate to login
        page.goto(BASE_URL + "login")
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Fill login form
        page.fill('input[type="text"]', "toubiao")
        page.fill('input[type="password"]', "123456")
        page.click('button:has-text("登录")')
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Verify login success
        company_info = page.locator("header").text_content()
        report("toubiao 登录成功", "东方智能" in company_info,
               f"Header内容: {company_info[:80]}")

        # Go to homepage to find a biddable tender
        page.goto(BASE_URL)
        page.wait_for_load_state("networkidle")
        page.wait_for_timeout(500)

        # Find a tender that toubiao hasn't bid on yet
        # Iterate through tender detail pages, find one with "我要投标" button
        found_biddable = False

        # First collect all unique tender links from the page
        tender_hrefs = set()
        all_links = page.locator('a[href*="/tender/"]').all()
        for link in all_links:
            href = link.get_attribute("href")
            if href and "/tender/" in href:
                tender_hrefs.add(href)
        print(f"  首页找到 {len(tender_hrefs)} 个唯一招标链接: {tender_hrefs}")

        for href in tender_hrefs:
            target_url = href if href.startswith("http") else f"http://localhost:4174{href}"
            print(f"  访问: {target_url}")
            page.goto(target_url)
            page.wait_for_load_state("networkidle")
            page.wait_for_timeout(500)

            # Check if this tender is in a biddable stage and toubiao hasn't bid
            bid_btn = page.locator('button:has-text("我要投标")')
            already_bid = page.locator('text=您已投标')
            page_title = page.locator("h1").first.text_content() if page.locator("h1").count() > 0 else ""

            print(f"    页面: {page_title}, 我要投标={bid_btn.count()}, 已投标={already_bid.count()}")

            if bid_btn.count() > 0:
                found_biddable = True
                print(f"  找到可投标项目: {page_title}")
                report("找到可投标项目", True, f"项目: {page_title}")

                # Click "我要投标"
                bid_btn.first.click()
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(500)

                # ---- Step 1: 投标报名 ----
                step1_title = page.locator("text=第一步：投标报名")
                report("第一步：投标报名页面", step1_title.count() > 0)

                screenshot(page, "03_bid_step1_register.png")

                # Fill step 1 - use first available inputs
                inputs = page.locator("input").all()
                print(f"    第一步表单 inputs: {len(inputs)}")
                # companyName is first input with name attribute
                company_input = page.locator('input[name="companyName"]')
                contact_name = page.locator('input[name="contactName"]')
                contact_phone = page.locator('input[name="contactPhone"]')
                if company_input.count() > 0:
                    company_input.fill("东方智能科技有限公司")
                if contact_name.count() > 0:
                    contact_name.fill("陈经理")
                if contact_phone.count() > 0:
                    contact_phone.fill("15000150000")

                # Check deposit checkbox if exists
                checkbox = page.locator('input[type="checkbox"]')
                if checkbox.count() > 0:
                    checkbox.first.check()

                # Click "确认报名，进入下一步"
                next_btn = page.locator('button:has-text("确认报名，进入下一步")')
                if next_btn.count() > 0:
                    next_btn.first.click()
                page.wait_for_timeout(500)

                # ---- Step 2: 递交投标文件 ----
                step2_title = page.locator("text=第二步：递交投标文件")
                report("第二步：递交投标文件页面", step2_title.count() > 0)

                screenshot(page, "04_bid_step2_submit.png")

                # Fill step 2
                price_input = page.locator('input[name="price"]')
                commercial = page.locator('textarea[name="commercialDoc"]')
                tech = page.locator('textarea[name="techProposal"]')
                if price_input.count() > 0:
                    price_input.fill("2250000")
                if commercial.count() > 0:
                    commercial.fill("付款方式：合同签订后支付30%预付款，安装验收后支付60%，质保期满支付10%余款。质保期3年。")
                if tech.count() > 0:
                    tech.fill("本公司拥有丰富的中央空调安装经验，已完成50+类似规模项目。采用国内外知名品牌设备，提供3年免费维护服务。项目工期：90天，含设备采购、安装调试全流程。")

                screenshot(page, "05_bid_step2_filled.png")

                # Submit
                submit_btn = page.locator('button:has-text("提交投标")')
                if submit_btn.count() > 0:
                    submit_btn.first.click()
                page.wait_for_load_state("networkidle")
                page.wait_for_timeout(800)

                # Verify redirected to bidder dashboard
                current_url = page.url
                report("投标提交后跳转到我的投标", "bidder-dashboard" in current_url,
                       f"当前URL: {current_url}")

                screenshot(page, "06_bid_submitted_result.png")
                break

        if not found_biddable:
            report("找到可投标项目", False, f"遍历了 {len(tender_hrefs)} 个招标链接均不可投标")

        # ================================================================
        # Final summary
        # ================================================================
        browser.close()

    print("\n" + "=" * 60)
    print("【验证结果汇总】")
    print("=" * 60)
    passed_count = sum(1 for _, p, _ in results if p)
    total_count = len(results)
    for name, passed, detail in results:
        status = "✅" if passed else "❌"
        print(f"  {status} {name}" + (f" — {detail}" if detail else ""))
    print(f"\n总计: {passed_count}/{total_count} 通过")
    return passed_count == total_count

if __name__ == "__main__":
    success = run()
    sys.exit(0 if success else 1)
