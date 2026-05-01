# Jenga Systems — Outreach Scripts

> **The offer:** Free website build. Just Ksh 2,000/month for hosting + maintenance. Site live in 48 hours.
> **The goal:** Not to sell the website on the first message. Just get them on a 10-minute WhatsApp call.
> **The hook:** You already built a demo for them. They just need to see it.

---

## WhatsApp Flow (Primary Channel)

### Before You Send Anything
1. Check the lead's Google Maps listing — get their name if listed in reviews
2. Note their rating, review count, and website situation
3. Generate their demo URL: `node index.js --gen --limit 1`
4. Make sure they have a phone number — if not, skip

---

## The Initial Message (Step 1)
*Generated automatically by the CLI — run `node index.js --gen`*

The message is already personalized. The key components:
- Opens with their Google rating as social proof (you did your homework)
- Names the specific problem (no website / bad website)
- Demo link is the hook — you already built something for them
- Keeps it short — one problem, one link, one ask
- Ends with a name and a company (not anonymous spam)

**After sending:** Run `node index.js --sent <ID>` to log it.

---

## When They Reply

**If they say "what is this?" or "who are you?"**
> Hey [name], I build websites for gyms around Nairobi. Came across yours on Google Maps, noticed [specific issue]. Took 20 minutes to put together a quick demo to show you what's possible — figured it was easier than trying to explain it. What do you think of it?

**If they say "how much?"**
> Free to build. Just Ksh 2,000/month for hosting and maintenance — I handle everything, you just send me your photos and info. If it doesn't bring you at least one new member a month, it's probably not worth it — but in my experience it usually brings 3-5.

**If they say "I already have a website"**
> Yeah I saw it — [specific issue, e.g., "doesn't load properly on phones" / "it's a basic Wix site"]. Most people searching for a gym in [area] are on their phones. Worth a quick call to show you what the difference looks like?

**If they say "I'm not interested"**
> Totally fair — no pressure. If you ever want to revisit, you know where to find me. Good luck with the gym!
*(Don't push. Move on. Come back in 2 weeks with a case study.)*

**If they say "call me"**
> *Book a specific time immediately. Don't leave it open-ended.*
> "How's [specific time today]? I also have [tomorrow time] — what works better?"

---

## The Demo Call Script (10-15 minutes)

*This is what you say once they're on a WhatsApp video call or Google Meet.*

### Opening (30 seconds)
> "Hey [name], good to connect! I'll keep this quick — I know you're busy running a gym. I just wanted to show you the demo I put together, get your thoughts, and you can tell me straight up if it's something you'd want."

### Show the Demo (3-4 minutes)
- Screen share `demo.jengasystems.online?gym=[name]&area=[area]`
- Walk through each section:
  - "This is the hero — your gym name, tagline, and a 'Book a Free Trial' button"
  - "This is the classes section — you'd fill in your actual schedule"
  - "This is where your Google reviews pull in — builds trust for new members"
  - "This is the contact form — leads go straight to your WhatsApp"
- **Don't read everything. Just scroll slowly and let them look.**

### The Ask (30 seconds)
> "So — what do you think? Can you see this working for [gym name]?"

*Wait for them to respond. Don't fill the silence.*

### If they like it — close
> "Great. All I need from you is to fill a quick form with your photos, logo, and basic info. I handle everything from there — site's live in 48 hours. It's Ksh 2,000 a month — no contract, cancel anytime. Want me to send you the form now?"

*→ Send them: `jengasystems.online/onboarding`*

### If they ask for time
> "No problem — I'll keep the demo live. Have a look whenever you're ready and WhatsApp me. Just so you know, slots are limited since I only take on a few gyms at a time in each area."

### Objection: "It's too expensive"
> "Let me ask you — what's your average membership fee? ...
> So if the site brings you just one new member, that's [their fee] a month for a Ksh 2,000 investment. That's a [X]x return on the first member alone. Every member after that is pure profit.
> If I can't get you at least one new member a month, I'll probably just go walk into traffic. 😄"

### Objection: "We already get enough members"
> "That's great — means you're doing something right. A website won't replace what you're already doing, it'll just capture the overflow. People in [area] are searching for gyms right now on Google. Right now they're finding your competitors. This just makes sure they find you too."

### Objection: "I need to think about it"
> "Of course. What specific part isn't clear? I'd rather answer your questions now than have you sitting on it."
*(Try to surface the real objection. If they genuinely need time, set a specific follow-up time: "I'll WhatsApp you Thursday?")*

---

## After-Call Message
*Send this immediately after hanging up — while you're still top of mind.*

> Hey [name], great chatting! Here's the demo again: [demo URL]
>
> When you're ready to go live, just fill this in — takes about 5 minutes:
> 👉 jengasystems.online/onboarding
>
> Looking forward to getting [gym name] online!
> — Anthony

---

## Follow-Up Sequence (If No Reply)

| Step | Day  | What to send |
|------|------|-------------|
| 1    | 0    | Initial message + demo link |
| 2    | +3   | Soft nudge — re-share demo link |
| 3    | +7   | ROI math — one member covers the cost |
| 4    | +14  | Case study — results from a similar gym |
| 5    | +21  | Final message — leave door open |

**After step 5 with no response** → mark as `skip` in Supabase. Move on. They know who you are — if they ever need a website they'll come back.

*Generated automatically: `node index.js --followups` shows who's due today.*

---

## Mindset Notes (from Kai Stone's playbook, adapted)

- **The goal of the first message is not to sell. It's to get a reply.**
- You already did the work (the demo). You're not asking for anything — you're showing them something you built for them.
- Most closes happen after 5-11 follow-ups. Keep going until they say no or go silent for 30+ days.
- **You are selling the outcome, not the website.** They don't care about React or Vercel. They care about more members walking through the door.
- For every 20 messages sent, expect roughly: 8 replies, 3 calls, 1-2 closes. That's not failure — that's the game.
- Every "no" gets you closer to the next "yes." Keep the volume up.

---

## ROI Math (memorize this)

| Gym membership fee | Monthly ROI if 1 new member | ROI if 3 new members |
|-------------------|----------------------------|---------------------|
| Ksh 2,500/month   | 1.25x                      | 3.75x               |
| Ksh 3,500/month   | 1.75x                      | 5.25x               |
| Ksh 5,000/month   | 2.5x                       | 7.5x                |

**Our fee: Ksh 2,000/month**

*"One new member a month and you've already made your money back — every member after that is free money."*
