#!/usr/bin/env bun
/**
 * Client SDK integration test — exhaustive.
 *
 * Tests every @semaphore-pay/client method against a running server.
 * Uses API key auth — no login/session/magic link.
 *
 * Usage:
 *   SERVER_URL=http://localhost:8787 \
 *   API_KEY=sem_pk_test_xxx \
 *   bun test-client.ts
 */

import { SemaphorePayClient, HttpError } from "@semaphore-pay/client";

const SERVER = process.env.SERVER_URL ?? "http://localhost:8787";
const API_KEY = process.env.API_KEY ?? "";
const COLLECTION_ID = process.env.COLLECTION_ID ?? "";

// ── Helpers ─────────────────────────────────────────────────────────

function log(label: string) {
  const line = "─".repeat(Math.max(0, 52 - label.length));
  console.log(`\n▸ ${label} ${line}`);
}

function ok(data: unknown) {
  console.log(`  ✓ ${JSON.stringify(data, null, 2).split("\n").join("\n    ")}`);
}

function fail(e: unknown) {
  if (e instanceof HttpError) {
    console.error(`  ✗ HTTP ${e.status}: ${e.message}`);
    console.error(`    ${JSON.stringify(e.body, null, 2).split("\n").join("\n    ")}`);
  } else if (e instanceof Error) {
    console.error(`  ✗ ${e.message}`);
  } else {
    console.error(`  ✗`, e);
  }
}

async function fn(label: string, fn: () => Promise<unknown>): Promise<unknown> {
  log(label);
  try {
    const r = await fn();
    ok(r);
    return r;
  } catch (e) {
    fail(e);
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error("Set API_KEY env var (sk_test_xxx or sem_pk_test_xxx)");
    process.exit(1);
  }

  console.log("═══ Semaphore Pay Client SDK Test (Exhaustive) ═══");
  console.log(`Server:  ${SERVER}`);
  console.log(`Key:     ${API_KEY.slice(0, 12)}...`);

  const client = new SemaphorePayClient({
    baseUrl: SERVER,
    apiKey: API_KEY,
    collectionId: COLLECTION_ID,
  });

  // 1. listPlans
  const plans = await fn("listPlans()", () => client.listPlans());

  // 2. listProducts
  const products = await fn("listProducts()", () => client.listProducts());

  // 3. getMe (before customer exists)
  await fn("getMe() [before create]", () => client.getMe());

  // 4. createCustomer
  const customer = await fn("createCustomer()", () =>
    client.createCustomer({
      userId: "test_user_exhaustive",
      email: "exhaustive@example.com",
      name: "Exhaustive Test User",
    })
  );

  if (!customer || !("id" in (customer as any))) {
    console.log("\n✗ No customer created — stopping.");
    return;
  }

  const customerId = (customer as any).id;

  // 5. getMe (after customer exists)
  await fn("getMe() [after create]", () => client.getMe());

  // 6. getPlan — fetch first plan by ID
  const firstPlan = (plans as any[])?.[0];
  if (firstPlan) {
    await fn(`getPlan(${firstPlan.id})`, () => client.getPlan(firstPlan.id));
  } else {
    console.log("\n  ℹ No plans — skipping getPlan.");
  }

  // 7. subscribeToPlan — prefer plan with features for entitlement testing
  const planWithFeatures = (plans as any[])?.find((p: any) => p.features?.length > 0) ?? firstPlan;
  let subscriptionId: string | null = null;
  if (planWithFeatures) {
    const sub = await fn(`subscribeToPlan(${planWithFeatures.id})`, () =>
      client.subscribeToPlan({ customerId, planId: planWithFeatures.id })
    );
    console.log(`  → checkout link: ${(sub as any)?.checkout?.checkoutLink ?? "none"}`);
    subscriptionId = (sub as any)?.subscriptionId ?? null;

    // 8. checkEntitlement
    const feature = planWithFeatures.features?.[0];
    if (feature) {
      await fn(`checkEntitlement(${feature.featureId})`, () =>
        client.checkEntitlement({ customerId, featureId: feature.featureId })
      );

      // 9. reportEntitlement
      await fn(`reportEntitlement(${feature.featureId})`, () =>
        client.reportEntitlement({ customerId, featureId: feature.featureId, amount: 1 })
      );
    } else {
      console.log("\n  ℹ No features on plan — skipping checkEntitlement/reportEntitlement.");
    }
  } else {
    console.log("\n  ℹ No plans — skipping subscribe/entitlement.");
  }

  // 10. cancelSubscription (only if not trialing — can't cancel trial with this)
  if (subscriptionId) {
    await fn(`cancelSubscription(${subscriptionId})`, () =>
      client.cancelSubscription(subscriptionId!)
    );
  }

  // 11. purchaseProduct (first product)
  const firstProduct = (products as any[])?.[0];
  if (firstProduct) {
    await fn(`purchaseProduct(${firstProduct.internalId})`, () =>
      client.purchaseProduct({ customerId, productInternalId: firstProduct.internalId })
    );
  } else {
    console.log("\n  ℹ No products — skipping purchaseProduct.");
  }

  console.log("\n═══ Done ═══");
}

main().catch((e) => {
  console.error("\nFatal:", e);
  process.exit(1);
});
