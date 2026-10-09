# Account emails and deletion

Signup, password-recovery codes, completed password resets and account deletion
queue a company email in the same database transaction as the account change.
The frontend reports **queued**, not delivered. A provider accepting a message
does not establish that it reached an inbox.

## Production email configuration

Set a verified company sender in EMAIL_FROM, a monitored mailbox in
EMAIL_REPLY_TO, and the deployed frontend origin in FRONTEND_URL. Set frontend
VITE_SUPPORT_EMAIL to that same monitored support mailbox. These are deployment
settings; credentials are not committed.

Provider priority is BREVO_API_KEY, RESEND_API_KEY, then SMTP. SMTP requires
SMTP_HOST (or SMTP_SERVICE), SMTP_USER, SMTP_PASS and the appropriate port/TLS
settings. Port 465 uses implicit TLS; port 587 uses STARTTLS. Keep certificate
verification enabled. Render free web services block outbound ports 25, 465 and
587; use the existing HTTPS provider integration there, or a provider/hosting
plan that supports the intended SMTP connection.

SMTP startup verification tests connection/authentication. The sender domain and
mailbox still need provider verification. Use a dedicated test account and an
inbox you control to confirm welcome, recovery, password-change and deletion
messages after deployment, including From, Reply-To, HTML/plain-text content and
spam-folder placement. Never use production customers or production records for
the automated tests.

## Delivery persistence

The database outbox is polled every five seconds. Workers claim a two-minute
lease and retry rejected deliveries from five seconds up to fifteen minutes.
A process restart preserves pending work and expired leases can be reclaimed.
Expired or superseded recovery codes are cancelled; reset codes expire after
ten minutes and are consumed once. Recipients and message bodies are cleared
after acceptance or cancellation. Failed messages remain pending for retry;
monitor their age and attempts, correct provider configuration and verify the
queue drains.

Delivery is at least once: a crash after provider acceptance but before marking
the job sent can produce a duplicate. An email already handed to a provider
cannot be recalled. Application-side cancellation and reset-code invalidation
ensure old queued codes cannot be used.

## Account deletion contract

Authenticated POST /account/delete accepts:

    {
      "password": "<current password>",
      "confirmation": "DELETE",
      "reason": "NOT_TRADING",
      "comment": "<optional feedback for OTHER, maximum 500 characters>"
    }

The word is exact and case-sensitive on the server and client. Reasons are
optional. The existing ten suggested reasons include trading, another platform,
privacy/security, payments, trading conditions, finances, usability, a duplicate
account, taking a break and Other. Optional comments allow up to 500 characters.
A user may only delete their own account. Legacy DELETE /users routes remain
removed. Profile read/update/password routes require ownership. Existing
password and reset-code attempt limits are preserved.

Closure is refused while any real balances, locked funds, nonzero user ledger
accounts, open trades/copy trades, pending deposits, withdrawals or payouts, or
unpaid pending/approved affiliate commissions remain. Demo balances do not block
closure; demo trades still must finish. Closure does not transfer funds.

A successful transaction removes the active profile's name, email, phone and
password, clears referral fields, revokes JWTs and reset codes, disables trading
and ledger accounts, stops social follows and disables the affiliate profile.
Settled copy trades keep their follows and remain valid historical records.
Commission and copy creation coordinate with closure using user-row writes and
transactions, so a request that read an active profile before closure cannot
create new obligations afterwards.

Deletion retains anonymized user IDs and linked trading, payment, affiliate,
KYC, support and security history. This is account closure and active-profile
erasure, not a promise to erase every historical record. Establish the company's
retention periods and process further erasure requests through Support. Existing
account credentials cannot be restored.

The deletion receipt is queued to the email address read inside the successful
closure transaction, before anonymization. It includes the account address,
reference, timestamp, selected reason, access changes, record-retention
explanation, funds information and instructions if deletion was unauthorized.
Only the delivery payload keeps that address until accepted. The screen clears
local and session credentials and displays the reference and original address.
The public Help Center remains reachable after closure.

## Rollout and checks

1. Deploy the backend and apply the additive migration before the frontend.
2. Configure and verify the company sender and support mailbox.
3. Deploy the frontend with VITE_API_URL and VITE_SUPPORT_EMAIL.
4. Confirm all four emails using synthetic accounts and a controlled inbox.

The lifecycle Actions workflow runs migrations, a schema diff, production build,
lint for modified code, the full Jest suite on PostgreSQL 16 and local SMTP tests.
Frontend browser tests cover desktop and mobile, the exact phrase, current
password, cancellation, temporary sessions, blocked closure and public Support.

Run database tests only against a dedicated disposable PostgreSQL database:
DATABASE_URL=<test database> RUN_PG_CONCURRENCY_TESTS=true npm test.
Never point this test command at production. Tests create synthetic users and
remove only their fixture records.

The repository's existing broad lint debt is separate from this change; the
lifecycle check lints all modified application files. Broader legacy endpoint
authorization and distributed reset rate limiting require a separate deployment review.

Rolling back the UI does not restore a closed account. Do not roll back to a JWT
validator that ignores deletion and token versions after closures have occurred.
Keep the additive migration when rolling back application code.
