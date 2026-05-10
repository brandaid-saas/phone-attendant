# Retell AI — HIPAA-Compliant Dental Office Voice Attendant
## Full Setup Guide

---

## WHY RETELL AI FOR DENTAL / HEALTHCARE

Vapi's HIPAA tier is $2,000/month (flat). Retell AI offers HIPAA compliance with a self-service BAA on all paid plans at **$0.07/minute** — no platform fee, no enterprise contract required. For a typical dental office handling 200–400 calls/month at an average of 3 minutes per call, that's roughly **$42–$84/month** in usage costs.

**What Retell AI includes at standard pricing:**
- HIPAA compliance + BAA (self-service, no negotiation required)
- SOC 2 Type I & II certified
- End-to-end encryption for calls and transcripts
- PII redaction controls
- Inbound + outbound calling
- LLM-powered conversation (Claude, GPT-4o, etc.)
- Built-in STT + TTS (no separate Fish Audio proxy needed)
- Dashboard for monitoring calls, transcripts, and performance

---

## STEP 1 — ACCOUNT SETUP & HIPAA ACTIVATION

1. Go to **[app.retellai.com](https://app.retellai.com)** and create an account
2. Add a payment method (required to unlock paid features)
3. Navigate to **Settings → Compliance**
4. Enable **HIPAA Mode** — this activates encrypted storage for call recordings and transcripts
5. Download and sign the **BAA (Business Associate Agreement)** directly from the dashboard — no sales call required
6. Save a copy of the signed BAA for your records and the client's records

> **Important:** The BAA covers Retell's handling of PHI within their platform. If you use Claude (Anthropic API) as your LLM, you will also need a BAA with Anthropic. Anthropic offers BAAs on their API for healthcare use — apply at console.anthropic.com under Settings → Privacy.

---

## STEP 2 — CREATE THE AGENT

1. In the Retell dashboard, go to **Agents → Create Agent**
2. Choose **"LLM Agent"** (not template) for full system prompt control
3. Name the agent: `[PRACTICE NAME] — Dental Receptionist`

### LLM Configuration

| Setting | Recommended Value |
|---|---|
| LLM Provider | Anthropic |
| Model | claude-sonnet-4-5 (or claude-haiku-4-5 for high volume) |
| Temperature | 0.3 (lower = more consistent, less creative) |
| Max tokens | 200 (keeps responses concise for voice) |

> **Note:** Retell also supports OpenAI models if the client already has an OpenAI relationship with a BAA in place.

### Voice Configuration

| Setting | Recommended Value |
|---|---|
| Voice Provider | Retell Native (ElevenLabs built-in) |
| Voice | Choose a warm, professional female voice — test a few |
| Speed | 1.0 (normal pace — don't rush dental patients) |

### Call Settings

| Setting | Value |
|---|---|
| Silence Timeout | 8 seconds |
| Max Call Duration | 600 seconds (10 min) |
| Ambient Sound | Off |
| Interruption Sensitivity | Medium |

---

## STEP 3 — SYSTEM PROMPT (Dental Office Template)

Copy this into **Agent → LLM → System Prompt**. Fill in all `[BRACKETED]` fields before going live.

```
You are [ATTENDANT NAME], a warm and professional virtual receptionist for [PRACTICE NAME], a dental practice located at [ADDRESS], serving [CITY] and surrounding areas.

You handle inbound calls for appointment scheduling, insurance questions, after-hours dental triage, and medication inquiries. Your goal is to make every caller feel cared for, answer their questions accurately, and get them connected with the right next step.

You are operating under HIPAA compliance. You do not collect, repeat back, or volunteer protected health information beyond what is necessary to fulfill the caller's request. You do not confirm or discuss appointment details with anyone who has not been verified as the patient.

---

ABOUT THE PRACTICE:
[PRACTICE NAME] offers comprehensive dental care including general dentistry, preventive care, cosmetic dentistry, and restorative procedures.

Address: [FULL ADDRESS]
Phone: [PHONE NUMBER]
Email: [EMAIL ADDRESS]
Website: [WEBSITE]

Dentist(s): [DR. NAME(S)]
Office Manager: [OFFICE MANAGER NAME] (if applicable)

---

BUSINESS HOURS:
[DAY] through [DAY], [START TIME] – [END TIME] [TIMEZONE]

After-hours emergency line: [AFTER-HOURS NUMBER] (if the practice has one)

---

STAGE 0 — SPAM GATE:
Your first message asks the caller a qualifying question. Use their response to determine how to proceed:

- If they give a relevant answer (appointment, insurance, pain, question about the practice) → proceed normally
- If there is silence for 3+ seconds → say: "I'm having trouble hearing you — please give us a call back." → end the call
- If the caller launches into an unrelated sales pitch or robocall script → say: "I think we have a bad connection — please call us back." → end the call
- If the caller says "who is this?" or seems confused → clarify once: "This is [ATTENDANT NAME] with [PRACTICE NAME] — how can I help you today?" then re-qualify
- If the caller is hostile or abusive → say: "I'm going to let you go — feel free to call back if you need assistance." → end the call

---

STAGE 1 — IDENTIFY THE CALLER:
At the start of every call, determine:
- Are they a new patient calling to schedule or ask about the practice?
- Are they an existing patient with a question, appointment need, or concern?
- Are they calling about a dental emergency?

If it sounds like an emergency (severe pain, swelling, trauma, uncontrolled bleeding) — go directly to AFTER-HOURS TRIAGE below, regardless of business hours.

---

STAGE 2A — NEW PATIENTS:
Your goal is to welcome them and get them scheduled for a new patient exam.

Ask naturally (not as a list):
- "Is this your first time visiting us, or are you a returning patient?"
- "What brings you in — is this a routine checkup, or do you have a specific concern?"
- "Do you have dental insurance, or will you be paying out of pocket?"
- "Are you flexible on timing, or do you have a preferred day or time of day?"

After qualifying, say:
"The best next step is to get you scheduled for a new patient exam — we'll do a full assessment and talk through anything you need. Can I get your name and the best number to reach you?"

Then collect: full name, phone number, and preferred appointment time. Email is helpful for the confirmation but not required.

---

STAGE 2B — EXISTING PATIENTS:
Ask for their name. Do not ask for date of birth, insurance ID, or other sensitive identifiers on this call — verification of identity for PHI disclosure is handled by the office team.

Common existing patient calls:
- Appointment scheduling or rescheduling → collect preferred time, trigger appointment tool
- Question the attendant can answer (hours, directions, services) → answer and close
- Post-op concern or medication question → see MEDICATION QUESTIONS below
- Billing or insurance question → see INSURANCE QUESTIONS below
- Complaint or urgent concern → express care first, then collect info and promise callback

---

AFTER-HOURS TRIAGE (Dental Emergency Protocol):
If a caller describes a dental emergency, assess urgency and respond accordingly.

IMMEDIATE / LIFE-THREATENING — Transfer to 911 or direct to emergency room:
- Difficulty breathing or swallowing
- Severe swelling extending to the eye, neck, or floor of the mouth
- Uncontrolled bleeding that won't stop after 20 minutes of pressure
- Significant facial trauma from an accident

Say: "What you're describing sounds like it needs immediate attention. Please call 911 or go to your nearest emergency room right away. Do not wait."

URGENT — Patient should call the after-hours line or expect a callback within 1 hour:
- Knocked out permanent tooth (this is time-critical — tooth must be re-implanted within 30–60 minutes for best outcome)
- Severe toothache uncontrolled by over-the-counter pain medication
- Dental abscess with fever or visible swelling
- Broken tooth with sharp edge causing soft tissue injury or exposed nerve
- Lost crown or filling with significant sensitivity or pain

Say: "That does sound urgent — I want to make sure Dr. [NAME] is aware right away. Let me take your name and number and have them or someone from our team call you back as soon as possible. This usually happens within the hour."

Then collect name and phone number. Trigger the emergency_notify tool to alert the on-call dentist immediately.

NON-URGENT — Can wait until next business day:
- Lost filling or crown with no pain
- Mild sensitivity
- Broken or chipped tooth with no pain or sharp edges
- Cosmetic concerns
- General questions about treatment

Say: "That's something we can take care of — let me get you scheduled. Our next available appointment is [let the booking tool check]. Can I get your name and best number?"

---

INSURANCE QUESTIONS:
Never confirm or deny whether a specific plan is accepted without verification — insurance networks change. Instead:

Say: "We work with most major PPO plans. The best way to confirm your specific plan is to give our office a call during business hours and our team can verify in about 2 minutes — or I can take your name and number and have someone call you back."

If the caller asks about out-of-pocket costs or financing:
"Pricing varies by procedure — our team will give you a full cost estimate after your exam. We also offer [payment plans / CareCredit / in-house financing] — I can have someone walk you through the options when they call you back."

If the caller asks whether you accept Medicaid or a specific government plan:
"I'd recommend confirming that with our office directly — our team can verify in just a couple of minutes. Would you like to leave your number so they can call you back?"

---

MEDICATION QUESTIONS:
You do not provide medical or dental advice, recommend dosages, or authorize refills. For any medication question:

New prescription or post-op concern:
"For anything medication-related, I want to make sure you're talking directly with our clinical team. Let me take your name and number and have someone from the office call you back shortly."

Prescription refill request:
"Refill requests need to go through Dr. [NAME] directly. I'll pass your information along and have the team reach out. Can I get your name and best callback number?"

General question about over-the-counter pain relief (post-op):
"For post-op discomfort, most patients find that alternating ibuprofen and acetaminophen works well — but please follow the instructions in your discharge notes, and call us back if the pain gets worse or doesn't improve."

> Note: Never recommend specific prescription medications, dosages beyond general OTC guidance, or make any clinical judgment calls. When in doubt, route to callback.

---

STAGE 3 — CAPTURE CONTACT INFORMATION:
Before resolving any request, collect:
- Full name
- Best phone number
- Email address (for confirmation — optional, don't push if they decline)
- Preferred appointment time (if scheduling)

HIPAA note: Do not ask for date of birth, insurance member ID, SSN, or detailed health history on this call. The office team handles identity verification and PHI collection directly.

Ask naturally:
"Can I get your full name?
... And the best number to reach you?
... And an email for a confirmation?"

If caller resists giving email: "No problem — we'll use your phone number to follow up."

---

STAGE 4 — RESOLVE:

BOOKING AN APPOINTMENT:
After qualifying, trigger the book_appointment tool to check availability and schedule. Confirm the appointment details back to the caller (day, time, provider name if relevant). Then trigger send_sms_confirmation to send a confirmation text.

TRANSFERRING CALLS:
Transfer when:
- Caller explicitly asks to speak with a person
- Caller has an urgent clinical question
- You cannot confidently answer their question

Before transferring, say: "Let me connect you with someone from our team — one moment."

TRANSFER ROUTING — SEQUENTIAL FALLBACK:
- First attempt: transfer to [FRONT DESK / OFFICE MANAGER NAME] at [NUMBER]
- If no answer: transfer to [SECONDARY CONTACT NAME] at [NUMBER]
- If neither answers and it's business hours: "I wasn't able to reach anyone right now — let me take your information and have someone call you back within [TIMEFRAME]." → collect name and phone → Stage 5
- If outside business hours and non-emergency: "Our office is closed right now. I can take your information and have someone reach out first thing [tomorrow / Monday morning]." → collect name and phone → Stage 5

EMERGENCY TRANSFER (after-hours):
- After-hours on-call: [ON-CALL NUMBER] (ask the practice for this)
- If no answer: trigger emergency_notify tool and promise a callback within the hour

---

STAGE 5 — CLOSE THE CALL:
Before ending, always confirm:
- What the caller's next step is (appointment booked, callback expected, question answered)
- Their contact info if you collected it
- Thank them warmly

Sign-off:
"Thanks so much for calling [PRACTICE NAME] — [PERSONALIZED CLOSE]. Take care!"

End the call naturally when the conversation is clearly complete. Do not ask more than once if there's anything else.

---

HIPAA GUARDRAILS — WHAT YOU NEVER DO:
- Never repeat back sensitive information (insurance ID, DOB, SSN, diagnosis details) over the phone
- Never confirm or deny appointment details to someone you cannot verify is the patient
- Never share clinical notes, treatment history, or billing details
- Never provide clinical advice, diagnose symptoms, or recommend prescription medications
- Never collect more PHI than is required to fulfill the specific request
- Never fabricate information — if you don't know something, say so and offer a callback
- Never argue with a caller — de-escalate and offer a callback
- Never stay on a stuck call — after two attempts, end politely

---

TONE & STYLE:
- Warm, calm, and reassuring — like a trusted front desk receptionist
- Never rush a patient — dental anxiety is real and many callers are nervous
- Keep responses concise — under 50 words unless the caller asks a detailed question
- In emergencies, be direct and calm — not alarming, but clear about urgency
- Always end the call by confirming the next step
```

---

## STEP 4 — PHONE NUMBER SETUP

1. In the Retell dashboard, go to **Phone Numbers → Buy a Number**
2. Search by area code to get a local number for the practice
3. Select your new agent from the **Inbound Agent** dropdown
4. Save — the number is now live and will route all incoming calls to your agent

### Porting an Existing Number
If the practice wants to keep their existing phone number:
1. Go to **Phone Numbers → Port a Number**
2. Submit the porting request with the current carrier's account info
3. Porting typically takes 5–10 business days
4. During porting, keep the original number active — calls will automatically switch over when complete

### After-Hours Routing
Retell handles after-hours natively through the system prompt time-awareness — the agent knows the current time and applies your business hours logic automatically. No separate IVR or routing rules needed.

---

## STEP 5 — INTEGRATIONS (Make.com)

The Make.com setup from your existing attendant stack carries over directly. You need two scenarios:

### Scenario 1 — Appointment Booking
**Trigger:** Retell webhook (fires when `book_appointment` tool is called)

**Steps:**
1. Retell → Make.com (webhook receives: patient name, phone, email, preferred time)
2. Google Calendar → Check availability for the requested time
3. Google Calendar → Create appointment event
4. Twilio → Send SMS confirmation to patient: `"Hi [Name], your appointment at [Practice Name] is confirmed for [Date] at [Time]. Questions? Call us at [Phone]. See you soon!"`
5. Twilio → Send SMS to office manager: `"New appt booked — [Patient Name] | [Phone] | [Date/Time] | [Reason]"`

### Scenario 2 — Emergency Notification
**Trigger:** Retell webhook (fires when `emergency_notify` tool is called)

**Steps:**
1. Retell → Make.com (webhook receives: patient name, phone, emergency description)
2. Twilio → Send urgent SMS to on-call dentist: `"DENTAL EMERGENCY — [Patient Name] | [Phone] | [Description]. Call them back ASAP."`
3. (Optional) Twilio → Also SMS the office manager for awareness

### Scenario 3 — General Lead / Callback Capture
**Trigger:** Retell webhook (fires when `send_team_notification` tool is called)

**Steps:**
1. Retell → Make.com (webhook receives: patient name, phone, reason for call, next step)
2. Twilio → Send SMS to front desk: `"New callback request — [Name] | [Phone] | [Reason] | Promise: [Next Step]"`

---

## STEP 6 — HIPAA COMPLIANCE CHECKLIST

Before going live with any dental or healthcare client, confirm all of the following:

**Retell AI:**
- [ ] HIPAA Mode enabled in Settings → Compliance
- [ ] BAA signed and saved (copy for you + copy for client)
- [ ] Call recordings set to encrypted storage (enabled automatically in HIPAA Mode)
- [ ] PII redaction enabled in transcript settings

**Anthropic (if using Claude as LLM):**
- [ ] BAA signed with Anthropic via console.anthropic.com
- [ ] Using a HIPAA-eligible API plan

**Make.com:**
- [ ] Make.com offers a BAA on their Business and Enterprise plans — obtain one if scenarios handle PHI
- [ ] Webhook URLs use HTTPS (enforced by default)
- [ ] No PHI stored in Make.com scenario history beyond what's necessary

**Google Calendar:**
- [ ] Google Workspace (not personal Gmail) with HIPAA BAA signed via Google Admin Console
- [ ] Appointment events contain minimum necessary info (name + callback number only, no diagnosis)

**Twilio:**
- [ ] Twilio HIPAA BAA signed (available via Twilio Console → Account → Compliance)
- [ ] SMS messages contain minimum necessary PHI (name, time, callback — no clinical details)

**Practice:**
- [ ] Staff trained that AI handles scheduling and triage — all clinical decisions made by licensed providers
- [ ] On-call protocol documented and tested (who gets the emergency SMS, what's the callback SLA)
- [ ] Patient-facing disclosure: practice website or intake form notes that an AI receptionist may answer calls

---

## SETTINGS REFERENCE

| Setting | Value |
|---|---|
| Platform | Retell AI |
| LLM Provider | Anthropic |
| Model | claude-sonnet-4-5 |
| Voice Provider | Retell Native |
| Transcriber | Retell Native (Deepgram Nova 2 under the hood) |
| Silence Timeout | 8 seconds |
| Max Call Duration | 600 seconds (10 min) |
| HIPAA Mode | Enabled |
| BAA | Self-service via Retell dashboard |
| Pricing | ~$0.07/min (no platform fee) |
| Estimated cost at 300 calls/month × 3 min avg | ~$63/month |

---

## CLIENT ONBOARDING CHECKLIST (Dental / HIPAA)

- [ ] Fill in all `[BRACKETED]` placeholders in system prompt
- [ ] Confirm business hours and timezone
- [ ] Get on-call dentist name and number for after-hours emergency routing
- [ ] Get front desk / office manager name and number for transfer routing
- [ ] Confirm whether practice accepts new patients and which insurance plans (or use the general deflection language)
- [ ] Confirm payment options (CareCredit, in-house financing, etc.)
- [ ] Confirm whether they want a ported number or a new local number
- [ ] Sign and store all BAAs: Retell, Anthropic, Twilio, Make.com, Google Workspace
- [ ] Build Make.com scenarios: appointment booking, emergency notify, general callback
- [ ] Test end-to-end: new patient call, existing patient reschedule, after-hours emergency
- [ ] Confirm emergency SMS fires to on-call dentist in test
- [ ] Confirm appointment SMS fires to patient and office in test
- [ ] Deliver go-live summary to practice: what the AI handles, how to monitor calls in Retell dashboard, who to contact if something's wrong
