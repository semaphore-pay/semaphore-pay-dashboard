import type {
  Plan,
  Product,
  FeatureInput,
} from "@semaphore-pay/client";

const BASE = "https://api.semaphorepay.tech/api/v1/billing";

async function req<T>(
  method: "GET" | "POST" | "DELETE" | "PUT",
  path: string,
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "content-type": "application/json" },
    credentials: "include",
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
  environment: "sandbox" | "production";
  plans: number;
  products: number;
  customers: number;
  activeSubscriptions: number;
}

export function listCollections() {
  return req<Collection[]>("GET", "/collections");
}

export function createCollection(name: string, environment: "sandbox" | "production" = "sandbox") {
  return req<{ collection: Collection; keys: { public: string; secret: string } }>(
    "POST",
    "/collections",
    { name, environment },
  );
}

// ──── API Keys ────

export interface ApiKey {
  key: string;
  type: "public" | "secret";
  environment: "development" | "production";
  collectionId: string;
  userId: string | null;
  createdAt: string;
}

export function listApiKeys(collectionId: string) {
  return req<ApiKey[]>("GET", `/collections/${collectionId}/api-keys`);
}

export function createApiKey(collectionId: string, input: { type?: string; environment?: string }) {
  return req<ApiKey>("POST", `/collections/${collectionId}/api-keys`, input);
}

export function revokeApiKey(collectionId: string, keyStr: string) {
  return req<unknown>("DELETE", `/collections/${collectionId}/api-keys/${keyStr}`);
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

export function deactivatePlan(collectionId: string, planId: string, cancelRenewals?: boolean) {
  return req<Plan>("POST", `/collections/${collectionId}/plans/${planId}/deactivate`, { cancelRenewals });
}

export function reactivatePlan(collectionId: string, planId: string) {
  return req<Plan>("POST", `/collections/${collectionId}/plans/${planId}/reactivate`);
}

export function deletePlan(collectionId: string, planId: string) {
  return req<unknown>("DELETE", `/collections/${collectionId}/plans/${planId}`);
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

export function getProduct(collectionId: string, productId: string) {
  return req<Product>("GET", `/collections/${collectionId}/products/${productId}`);
}

export function updateProduct(collectionId: string, productId: string, input: Partial<ProductInput>) {
  return req<Product>("PUT", `/collections/${collectionId}/products/${productId}`, input);
}

export function deleteProduct(collectionId: string, productId: string) {
  return req<unknown>("DELETE", `/collections/${collectionId}/products/${productId}`);
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

export interface CustomerListItem {
  id: string;
  userId: string;
  email: string | null;
  name: string | null;
  metadata: Record<string, string> | null;
  collectionId: string;
  createdAt: string;
  updatedAt: string;
  nombaCustomerId: string | null;
  subscriptionCount: number;
  activeSubscriptionCount: number;
  lastActivityAt: string | null;
}

export interface CustomerListResult {
  data: CustomerListItem[];
  total: number;
  hasMore: boolean;
  limit: number;
  offset: number;
}

export interface CustomerInput {
  userId: string;
  email?: string;
  name?: string;
  metadata?: Record<string, string>;
}

export function listCustomers(
  collectionId: string,
  params?: { search?: string; limit?: number; offset?: number },
) {
  const query = new URLSearchParams();
  if (params?.search) query.set("search", params.search);
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.offset) query.set("offset", String(params.offset));
  const qs = query.toString();
  return req<CustomerListResult>(
    "GET",
    `/collections/${collectionId}/customers${qs ? `?${qs}` : ""}`,
  );
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

export interface MetricSnapshot {
  id: string;
  collectionId: string;
  date: string;
  features: number;
  booleanFeatures: number;
  limitFeatures: number;
  plans: number;
  activePlans: number;
  products: number;
  customers: number;
  activeSubscriptions: number;
  trialingSubscriptions: number;
  churnedSubscriptions: number;
  mrr: number;
  createdAt: string;
}

export interface MetricTrend {
  current: MetricSnapshot | null;
  previous: MetricSnapshot | null;
}

export function getMetricsHistory(collectionId: string, limit?: number) {
  const qs = limit ? `?limit=${limit}` : "";
  return req<MetricSnapshot[]>("GET", `/collections/${collectionId}/metrics/history${qs}`);
}

export function getMetricsTrend(collectionId: string) {
  return req<MetricTrend>("GET", `/collections/${collectionId}/metrics/trend`);
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

// ──── Features ────

export interface Feature {
  id: string;
  name: string;
  type: "boolean" | "limit";
  createdAt: string;
  updatedAt: string;
}

export interface PlanFeatureConfig {
  planId: string;
  featureId: string;
  limit: number | null;
  resetInterval: string | null;
  config: Record<string, unknown> | null;
}

export interface ProductFeatureConfig {
  productInternalId: string;
  featureId: string;
  limit: number | null;
  resetInterval: string | null;
  config: Record<string, unknown> | null;
}

export function listFeatures(collectionId: string) {
  return req<Feature[]>("GET", `/collections/${collectionId}/features`);
}

export function createFeature(collectionId: string, input: { id: string; name: string; type: "boolean" | "limit" }) {
  return req<Feature>("POST", `/collections/${collectionId}/features`, input);
}

export function deleteFeature(collectionId: string, featureId: string) {
  return req<unknown>("DELETE", `/collections/${collectionId}/features/${featureId}`);
}

export function attachFeatureToPlan(collectionId: string, input: {
  planId: string;
  featureId: string;
  type: "boolean" | "limit";
  limit?: number | null;
  resetInterval?: string | null;
}) {
  return req<PlanFeatureConfig>("POST", `/collections/${collectionId}/features/attach-plan`, input);
}

export function detachFeatureFromPlan(collectionId: string, input: { planId: string; featureId: string }) {
  return req<unknown>("POST", `/collections/${collectionId}/features/detach-plan`, input);
}

export function attachFeatureToProduct(collectionId: string, input: {
  productInternalId: string;
  featureId: string;
  type: "boolean" | "limit";
  limit?: number | null;
  resetInterval?: string | null;
}) {
  return req<ProductFeatureConfig>("POST", `/collections/${collectionId}/features/attach-product`, input);
}

export function detachFeatureFromProduct(collectionId: string, input: { productInternalId: string; featureId: string }) {
  return req<unknown>("POST", `/collections/${collectionId}/features/detach-product`, input);
}

// ──── Balance ────

export interface Balance {
  available: number;
  pending: number;
  totalEarned: number;
  platformFeeRate: number;
  currency: string;
}

export function getBalance(collectionId: string) {
  return req<Balance>("GET", `/collections/${collectionId}/balance`);
}
