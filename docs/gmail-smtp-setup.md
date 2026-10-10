# NeuroOption transactional email: Gmail SMTP

The intended **From** address for signup, password recovery, password-change alerts
and account-deletion confirmations is `NeuroOption <silasbarack5@gmail.com>`.
These messages are sent **to the customer's registered email address**, not to
the sender inbox. The password-reset code is one-time and expires in 10 minutes.

## 1. Prerequisites

- In Google Account Security for `silasbarack5@gmail.com`, enable 2-Step Verification
  and create a **16-character app password** for the application. Use the Google
  Account [App passwords](https://myaccount.google.com/apppasswords) page.
  Never use the normal Gmail login password for SMTP.
- The Render **backend web service** must use a **paid instance type**.
  Render Free blocks outbound SMTP ports 25, 465 and 587. Gmail supports
  ports 465/587, **not** 2525. Upgrading the workspace plan does not upgrade
  the instance; change the backend service's own instance type.
- Do not paste an app password into GitHub, ChatGPT, documentation or a frontend
  `VITE_*` variable. Store it only as a Render **backend secret environment variable**.

## 2. Render backend environment variables

Set exactly these keys on the NeuroOption **backend** Render service:

```dotenv
EMAIL_PROVIDER=smtp
EMAIL_FROM="NeuroOption" <silasbarack5@gmail.com>
SMTP_SERVICE=gmail
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=silasbarack5@gmail.com
SMTP_PASS=<16-character Gmail app password; enter in Render only>
SMTP_ALLOW_VERIFIED_ALIAS=false
FRONTEND_URL=https://neurooption-frontend.onrender.com
```

`SMTP_SERVICE=gmail` uses Nodemailer's Gmail settings (TLS/SSL). An empty
`SMTP_HOST` makes the service preset authoritative, so `SMTP_PORT` is not
used when the host is empty. The `SMTP_PASS` value is normalized by the
application to remove app-password grouping spaces. For explicit SMTP host
configuration instead of a service preset, use
`SMTP_SERVICE=`, `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=587`,
`SMTP_SECURE=false`. Alternatively, for port 465 use
`SMTP_SECURE=true`. TLS certificate verification must remain enabled.

**The backend now rejects transactional sending from any other From address.**
Do not configure a different sender in Brevo or Resend unless the code's
required-sender policy is deliberately updated.

## 3. Verify before production release

1. Deploy the backend on its **paid** Render service with the variables above.
2. Read backend startup logs. Expected:
   `Email provider: smtp` followed by
   `SMTP connection and authentication verified.`
   If authentication fails, regenerate the Gmail app password and check the
   Render secret. If the connection times out, confirm the instance type.
3. On that same Render environment, with a mailbox you control as recipient,
   run `EMAIL_TEST_TO=your-test-inbox@example.com npm run email:smoke`.
   This uses the same sender, transporter and branded HTML as production.
   **Do not** use an arbitrary customer's inbox for a test.
4. Check actual receipt in Inbox and Spam. A provider's SMTP `250`
   acceptance means the server accepted the message; it does not prove final
   delivery to Inbox.
5. With a disposable, zero-balance NeuroOption test account, separately test:
   signup welcome mail, six-digit reset code, password-changed notification,
   and **after deleting the disposable account** the deletion confirmation.
   Confirm the sender, logo, plain-text alternative, subject and timestamps.
6. Check the user-visible `emailSent` flag and the backend logs if a
   notification fails. The deletion flow verifies the email transport **before**
   deleting. A transient failure *after* deletion is still possible and must
   be handled by Support; SMTP alone cannot guarantee final mailbox delivery.
7. Verify a deleted user's JWT cannot access protected endpoints; confirm
   actual funds and pending trades block account deletion.

## 4. Email flow

| Trigger | Recipient | Subject |
| --- | --- | --- |
| Account creation | Registered address | Welcome to NeuroOption - your account is ready |
| Forgot password | Registered address | Your NeuroOption verification code |
| Password successfully changed | Registered address | Your NeuroOption password was changed |
| Account deletion completed | Former registered address | Your NeuroOption account has been deleted |

The deletion page asks for an optional reason and comments, then requires the
current password and typed confirmation `DELETE`. The deletion email contains
the deletion reference, account address, time in Kenya/EAT and UTC, optional
reason, summary of access removed, records legally retained, re-registration
information and steps to contact Support if the deletion was not authorized.

Account-deletion notifications should not be treated as marketing mail. For
truly guaranteed eventual acceptance under transient failures, add a persistent
transactional outbox with a delivery worker and alerts; this version reports
the provider result honestly and blocks deletion when SMTP cannot authenticate.
