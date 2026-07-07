#!/usr/bin/env bun
/**
 * Mock Nomba webhook sender.
 *
 * Generates a valid payment_success webhook with HMAC-SHA256 signature
 * and sends it to the local backend.
 *
 * Usage:
 *   SERVER_URL=http://localhost:8787 \
 *   WEBHOOK_SECRET=NombaHackathon2026 \
 *   ORDER_REFERENCE=<orderRef> \
 *   AMOUNT=<amount in kobo> \
 *   bun mock-webhook.ts
 */

import crypto from "crypto";

const SERVER = process.env.SERVER_URL ?? "http://localhost:8787";
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET ?? "NombaHackathon2026";
const ORDER_REFERENCE = process.env.ORDER_REFERENCE ?? crypto.randomUUID();
const AMOUNT = Number(process.env.AMOUNT ?? "500000"); // 5000 NGN in kobo

const ACCOUNT_ID = "f666ef9b-888e-4799-85ce-acb505b28023";
const NOW = new Date().toISOString();
const TIMESTAMP = NOW;

// Build payload matching Nomba's payment_success structure
const payload = {
  event_type: "payment_success",
  requestId: crypto.randomUUID(),
  data: {
    merchant: {
      userId: ACCOUNT_ID,
      walletBalance: 100000,
      walletId: "mock_wallet_001",
    },
    terminal: {},
    transaction: {
      fee: AMOUNT * 0.028,
      type: "online_checkout",
      transactionId: `WEB-ONLINE_C-${crypto.randomUUID().slice(0, 8)}-${crypto.randomUUID()}`,
      responseCode: "",
      originatingFrom: "web",
      merchantTxRef: ORDER_REFERENCE,
      transactionAmount: AMOUNT + AMOUNT * 0.028,
      time: NOW,
    },
    order: {
      amount: AMOUNT,
      orderId: crypto.randomUUID(),
      accountId: ACCOUNT_ID,
      customerEmail: "test@example.com",
      orderReference: ORDER_REFERENCE,
      paymentMethod: "card_payment",
      cardType: "Visa",
      cardLast4Digits: "1234",
      currency: "NGN",
    },
  },
};

const rawBody = JSON.stringify(payload);

// Compute HMAC-SHA256 signature (same as NombaWebhookVerifier)
const merchant = payload.data.merchant;
const transaction = payload.data.transaction;
const hashingPayload = [
  payload.event_type,
  payload.requestId,
  merchant.userId,
  merchant.walletId,
  transaction.transactionId,
  transaction.type,
  transaction.time,
  transaction.responseCode,
  TIMESTAMP,
].join(":");

const signature = crypto
  .createHmac("sha256", WEBHOOK_SECRET)
  .update(hashingPayload)
  .digest("base64");

console.log("═══ Mock Nomba Webhook ═══");
console.log(`Server:    ${SERVER}`);
console.log(`OrderRef:  ${ORDER_REFERENCE}`);
console.log(`Amount:    ₦${(AMOUNT / 100).toLocaleString()}`);
console.log(`Signature: ${signature.slice(0, 20)}...`);
console.log();

try {
  const res = await fetch(`${SERVER}/webhook`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "nomba-signature": signature,
      "nomba-timestamp": TIMESTAMP,
    },
    body: rawBody,
  });

  const body = await res.json();
  console.log(`Response: ${res.status}`);
  console.log(JSON.stringify(body, null, 2));
} catch (e) {
  console.error("Failed:", e);
}
