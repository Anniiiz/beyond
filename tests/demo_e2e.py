"""
End-to-end check of the Beyond three-step flow (webapp-testing skill pattern).

Usage (dev server running on :5173):
    python tests/demo_e2e.py [screenshot_dir]

Refine the job posting -> apply with motivation + pre-task -> choose who to invite.
Fails on console errors or horizontal overflow, at desktop and mobile sizes.
"""
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

URL = "http://localhost:5173/"
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else "test-screenshots")
OUT.mkdir(parents=True, exist_ok=True)
failures: list[str] = []


def check(cond, msg):
    print(("  ok   " if cond else "  FAIL ") + msg)
    if not cond:
        failures.append(msg)


def no_overflow(page, label):
    sw = page.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    check(sw <= 0, f"{label}: no horizontal overflow ({sw}px)")


def shot(page, name):
    page.wait_for_timeout(350)
    page.screenshot(path=str(OUT / f"{name}.png"), full_page=True)


def run(p, viewport, tag):
    print(f"\n== {tag} {viewport['width']}x{viewport['height']} ==")
    browser = p.chromium.launch(headless=True)
    page = browser.new_context(viewport=viewport).new_page()
    errors: list[str] = []
    page.on("console", lambda m: errors.append(m.text) if m.type == "error" else None)
    page.on("pageerror", lambda e: errors.append(str(e)))

    page.goto(URL)
    page.wait_for_load_state("networkidle")
    page.evaluate("sessionStorage.clear(); location.hash = '#programme'")
    page.reload()
    page.wait_for_load_state("networkidle")

    # 0a. Programme application (participant)
    expect(page.get_by_role("heading", level=1)).to_have_text("Join an event")
    check(page.get_by_role("button", name="Join:", exact=False).count() == 4, "four events listed")
    page.get_by_role("button", name="Join: Employer Meetup: Earthworks (Työnantajatreffit)").click()
    check(page.get_by_text("Which employers would you like to talk to?").count() == 1, "event-specific questions appear")
    page.get_by_role("button", name="All events").click()
    page.get_by_role("button", name="Join: TalentMatch Espoo").click()
    expect(page.get_by_role("heading", level=1)).to_have_text("TalentMatch Espoo")
    send_prog = page.get_by_role("button", name="Send application")
    check(send_prog.is_disabled(), "programme application needs home and route")
    page.get_by_text("Espoo", exact=True).click()
    page.get_by_role("button", name="Fill from LinkedIn").click()
    page.get_by_role("button", name="Use example profile").click()
    page.get_by_role("button", name="Import").click()
    # Live AI: accept success, or the graceful error if Gemini is briefly unavailable (then fill by hand).
    outcome = page.get_by_text("Imported", exact=False).or_(page.get_by_text("Couldn't read that profile"))
    expect(outcome.first).to_be_visible(timeout=40000)
    if page.get_by_text("Couldn't read that profile").count():
        print("  note LinkedIn import fell back to manual entry (AI unavailable)")
        page.get_by_role("button", name="Cancel").click()
        page.locator("#role-0").fill("Front desk associate")
        page.locator("#learning").fill("Customer success course and AI tools.")
    check("Front" in page.locator("#role-0").input_value() and page.locator("#learning").input_value() != "",
          "LinkedIn import (or manual fallback) fills the route")
    page.get_by_role("button", name="Customer success", exact=True).click()
    page.locator("#q-hope").fill("Move into a tech company.")
    no_overflow(page, "programme"); shot(page, f"{tag}-0a-programme")
    check(send_prog.is_disabled(), "a path is required to send")
    page.get_by_role("button", name="Previous experience Your route so far counts").click()
    page.get_by_role("button", name="Event assignment", exact=False).click()
    check(page.get_by_text("Record a 2-minute video", exact=False).count() == 1, "event assignment shows the task")
    page.locator("#assign-link").fill("https://vimeo.com/kimi-muusi/answer")
    page.locator("#link-0").fill("https://www.linkedin.com/in/kimi-muusi")
    page.locator("#evidence-files").set_input_files(files=[{"name": "certificate.txt", "mimeType": "text/plain",
        "buffer": b"Certificate of completion. Kimi Muusi completed Customer Success Fundamentals, March 2025."}])
    expect(page.get_by_text("certificate.txt")).to_be_visible()
    send_prog.click()
    page.get_by_role("button", name="See it as the Espoo team").click()

    # 0b. Espoo review (team): list -> detail with AI background check -> accept/decline moves on
    expect(page).to_have_url(URL + "#admit")
    cont = page.get_by_role("button", name="Continue to matchmaking")
    check(cont.is_disabled(), "continue needs at least one person accepted")
    page.get_by_role("button", name="Open application: Kimi Muusi").click()
    expect(page.get_by_text("Reading the application, files and links…")).to_have_count(0, timeout=60000)
    check(page.get_by_text("Move into a tech company.").count() == 1, "detail shows the event answers")
    check(page.get_by_text("Could not verify").count() + page.get_by_text("Verified", exact=True).count() >= 1,
          "background check lists verified or unverified evidence")
    no_overflow(page, "admit-detail"); shot(page, f"{tag}-0b-admit-detail")
    page.get_by_role("button", name="Accept Kimi Muusi").click()
    expect(page.get_by_role("heading", name="Priya Nair")).to_be_visible()
    check(True, "accept moves to the next applicant")
    page.get_by_role("button", name="Decline Priya Nair").click()
    expect(page.get_by_role("heading", name="Amira Haddad")).to_be_visible()
    page.get_by_role("button", name="All applications").click()
    expect(page.get_by_text("1 accepted")).to_be_visible()
    no_overflow(page, "admit"); shot(page, f"{tag}-0c-admit-list")
    cont.click()

    # 1. Refine: guided questions + required qualifications
    expect(page.get_by_role("heading", level=1)).to_have_text("Refine the job posting")
    publish = page.get_by_role("button", name="Publish")
    check(publish.is_disabled(), "publish disabled until question 1 is answered")
    page.locator("#challenge").fill("New customers get started on their own and see value within a week.")
    for w in ["Talk to customers", "Investigate problems", "Test improvements", "Analyse feedback", "Create useful resources"]:
        page.get_by_role("button", name=w, exact=True).click()
    check(page.get_by_role("button", name="Collaborate across teams", exact=True).is_disabled(), "work capped at five")
    for st in ["Understand people's needs", "Ask insightful questions", "Communicate clearly", "Learn independently"]:
        page.get_by_role("button", name=st, exact=True).click()
    check(page.get_by_role("button", name="Take initiative", exact=True).is_disabled(), "abilities capped at four")
    page.get_by_role("button", name="Our product or service", exact=True).click()
    page.get_by_role("button", name="Mentoring", exact=True).click()
    page.get_by_role("button", name="Driving licence (B)").click()
    page.locator("#add-qualifications").fill("Forklift licence")
    page.get_by_role("button", name="Add a requirement").click()
    page.get_by_label("Forklift licence").fill("Moving stock in the warehouse.")
    page.get_by_role("button", name="A frustrated new customer").click()
    preview = page.locator("aside")
    check(preview.get_by_text("Forklift licence").count() == 1 and preview.get_by_text("Driving licence (B)").count() == 1,
          "required qualifications appear in the posting")
    check(preview.get_by_text("Moving stock in the warehouse.").count() == 1, "reason shows on the card")
    check(preview.get_by_text("What you can learn").count() == 1, "learning section on the card")
    no_overflow(page, "refine"); shot(page, f"{tag}-1-refine")
    publish.click()

    # 2. Apply: job board with filters, then the application
    expect(page).to_have_url(URL + "#apply")
    expect(page.get_by_role("heading", level=1)).to_have_text("Find a job")
    rows = page.locator("main ul.divide-y > li")
    check(rows.count() == 6, f"board lists 6 jobs ({rows.count()})")
    page.get_by_role("group", name="Filter by field").get_by_role("button", name="Operations").click()
    check(rows.count() == 2, "field filter narrows to Operations")
    page.get_by_role("group", name="Filter by field").get_by_role("button", name="All").click()
    page.get_by_label("No formal requirements").check()
    check(rows.count() == 2, "no-requirements filter")
    page.get_by_label("No formal requirements").uncheck()
    page.get_by_role("searchbox", name="Search jobs").fill("kitchen")
    check(rows.count() == 1, "search filter")
    page.get_by_role("searchbox", name="Search jobs").fill("")
    no_overflow(page, "board"); shot(page, f"{tag}-2a-board")
    page.get_by_role("button", name="Apply: Customer Success Specialist").click()
    check(page.get_by_text("Forklift licence").count() == 1, "candidate sees required qualifications")
    check(page.get_by_role("heading", name="A frustrated new customer").count() == 1, "company's pre-task reaches the applicant")
    page.get_by_role("button", name="Send application").click()
    expect(page.locator("#motivation")).to_have_attribute("aria-invalid", "true")
    page.locator("#motivation").fill("I want this job because I love fixing confusing first experiences for people.")
    page.get_by_role("button", name="Use example").nth(1).click()
    check(len(page.locator("#pretask").input_value()) > 40, "pre-task example fills the answer")
    no_overflow(page, "apply"); shot(page, f"{tag}-3-apply")
    page.get_by_role("button", name="Send application").click()
    expect(page.get_by_text("Application sent")).to_be_visible()
    page.get_by_role("button", name="See it as the company").click()

    # 4. Choose, with background checks
    expect(page).to_have_url(URL + "#choose")
    check(page.get_by_text("I love fixing confusing first experiences").count() == 1, "candidate's own answer appears")
    send = page.get_by_role("button", name="Send invitations")
    check(send.is_disabled(), "send disabled until someone is invited")
    expect(page.get_by_text("Background check")).to_have_count(5)
    expect(page.get_by_text("Summarising their background…")).to_have_count(0, timeout=30000)
    page.get_by_role("button", name="Invite Kimi Muusi").click()
    page.get_by_role("button", name="Invite Priya Nair").click()
    page.get_by_role("button", name="Not now: Jonas Lehto").click()
    page.get_by_role("button", name="Undo decision for Jonas Lehto").click()
    expect(page.get_by_text("2 invited")).to_be_visible()
    no_overflow(page, "choose"); shot(page, f"{tag}-4-choose")
    send.click()

    # 4. Meet: 8-minute chats, scales, notes
    expect(page).to_have_url(URL + "#meet")
    expect(page.get_by_role("heading", level=1)).to_have_text("8-minute chats")
    check(page.get_by_text("2 people invited").count() == 1, "meet lists the invited people")
    page.get_by_role("button", name="Start chat").click()
    page.wait_for_timeout(1300)
    t = page.get_by_role("timer").inner_text()
    check(t in ("07:59", "07:58"), f"chat timer counts down ({t})")
    page.get_by_role("button", name="Pause").click()
    for sc in ["Understood the problem", "Explained their thinking"]:
        page.get_by_role("group", name=sc).get_by_text("3", exact=True).click()
    page.get_by_role("group", name="Adapted to new information").get_by_text("Not observed").click()
    page.locator("#notes").fill("Asked which customers drop off first.")
    no_overflow(page, "meet"); shot(page, f"{tag}-5-meet")
    page.get_by_role("button", name="Save").click()
    check(page.get_by_role("heading", name="Priya Nair").count() == 1, "save moves to the next person")
    check(page.get_by_label("Rated").count() == 1, "first person marked rated")

    # Navigation: header steps, back button, start over
    page.get_by_role("navigation", name="Steps").get_by_role("button", name="Refine the job").click()
    check(page.url.endswith("#refine"), "header step navigation")
    page.go_back(); page.wait_for_timeout(200)
    check(page.url.endswith("#meet"), "browser back restores step")
    page.get_by_role("button", name="Beyond, start over").click()
    page.wait_for_timeout(200)
    check(page.url.endswith("#programme") and page.get_by_role("heading", name="Join an event").count() == 1, "start over resets")

    # Demo autofill on every step
    page.get_by_role("button", name="Fill automatically").click()
    page.get_by_role("button", name="Send application").click()
    page.get_by_role("button", name="See it as the Espoo team").click()
    page.get_by_role("button", name="Fill automatically").click()
    expect(page.get_by_text("3 accepted")).to_be_visible()
    page.get_by_role("button", name="Continue to matchmaking").click()
    page.get_by_role("button", name="Fill automatically").click()
    check(page.get_by_role("button", name="Publish").is_enabled(), "fill automatically completes step 1")
    page.get_by_role("button", name="Publish").click()
    page.get_by_role("button", name="Fill automatically").click()
    check(len(page.locator("#motivation").input_value()) > 200 and len(page.locator("#pretask").input_value()) > 40,
          "fill automatically completes the application")
    page.get_by_role("button", name="Send application").click()
    page.get_by_role("button", name="See it as the company").click()
    page.get_by_role("button", name="Fill automatically").click()
    expect(page.get_by_text("2 invited")).to_be_visible()
    page.get_by_role("button", name="Send invitations").click()
    page.get_by_role("button", name="Fill automatically").click()
    check(page.get_by_label("Rated").count() == 2, "fill automatically rates everyone")

    check(not errors, f"no console errors ({errors[:3]})")
    browser.close()


with sync_playwright() as p:
    run(p, {"width": 1440, "height": 900}, "desktop")
    run(p, {"width": 375, "height": 812}, "mobile")

print(f"\n{'ALL PASSED' if not failures else f'{len(failures)} FAILED'} · screenshots in {OUT}")
sys.exit(1 if failures else 0)
