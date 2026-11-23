import type { PaymentProviderId } from "./types";

export interface PaymentRequest {
  fundId: string;
  amount: number;
  currency: string;
  frequency: "once" | "monthly";
  donor: { name: string; email: string };
  inMemoryOf?: string;
  purpose: "donation" | "commemoration";
  metadata?: Record<string, string>;
}

export interface PaymentResult {
  status: "succeeded" | "redirected" | "failed";
  demo: boolean;
  reference?: string;
}

export interface PaymentProvider {
  id: PaymentProviderId;
  /** Starts a payment. Every payment must carry fundId so fund totals can be summed later. */
  pay(request: PaymentRequest): Promise<PaymentResult>;
}

const demo: PaymentProvider = {
  id: "demo",
  async pay() {
    await new Promise((r) => setTimeout(r, 800));
    return { status: "succeeded", demo: true, reference: `DEMO-${Date.now().toString(36).toUpperCase()}` };
  },
};

const stripe: PaymentProvider = {
  id: "stripe",
  async pay() {
    // TODO(builder): create a Checkout Session on your server with
    // metadata.fund_id = request.fundId, then redirect with Stripe.js using payments.publicKey.
    throw new Error("Stripe is not connected yet");
  },
};

const authorizeNet: PaymentProvider = {
  id: "authorizeNet",
  async pay() {
    // TODO(builder): load Accept.js with payments.publicKey, tokenize the card, and send the
    // opaque data plus request.fundId (as an order or line item tag) to your server to charge.
    throw new Error("Authorize.net is not connected yet");
  },
};

const tithely: PaymentProvider = {
  id: "tithely",
  async pay() {
    // TODO(builder): open the Tithe.ly giving form for this organization with the fund
    // preselected (map request.fundId to the Tithe.ly fund name).
    throw new Error("Tithe.ly is not connected yet");
  },
};

const providers: Record<string, PaymentProvider> = { demo, stripe, authorizeNet, tithely };

export function getPaymentProvider(id: PaymentProviderId | undefined): PaymentProvider | null {
  if (!id || id === "none") return null;
  return providers[id] ?? null;
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}
