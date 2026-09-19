# TRAI DND / Communication Compliance Research

## 1. Purpose
The Event-Driven Notification Engine handles financial communications that are highly regulated. In India, the Telecom Regulatory Authority of India (TRAI) enforces strict guidelines via the Telecom Commercial Communications Customer Preference Regulations, 2018 (TCCCPR). To prevent spam, financial fraud, and ensure compliance, our notification engine must explicitly separate communications by category, observe user preferences (DND), and enforce quiet hours before routing any message to an SMS provider.

## 2. Promotional Communications
**Definition:** Any communication with the intent to promote or sell goods, services, or brands.
**Compliance Treatment:** 
- **Strictly regulated:** Must be scrubbed against the National Customer Preference Register (NCPR).
- **Quiet Hours:** Absolutely prohibited between 21:00 (9 PM) and 10:00 (10 AM).
- **Consent:** Requires explicit customer consent. In our engine, these correspond to the `LOW` priority tier and must always check `requires_optin`, evaluate DND status, and respect quiet hours.

## 3. Transactional Communications
**Definition:** Messages triggered by a direct transaction initiated by the user (e.g., OTPs for login or payments, immediate transaction alerts).
**Compliance Treatment:**
- **Exempt from DND:** These messages bypass the NCPR check because they are critical to completing a user-initiated action.
- **Exempt from Quiet Hours:** Can be delivered 24/7.
- **Implementation:** Corresponds to our `CRITICAL` or `HIGH` tier. These bypass DND, quiet hours, and frequency caps to guarantee delivery.

## 4. Service Communications
**Definition:** Communications arising out of an existing business relationship (e.g., account updates, monthly statements).
**Compliance Treatment:**
- **Service Implicit:** Routine service updates expected by the user. These generally bypass DND.
- **Service Explicit:** Offers or informational updates for existing customers. These require explicit consent and are scrubbed against DND.
- **Implementation:** Maps to our `NORMAL` tier. We must check preferences, but generally deliver during waking hours unless they are explicitly marketing.

## 5. Consent
Under TCCCPR 2018, consent must be verifiable and digitally recorded. Consent overrides default DND settings for a specific Principal Entity (PE). Our architecture stores this in the `consents` table, allowing the Policy Engine to greenlight `LOW` tier promotional messages if the user has explicitly opted in.

## 6. DND / Customer Preferences
The NCPR allows customers to set preferences (e.g., blocking all commercial communications, or allowing specific categories like Real Estate or Financial). Rather than relying on our SMS provider to arbitrarily block messages, our Engine evaluates DND logic internally based on the user's recorded preferences and the message's mapped event type.

## 7. DLT (Distributed Ledger Technology)
TRAI mandates that all SMS traffic in India must originate from a registered Principal Entity (PE) using DLT. 
- **Headers (Sender IDs):** Must be registered and mapped to the business.
- **Content Templates:** Every message must match a pre-registered template on the blockchain. 
- **Impact:** Our `Template Engine` ensures that variables are safely interpolated into exact DLT-approved templates before handing the payload to the Channel Router.

## 8. Impact on Notification Engine
Our architecture cleanly isolates compliance from delivery:
1. **Event Types:** Each of the 28 events is explicitly tagged with a tier (`CRITICAL`, `HIGH`, `NORMAL`, `LOW`, `REGULATORY`).
2. **Policy Engine First:** Before the `ChannelRouter` even sees the message, the `Compliance Pipeline` evaluates it.
3. **No Provider Hacks:** We do not rely on Twilio/Gupshup to perform DND checks for us. The decision to send is resolved internally using the `quiet_hours`, `frequency_caps`, and `consents` tables.

## 9. Sources
- Telecom Commercial Communications Customer Preference Regulations, 2018 (TCCCPR).
- Telecom Regulatory Authority of India (TRAI) Official Guidelines on DLT.
- National Customer Preference Register (NCPR) Guidelines.