# Fish Audio + Vapi + Claude Setup Guide
## Building an AI Phone Attendant (No ElevenLabs)

---

## OVERVIEW

This guide replaces ElevenLabs Conversational AI with a three-part stack:

| Component | What it does | Service |
|---|---|---|
| **Phone + STT** | Receives calls, transcribes speech | Vapi |
| **LLM (Brain)** | Understands and responds | Claude (Anthropic) |
| **TTS (Voice)** | Speaks the response | Fish Audio |
| **Bridge** | Connects Vapi → Fish Audio | Cloudflare Worker (free) |
| **Integrations** | Calendar + SMS | Make.com (unchanged) |

**Accounts you'll need before starting:**
- [fish.audio](https://fish.audio) — for the voice
- [cloudflare.com](https://cloudflare.com) — for the free proxy (no credit card needed for basic use)
- [console.anthropic.com](https://console.anthropic.com) — for Claude API access
- [vapi.ai](https://vapi.ai) — for the phone AI platform
- [make.com](https://make.com) — already set up ✓

---

## PART 1 — FISH AUDIO SETUP

### Step 1 — Create Your Account
1. Go to [fish.audio](https://fish.audio) and sign up
2. Once logged in, click **My Models** in the top navigation

### Step 2 — Create or Clone a Voice
**Option A — Clone your own voice (recommended)**
1. Click **Create Model**
2. Select **Voice Clone**
3. Upload 30–60 seconds of clean audio — a recording of yourself or your agent speaking clearly, no background noise
4. Name the model (e.g., "Aria - Insurance Attendant")
5. Click **Train** — takes a few minutes
6. Once done, open the model and copy the **Model ID** (looks like: `a1b2c3d4e5f6...`) — you'll need this later

**Option B — Use a pre-built voice**
1. Browse the [Fish Audio model library](https://fish.audio)
2. Find a voice you like
3. Open it and copy the **Model ID**

### Step 3 — Get Your API Key
1. Click your profile icon (top right) → **API Keys**
2. Click **Create API Key**
3. Name it "Vapi Proxy" and click **Create**
4. Copy the key immediately — it won't be shown again
5. Save it somewhere safe (Notes app, password manager)

---

## PART 2 — CLOUDFLARE WORKER SETUP

This is the tiny bridge between Vapi and Fish Audio. It takes about 5 minutes to set up.

### Step 1 — Create a Cloudflare Account
1. Go to [cloudflare.com](https://cloudflare.com) and sign up (free, no credit card required for Workers)
2. Once inside, click **Workers & Pages** in the left sidebar
3. Click **Create** → **Create Worker**
4. Give it a name like `fish-audio-proxy`
5. Click **Deploy** (don't worry about the default code — you'll replace it)

### Step 2 — Paste the Worker Code
1. After deploying, click **Edit Code**
2. You'll see a code editor with some placeholder code
3. Select ALL of that placeholder code and delete it
4. Open the file **`fish-audio-proxy-worker.js`** (in your Phone Attendant project folder) and copy its entire contents
5. Paste it into the Cloudflare code editor
6. Click **Deploy** (top right)

### Step 3 — Set Environment Variables
This is how the Worker securely stores your Fish Audio credentials.

1. Go back to the Worker dashboard (click the Worker name)
2. Click **Settings** → **Variables**
3. Under **Environment Variables**, click **Add variable**
4. Add the first variable:
   - **Variable name:** `FISH_API_KEY`
   - **Value:** paste your Fish Audio API key from Part 1
   - Check **Encrypt** to keep it secure
   - Click **Save**
5. Add the second variable:
   - **Variable name:** `FISH_VOICE_ID`
   - **Value:** `933563129e564b19a115bedd57b7406a`
   - Click **Save**
6. Click **Deploy** again to apply the variables

### Step 4 — Copy Your Worker URL
1. On the Worker overview page, you'll see a URL like:
   `https://fish-audio-proxy.designshak.workers.dev/`
2. Copy this URL — you'll paste it into Vapi in Part 4

---

## PART 3 — ANTHROPIC API KEY SETUP

### Step 1 — Create Your Anthropic Account
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up or log in
3. You may need to add a credit card — Claude API usage is pay-as-you-go (very low cost for voice AI)

### Step 2 — Get Your API Key
1. In the left sidebar, click **API Keys**
2. Click **Create Key**
3. Name it "Vapi Phone Attendant"
4. Copy the key (starts with `sk-ant-...`) and save it somewhere safe

### Step 3 — Set Spending Limits (Optional but Recommended)
1. Click **Billing** → **Usage Limits**
2. Set a monthly budget (e.g., $20–$50) to avoid surprise charges
3. Click **Save**

---

## PART 4 — VAPI SETUP

### Step 1 — Create Your Vapi Account
1. Go to [vapi.ai](https://vapi.ai) and sign up
2. Add a payment method (Vapi bills per minute of call time)
3. You'll land on the **Dashboard**

### Step 2 — Add Your Anthropic API Key to Vapi
1. In the left sidebar, click **Provider Keys**
2. Find **Anthropic** in the list
3. Click the field next to it and paste your Anthropic API key
4. Click **Save**

### Step 3 — Create an Assistant
1. In the left sidebar, click **Assistants**
2. Click **Create Assistant**
3. Choose **Blank Template**
4. Name it (e.g., "Aria - Insurance Attendant")

### Step 4 — Configure the LLM (Claude)
1. In the assistant editor, find the **Model** section
2. Click the provider dropdown and select **Anthropic**
3. Select the model — use **claude-sonnet-4-5** for the best balance of quality and cost
   - Use **claude-opus-4-6** if you want maximum intelligence (costs more)
   - Use **claude-haiku-4-5** if you want lowest cost (faster but simpler)
4. In the **System Prompt** box, paste your full attendant system prompt
   - You can copy directly from **ElevenLabs_Insurance_Voice_Attendant.md** or **ElevenLabs_Painting_Voice_Attendant.md** in your project folder
   - Just copy the text inside the code block (between the triple backticks)

### Step 5 — Configure the Voice (Fish Audio via Custom TTS)
1. In the assistant editor, find the **Voice** section
2. Click the provider dropdown
3. Scroll down and select **Custom Voice**
4. In the **URL** field, paste your Cloudflare Worker URL from Part 2:
   `https://fish-audio-proxy.designshak.workers.dev/`
5. In the **Voice ID** field, paste your Fish Audio Model ID
6. Set **Output Format** to `mp3`

### Step 6 — Configure Transcriber (STT)
1. Find the **Transcriber** section
2. Provider: **Deepgram** (Vapi's default — very good quality)
3. Model: **Nova 2**
4. Language: **English**

### Step 7 — Configure Call Behavior
1. Find the **First Message** field
2. Type what the assistant should say when it picks up the call, e.g.:
   `"Thank you for calling [Agency Name]. This is Aria — are you an existing client, or are you calling to explore coverage options?"`
3. Under **End Call Settings**, set **End Call Phrase** to something like "goodbye" or "have a great day" — the assistant will end the call when it says this phrase
4. Set **Max Call Duration** to your preferred limit (e.g., 600 seconds = 10 minutes)

### Step 8 — Add Make.com Tools (Calendar + SMS)

This is how you connect your existing Make.com scenarios so Vapi can check availability, book appointments, and trigger SMS.

1. In the assistant editor, find the **Tools** section
2. Click **Add Tool** → **Function**
3. Add the first tool — **Check Availability:**
   - **Name:** `check_availability`
   - **Description:** `Check available appointment slots for the next 7 days`
   - **URL:** paste your Make.com "Check Availability" webhook URL
   - **Method:** POST
   - Click **Save**
4. Add a second tool — **Book Appointment:**
   - **Name:** `book_appointment`
   - **Description:** `Book an appointment for the caller. Requires: caller_name, caller_phone, caller_email, appointment_time`
   - **URL:** paste your Make.com "Book Appointment" webhook URL
   - **Method:** POST
   - Add parameters:
     - `caller_name` (string, required)
     - `caller_phone` (string, required)
     - `caller_email` (string, required)
     - `appointment_time` (string, required)
   - Click **Save**
5. Add a third tool — **Send SMS:**
   - **Name:** `send_sms`
   - **Description:** `Send a follow-up SMS to the caller after the call`
   - **URL:** paste your Make.com "Post-Call SMS" webhook URL
   - **Method:** POST
   - Click **Save**

### Step 9 — Save and Test
1. Click **Save** (top right)
2. On the assistant page, click **Test** to open the web-based test call
3. Click the phone icon and talk to your assistant
4. You should hear your Fish Audio voice responding with Claude's intelligence
5. Check that the voice sounds right and the responses are correct

---

## PART 5 — PHONE NUMBER SETUP

### Option A — Buy a Number Through Vapi (Easiest)
1. In the left sidebar, click **Phone Numbers**
2. Click **Buy Number**
3. Search by area code (enter your preferred area code)
4. Select a number and click **Buy** ($2–5/month)
5. Once purchased, click the number and set **Assistant** to the assistant you just built
6. Click **Save**

### Option B — Import Your Existing Twilio Number
If you already have a Twilio number you want to use:

1. In the left sidebar, click **Phone Numbers**
2. Click **Import** → **Twilio**
3. You'll need your Twilio **Account SID** and **Auth Token** from [console.twilio.com](https://console.twilio.com)
4. Enter them and click **Connect**
5. Select the Twilio number you want to use
6. Assign it to your Vapi assistant
7. Click **Save**

---

## PART 6 — UPDATE MAKE.COM SCENARIOS

Your existing Make.com scenarios can stay mostly the same. The main change is that Vapi (not ElevenLabs) is now the trigger.

### What Changes
- **Remove** any ElevenLabs webhook triggers
- **Keep** all the Google Calendar and Twilio modules exactly as-is
- The Webhook URLs you use in Vapi's Tools section (Part 4, Step 8) are the same ones you built in your Make.com scenarios

### Verify Your Webhooks Are Active
1. Log into [make.com](https://make.com)
2. Open each of your three scenarios
3. Make sure the scenario is **ON** (toggle in the bottom left)
4. Confirm the webhook URL is active (click the webhook module — it should show "Listening")

---

## PART 7 — TESTING END TO END

Before going live, do a full end-to-end test:

1. Call your Vapi phone number from your cell phone
2. Walk through a full mock conversation:
   - Introduce yourself as a new prospect
   - Ask about a specific type of insurance
   - Request to schedule an appointment
   - Confirm the appointment was booked (check Google Calendar)
   - End the call — confirm you received the follow-up SMS
3. Check Vapi's **Call Logs** (left sidebar → Logs) to see the full transcript and any errors
4. Adjust the system prompt in Vapi if responses need tuning

---

## QUICK REFERENCE — KEY SETTINGS

| Setting | Where | Value |
|---|---|---|
| LLM Model | Vapi → Assistant → Model | Claude Sonnet 4.5 |
| Voice Provider | Vapi → Assistant → Voice | Custom Voice |
| TTS URL | Vapi → Assistant → Voice → URL | Your Cloudflare Worker URL |
| Voice ID | Vapi → Assistant → Voice → Voice ID | `933563129e564b19a115bedd57b7406a` |
| Transcriber | Vapi → Assistant → Transcriber | Deepgram Nova 2 |

---

## TROUBLESHOOTING

**Voice isn't speaking / silent response**
- Check your Cloudflare Worker environment variables — make sure `FISH_API_KEY` and `FISH_VOICE_ID` are set correctly
- Open the Cloudflare Worker dashboard → **Logs** to see if there are errors
- Verify your Fish Audio Model ID is correct (copy it directly from the Fish Audio model page)

**Claude gives wrong or off-topic responses**
- Review the System Prompt in Vapi — make sure it was pasted completely without any formatting issues
- Try a shorter first message to confirm the LLM is working at all

**Appointments not booking**
- Check that your Make.com scenarios are turned ON
- Verify the webhook URLs in Vapi's Tools match the ones in Make.com exactly
- Open Make.com → the scenario → **History** to see if requests are arriving

**Call drops or ends unexpectedly**
- Check **Max Call Duration** in Vapi settings
- Look at Vapi's Call Logs for the error reason
- Make sure the "End Call Phrase" isn't accidentally appearing in normal responses

---

## COST ESTIMATE

| Service | Cost |
|---|---|
| Vapi | ~$0.05–0.10/min of call time |
| Claude (Sonnet) | ~$0.003–0.015/min |
| Fish Audio | ~$0.015/1,000 characters |
| Cloudflare Workers | Free (100k requests/day) |
| **Total estimate** | **~$0.07–0.12/min of call** |

This compares to ElevenLabs Conversational AI at $0.08–0.15/min — similar or lower cost, with significantly more flexibility and control.
