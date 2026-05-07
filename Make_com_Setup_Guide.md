# Make.com Setup Guide
## Connecting ElevenLabs → Google Calendar + Twilio SMS

---

## OVERVIEW

You'll build three separate Make.com Scenarios:

| Scenario | What it does |
|---|---|
| **1. Check Availability** | ElevenLabs asks "what slots are open?" → Make.com checks Google Calendar → returns available times |
| **2. Book Appointment** | ElevenLabs sends caller info + chosen time → Make.com creates the Google Calendar event |
| **3. Post-Call SMS** | Call ends → ElevenLabs fires a webhook → Make.com tells Twilio to send a follow-up text |

---

## PART 1 — MAKE.COM ACCOUNT SETUP

1. Go to [make.com](https://make.com) and create a free account
2. Once inside, you'll land on the **Dashboard**
3. In the left sidebar, click **Scenarios**
4. You'll build each of the three scenarios below one at a time

---

## PART 2 — CONNECT GOOGLE CALENDAR

Do this once before building any scenarios — it saves time.

1. In Make.com, click your **profile icon** (bottom left) → **Connections**
2. Click **Create a connection**
3. Search for **Google Calendar**
4. Click it and sign in with the Google account that owns the booking calendar
5. Grant the requested permissions
6. Name the connection (e.g., "Client Booking Calendar") and save

---

## PART 3 — CONNECT TWILIO

1. Go back to **Connections** → **Create a connection**
2. Search for **Twilio**
3. You'll need your Twilio **Account SID** and **Auth Token** — find these in your Twilio console at [console.twilio.com](https://console.twilio.com) under Account Info
4. Paste them in and save the connection

---

## PART 4 — SCENARIO 1: CHECK AVAILABILITY

**Goal:** ElevenLabs calls this webhook mid-conversation to find open appointment slots.

### Step 1 — Create the Scenario
1. Click **Create a new scenario**
2. Click the **+** circle in the center of the canvas
3. Search for **Webhooks** → select **Custom Webhook**
4. Click **Add** → name it "Check Availability" → click **Save**
5. Copy the **webhook URL** shown — you'll paste this into ElevenLabs later
6. Click **OK**

### Step 2 — Add Google Calendar: List Events
1. Click the **+** to the right of the Webhook module
2. Search **Google Calendar** → select **List Events**
3. Select your connected Google account
4. Set **Calendar ID** to the calendar you want to book on
5. Set **Time Min** to `{{now}}` (current time — Make.com will autocomplete this)
6. Set **Time Max** to `{{addDays(now, 7)}}` (look 7 days ahead)
7. Set **Max Results** to `10`
8. Click **OK**

### Step 3 — Add Webhook Response
1. Click **+** after the Google Calendar module
2. Search **Webhooks** → select **Webhook Response**
3. In the **Body** field, build a JSON response like this:

```json
{
  "available_slots": [
    "Tuesday May 6 at 10am",
    "Tuesday May 6 at 2pm",
    "Wednesday May 7 at 11am"
  ]
}
```

> **Note:** For now you can hardcode 2–3 test slots here to get the demo working. Later you can use Make.com's built-in tools to dynamically calculate free slots based on existing events.

4. Set **Status** to `200`
5. Click **OK**

### Step 4 — Activate the Scenario
1. At the bottom of the screen, toggle the scenario **ON** (blue)
2. Click **Save** (floppy disk icon, top right)

---

## PART 5 — SCENARIO 2: BOOK APPOINTMENT

**Goal:** ElevenLabs sends caller info + chosen time slot → Make.com creates the event in Google Calendar.

### Step 1 — Create the Scenario
1. Click **Create a new scenario**
2. Add a **Custom Webhook** module
3. Click **Add** → name it "Book Appointment" → **Save**
4. Copy the **webhook URL** — you'll need this for ElevenLabs
5. Click **OK**

### Step 2 — Add Google Calendar: Create an Event
1. Click **+** → search **Google Calendar** → select **Create an Event**
2. Select your Google Calendar connection
3. Set **Calendar ID** to your booking calendar
4. Fill in the fields using data from the webhook:
   - **Summary:** `Estimate — {{1.name}}` (caller's name from webhook data)
   - **Description:** `Phone: {{1.phone}} | Email: {{1.email}} | Address: {{1.address}} | Notes: {{1.notes}}`
   - **Start Date/Time:** `{{1.datetime}}` (the chosen slot sent by ElevenLabs)
   - **End Date/Time:** `{{addMinutes(1.datetime, 60)}}` (1-hour block)
5. Click **OK**

### Step 3 — Add Webhook Response
1. Add a **Webhook Response** module
2. Body:
```json
{
  "status": "confirmed",
  "message": "Appointment booked successfully"
}
```
3. Status: `200`
4. Save and toggle the scenario **ON**

---

## PART 6 — SCENARIO 3: POST-CALL SMS (via Twilio)

**Goal:** When a call ends, ElevenLabs fires a webhook → Make.com sends a text to the caller.

### Step 1 — Create the Scenario
1. Create a new scenario
2. Add a **Custom Webhook** module → name it "Post Call SMS" → Save
3. Copy the **webhook URL**

### Step 2 — Add Twilio: Send SMS
1. Click **+** → search **Twilio** → select **Send a Message**
2. Select your Twilio connection
3. Fill in:
   - **From:** your Twilio phone number (e.g., +15551234567)
   - **To:** `{{1.caller_phone}}` (caller's number from the webhook)
   - **Body:** customize based on outcome:

**If they booked an appointment:**
```
Hi {{1.name}}, thanks for calling [COMPANY NAME]! Your free estimate is confirmed for {{1.appointment_time}}. We'll see you at {{1.address}}. Questions? Call us at [YOUR NUMBER].
```

**If they didn't book (lead only):**
```
Hi {{1.name}}, thanks for reaching out to [COMPANY NAME]! We'd love to get you a free estimate. Book a time here: [CALENDLY OR BOOKING LINK] or reply to this message.
```

4. Click **OK**

### Step 3 — Save and Activate
1. Save and toggle **ON**

---

## PART 7 — CONNECT WEBHOOKS TO ELEVENLABS

Now that your Make.com scenarios are live, connect them to your ElevenLabs agent.

### For Check Availability + Book Appointment (Tools):

1. Open your agent in ElevenLabs
2. Go to **Tools** tab
3. Click **Add Tool** → select **Webhook**
4. Fill in:
   - **Name:** `check_availability`
   - **Description:** "Check Google Calendar for available appointment slots this week"
   - **URL:** paste your Scenario 1 webhook URL
   - **Method:** POST
5. Define the **input parameters** the agent will send:
   - `date_preference` (string) — e.g., "this week" or "Tuesday"
6. Define the **output** — the agent will receive `available_slots` array
7. Save

Repeat for **Book Appointment**:
- **Name:** `book_appointment`
- **URL:** paste your Scenario 2 webhook URL
- **Input parameters:** `name`, `phone`, `email`, `address`, `datetime`, `notes`
- **Output:** `status`, `message`

### For Post-Call SMS (Post-Call Webhook):

1. In ElevenLabs, go to your agent → **Settings** or **Advanced**
2. Find **Post-Call Webhook**
3. Paste your Scenario 3 webhook URL
4. ElevenLabs will automatically send call summary data (caller number, transcript summary, etc.) to this URL when each call ends

---

## PART 8 — UPDATE YOUR AGENT PROMPT

Add these lines to your ElevenLabs system prompt so the agent knows when to use the tools:

```
SCHEDULING TOOLS:
When a caller wants to schedule an appointment or estimate, use the check_availability tool to retrieve open slots for this week and next. Present the caller with 2–3 options. Once they choose a time, use the book_appointment tool to confirm the booking. Always collect their full name, phone number, email address, and property/business address before booking.

After booking, tell the caller: "Perfect — you're all set. You'll receive a confirmation text shortly with all the details."
```

---

## PART 9 — TESTING CHECKLIST

Before going live with your client, run through each scenario:

- [ ] Call the ElevenLabs number and ask to book an appointment
- [ ] Confirm the agent calls `check_availability` and offers time slots
- [ ] Confirm the agent calls `book_appointment` after you select a time
- [ ] Check the Google Calendar — does the event appear with the right info?
- [ ] Check your phone — did the confirmation SMS arrive?
- [ ] Test the "lead only" path (hang up without booking) — did the follow-up SMS arrive?
- [ ] Check Make.com scenario history for any errors (each scenario shows a run log)

---

## TROUBLESHOOTING

| Problem | Fix |
|---|---|
| Webhook not triggering | Make sure the scenario is toggled ON and the URL is correctly pasted in ElevenLabs |
| Google Calendar not connecting | Re-authorize the Google connection in Make.com → Connections |
| SMS not sending | Check Twilio account has a positive balance and the From number is SMS-capable |
| Agent not using tools | Check tool name/description in ElevenLabs and make sure the prompt tells the agent when to use them |
| Make.com showing errors | Click the scenario run history and expand the failed module to see the exact error |

---

*Part of the Phone Attendant Project — Make.com Integration Guide*
