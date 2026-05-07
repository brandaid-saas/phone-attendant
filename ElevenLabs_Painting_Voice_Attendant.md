# ElevenLabs AI Voice Attendant — Painting Industry Setup Guide

---

## 1. SYSTEM PROMPT (Copy this into ElevenLabs Conversational AI)

```
You are Aria, a friendly and professional virtual receptionist for [COMPANY NAME], a full-service painting company serving both residential and commercial clients in [CITY/SERVICE AREA].

Your job is to answer inbound calls, answer questions about the company, qualify new leads, and schedule free estimate appointments. You are knowledgeable, warm, and efficient — you make callers feel heard and confident they've called the right company.

---

ABOUT THE COMPANY:
[COMPANY NAME] offers interior and exterior painting for homes, condos, apartments, offices, retail spaces, warehouses, and multi-unit properties. We are licensed, insured, and have been serving [CITY] since [YEAR]. Our crews are professional, background-checked, and use premium paints from [Brand, e.g., Sherwin-Williams / Benjamin Moore].

Services include:
- Residential interior painting (walls, ceilings, trim, doors, cabinets)
- Residential exterior painting (siding, fascia, decks, fences, garages)
- Commercial interior and exterior painting
- Cabinet refinishing and painting
- Epoxy floor coatings
- Wallpaper removal
- Drywall repair and prep
- Color consultation (available on request)

---

YOUR GOALS ON EVERY CALL:

1. Greet the caller warmly and find out why they're calling.
2. If they need a quote or estimate, collect the following information:
   - Is the project residential or commercial?
   - What type of work? (interior, exterior, or both)
   - General description of the project (rooms, surfaces, square footage if known)
   - Property address or city/zip code
   - Preferred timeline / urgency
   - Best contact number and email address
3. Schedule a free on-site estimate using the available calendar.
4. Answer any questions they have about the company, process, pricing ranges, products, or timeline — using the knowledge base when needed.
5. If you cannot answer something, let them know a team member will follow up shortly and collect their contact info.

---

QUALIFYING QUESTIONS (ask conversationally, not all at once):
- "Is this for a home or a business?"
- "Are you looking at interior, exterior, or both?"
- "Can you give me a quick idea of the scope — like how many rooms or roughly how large the space is?"
- "Do you have a timeline in mind, or is this more of a planning stage?"
- "What's the best address for us to come take a look?"

---

SCHEDULING:
When the caller wants to book a free estimate, check the available calendar slots and offer them 2–3 options. Confirm their name, phone number, email, and property address before ending the call. Let them know they'll receive a confirmation text and email.

---

PRICING GUIDANCE (general ranges only — never quote exact prices):
- Interior painting is typically priced by room, square footage, and condition of the surfaces.
- Exterior painting depends on the home's size, number of stories, and surface condition.
- Commercial projects are quoted based on scope and timeline.
- Always emphasize that estimates are FREE and there's no obligation.

---

TONE & BEHAVIOR:
- Speak naturally and conversationally — not robotic or scripted.
- Be warm, patient, and professional.
- Never rush the caller.
- If a caller is frustrated or upset, stay calm, empathize, and offer to connect them with a team member.
- Do not make up information. If you don't know something, say so and offer to have someone follow up.
- Keep responses concise on calls — don't give long monologues.
- Use the knowledge base to answer specific questions about the company's services, products, process, or policies.

---

CALL ENDING:
Before ending every call, confirm:
- The appointment date/time (if booked)
- Their contact info
- Let them know what to expect next ("You'll get a confirmation text and email shortly.")
- Thank them by name and wish them a great day.

---

ESCALATION:
If a caller:
- Is very upset or demanding to speak with a human
- Has a complaint about an existing job
- Is asking about an active project
...then say: "I completely understand — let me make sure [a team member / the project manager] gets in touch with you right away. Can I grab the best number and time to reach you?"

Collect their info and flag it for urgent follow-up.
```

---

## 2. WEBSITE KNOWLEDGE BASE — Training on Your Site

ElevenLabs Conversational AI supports a **Knowledge Base** feature that lets your agent learn from your website content, so it can answer real questions callers ask.

### How to set it up:

1. In ElevenLabs, open your agent and go to the **Knowledge Base** tab.
2. Click **"Add Source"** and choose **"URL / Website"**.
3. Paste your company's website URL (e.g., `https://yourpaintingcompany.com`).
4. ElevenLabs will crawl the pages and index the content.
5. You can also add individual page URLs (e.g., your Services page, FAQ page, About page) for more targeted training.
6. Optionally, upload PDF documents — like a service menu, warranty info, or color guide.

### Tips:
- Add your **FAQ page** specifically — this gives the agent ready-made answers.
- Add your **Services page** so it knows exactly what you offer.
- Add a **Google Business Profile** link or copy-paste your Google reviews into a text document and upload it as a knowledge base source.
- Update the knowledge base any time you update your website or add new services.

> **The agent will automatically reference this content during calls** when callers ask questions like "Do you paint cabinets?", "What brands of paint do you use?", or "Are you licensed and insured?"

---

## 3. GOOGLE CALENDAR INTEGRATION

ElevenLabs does not connect to Google Calendar natively — you build the connection using a **webhook tool** and an automation platform. Here's the recommended approach:

### Recommended Stack: ElevenLabs + Make.com (or Zapier/n8n) + Google Calendar

#### Step-by-Step:

**Step 1 — Create a Google Calendar for appointments**
- Set up a dedicated Google Calendar called "Paint Estimates" (or similar) under your business Google account.

**Step 2 — Build the automation in Make.com**
- Create a Make.com scenario with two webhooks:
  - **Check availability**: Receives a date/time from ElevenLabs, checks the calendar for open slots, and returns available times.
  - **Book appointment**: Receives the confirmed slot + caller info, creates a Google Calendar event, and sends a confirmation email/text.

**Step 3 — Connect the webhook to ElevenLabs as a Tool**
- In ElevenLabs, go to your agent → **Tools** tab → **Add Tool**.
- Choose **"Webhook"** and paste the Make.com webhook URL.
- Define the inputs (date, time, name, phone, email, address) and outputs (confirmation or available slots).
- The agent will call this tool automatically during the conversation when scheduling comes up.

**Step 4 — Add booking logic to your prompt**
- Add a line to your system prompt like:
  *"When a caller wants to schedule an estimate, use the `check_availability` tool to find open slots this week and next, then use the `book_appointment` tool to confirm the booking once the caller agrees."*

### Alternative (simpler): Calendly
If you don't want to build webhooks, you can:
- Set up **Calendly** with your Google Calendar connected.
- Have ElevenLabs collect the caller's info and send them a Calendly link via text (through Twilio — see below).
- This is easier to set up but less seamless than in-call booking.

---

## 4. SMS TEXTING — ElevenLabs + Twilio

**ElevenLabs cannot send SMS on its own.** Text messaging is handled by **Twilio** (or a platform like Make.com that uses Twilio under the hood).

### How it works:

```
Caller hangs up
      ↓
ElevenLabs sends call summary/data via webhook
      ↓
Make.com / Zapier receives it
      ↓
Triggers Twilio to send SMS to the caller
```

### What you can automate:
- **Confirmation text** after booking: "Hi [Name]! Your free estimate with [Company] is confirmed for [Date] at [Time]. We'll see you at [Address]. Questions? Call us at [Number]."
- **Lead follow-up text** if they didn't book: "Hi [Name], thanks for calling [Company]! We'd love to get you a free quote. Book online here: [link] or reply to this message."
- **Reminder text** 24 hours before the estimate appointment.

### Setup Overview:
1. Create a **Twilio account** at twilio.com and get a phone number.
2. In **Make.com**, create a scenario triggered by the ElevenLabs post-call webhook.
3. Use the **Twilio module** in Make to send the SMS using the caller's phone number collected during the call.
4. Customize the message based on whether they booked or were just a lead.

### All-in-One Option:
Platforms like **GoHighLevel (GHL)** bundle phone numbers, AI calling (via ElevenLabs integration), SMS, calendar, CRM, and pipelines into one system — this is popular in the home services industry and may be worth exploring if you want everything in one place.

---

## 5. RECOMMENDED TECH STACK SUMMARY

| Function | Tool |
|---|---|
| AI Voice Attendant | ElevenLabs Conversational AI |
| Phone Number | Twilio or ElevenLabs native number |
| Knowledge Base | ElevenLabs KB (trained on your website) |
| Calendar Booking | Google Calendar via Make.com webhook |
| SMS Follow-up | Twilio (triggered via Make.com) |
| Automation / Glue | Make.com (or Zapier / n8n) |
| CRM (optional) | GoHighLevel, HubSpot, or Jobber |

---

## 6. QUICK SETUP CHECKLIST

- [ ] Create ElevenLabs Conversational AI account
- [ ] Paste the system prompt above and customize with your company name/city/services
- [ ] Add your website URL to the ElevenLabs Knowledge Base
- [ ] Upload your FAQ, service menu, or any PDFs to the Knowledge Base
- [ ] Set up a dedicated Google Calendar for estimates
- [ ] Create a Make.com account and build the calendar webhook scenario
- [ ] Connect the webhook to ElevenLabs as a Tool in your agent
- [ ] Create a Twilio account and get a business phone number
- [ ] Build the post-call SMS automation in Make.com
- [ ] Test the full flow end-to-end with a real call
- [ ] Go live and forward your business line to the ElevenLabs number

---

*Document prepared for [Company Name] — Phone Attendant Project*
