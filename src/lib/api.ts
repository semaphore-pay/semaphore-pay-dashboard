import type {
  Plan,
  Product,
  FeatureInput,
} from "@semaphore-pay/client";

const BASE = "http://localhost:8787/api/v1/billing";

async function req<T>(
  method: "GET" | "POST" | "DELETE",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  const payload = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(payload?.error ?? `HTTP ${res.status}`);
  return payload as T;
}

// ──── Collections ────

export interface Collection {
  id: string;
  name: string;
  plans: number;
  products: number;
  customers: number;
  activeSubscriptions: number;
}

export function listCollections() {
  return req<Collection[]>("GET", "/collections");
}

export function createCollection(name: string) {
  return req<{ collection: Collection; keys: { public: string; secret: string } }>(
    "POST",
    "/collections",
    { name },
  );
}

// ──── Plans ────

export interface PlanInput {
  id: string;
  name: string;
  description?: string;
  priceAmount: number;
  priceCurrency?: string;
  interval: "monthly" | "yearly" | "none";
  trialPeriodDays?: number;
  features?: FeatureInput[];
  badge?: string;
  ctaText?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export function listPlans(collectionId: string) {
  return req<Plan[]>("GET", `/collections/${collectionId}/plans`);
}

export function getPlan(collectionId: string, planId: string) {
  return req<Plan | null>("GET", `/collections/${collectionId}/plans/${planId}`);
}

export function createPlan(collectionId: string, input: PlanInput) {
  return req<unknown>("POST", `/collections/${collectionId}/plans`, input);
}

// ──── Products ────

export interface ProductInput {
  id: string;
  name: string;
  group?: string;
  isDefault?: boolean;
  priceAmount?: number | null;
  priceCurrency?: string;
  priceInterval?: string;
  version?: number;
  features?: FeatureInput[];
}

export function listProducts(collectionId: string) {
  return req<Product[]>("GET", `/collections/${collectionId}/products`);
}

export function createProduct(collectionId: string, input: ProductInput) {
  return req<unknown>("POST", `/collections/${collectionId}/products`, input);
}

// ──── Customers ────

export interface Customer {
  id: string;
  userId: string;
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
  collectionId: string;
  createdAt: string;
}

export interface CustomerInput {
  userId: string;
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export function upsertCustomer(collectionId: string, input: CustomerInput) {
  return req<Customer>("POST", `/collections/${collectionId}/customers`, input);
}

export function getCustomer(collectionId: string, customerId: string) {
  return req<Customer | null>(
    "GET",
    `/collections/${collectionId}/customers/${customerId}`,
  );
}

// ──── Subscriptions ────

export interface SubscribeInput {
  customerId: string;
  planId: string;
}

export function subscribe(collectionId: string, input: SubscribeInput) {
  return req<unknown>(
    "POST",
    `/collections/${collectionId}/subscriptions/subscribe`,
    input,
  );
}

export function cancelSubscription(collectionId: string, subscriptionId: string) {
  return req<unknown>(
    "POST",
    `/collections/${collectionId}/subscriptions/${subscriptionId}/cancel`,
  );
}

// ──── Entitlements ────

export interface CheckEntitlementInput {
  customerId: string;
  featureId: string;
  required?: number;
}

export interface ReportEntitlementInput {
  customerId: string;
  featureId: string;
  amount?: number;
}

export function checkEntitlement(collectionId: string, input: CheckEntitlementInput) {
  return req<unknown>(
    "POST",
    `/collections/${collectionId}/entitlements/check`,
    input,
  );
}

export function reportEntitlement(collectionId: string, input: ReportEntitlementInput) {
  return req<unknown>(
    "POST",
    `/collections/${collectionId}/entitlements/report`,
    input,
  );
}

// ──── Analytics ────

export interface CollectionAnalytics {
  mrr: number;
  arr: number;
  activeTrials: number;
  subscribersByStatus: Record<string, number>;
  planBreakdown: Array<{
    planId: string;
    planName: string;
    subscribers: number;
    mrr: number;
    interval: string;
  }>;
  stats: {
    plans: number;
    products: number;
    customers: number;
    activeSubscriptions: number;
  };
}

export function getAnalytics(collectionId: string) {
  return req<CollectionAnalytics>("GET", `/collections/${collectionId}/analytics`);
}

// ──── Subscriptions ────

export interface Subscription {
  id: string;
  collectionId: string;
  customerId: string;
  planId: string;
  status: string;
  cancelAtPeriodEnd: boolean;
  startedAt: string | null;
  currentPeriodStartAt: string | null;
  currentPeriodEndAt: string | null;
  trialEndAt: string | null;
  createdAt: string;
  plan: {
    id: string;
    name: string;
    priceAmount: number;
    priceCurrency: string;
    interval: string;
  } | null;
}

export interface ListSubscriptionsResult {
  subscriptions: Subscription[];
  total: number;
}

export function listSubscriptions(
  collectionId: string,
  params?: { status?: string; planId?: string; customerId?: string; limit?: number; offset?: number },
) {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (params?.planId) query.set("planId", params.planId);
  if (params?.customerId) query.set("customerId", params.customerId);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return req<ListSubscriptionsResult>("GET", `/collections/${collectionId}/subscriptions${qs ? `?${qs}` : ""}`);
}

export function getSubscription(collectionId: string, subscriptionId: string) {
  return req<Subscription | null>("GET", `/collections/${collectionId}/subscriptions/${subscriptionId}`);
}

export function pauseSubscription(collectionId: string, subscriptionId: string) {
  return req<Subscription>("POST", `/collections/${collectionId}/subscriptions/${subscriptionId}/pause`);
}

export function resumeSubscription(collectionId: string, subscriptionId: string) {
  return req<Subscription>("POST", `/collections/${collectionId}/subscriptions/${subscriptionId}/resume`);
}

export function reactivateSubscription(collectionId: string, subscriptionId: string) {
  return req<Subscription>("POST", `/collections/${collectionId}/subscriptions/${subscriptionId}/reactivate`);
}
