import type { Metadata } from "next";
import { PolicyPage } from "../components/policy-page";

export const metadata: Metadata = {
  title: "AlpNile — Financial Policy",
  description: "Pricing, payment, cancellation and refund information for AlpNile journeys.",
};

export default function FinancialPolicyPage() {
  return <PolicyPage accent="financial" eyebrow="ALPNILE / FINANCIAL POLICIES" title="Financial Policy" intro="A transparent overview of prices, payment requests, cancellations, refunds and the details that matter before you commit to a journey." updated="November 4, 2026" sections={[
    { id: "prices", title: "Prices and currency", body: "Prices shown on AlpNile are illustrative or supplied by the relevant travel provider, depending on the experience. The currency, taxes, fees and inclusions should be checked on the final provider confirmation before payment." },
    { id: "payment", title: "Payment", body: "AlpNile does not treat a planning action as a payment. When a third-party provider or authorized payment page is used, payment is handled under that provider's checkout terms. Never send card details through an AlpNile message or email." },
    { id: "changes", title: "Changes and cancellations", body: "Cancellation windows, change fees and no-show rules are set by the hotel, tour operator or other provider. Review the specific booking terms before confirming, especially for non-refundable rates and time-sensitive experiences." },
    { id: "refunds", title: "Refunds", items: ["Refund eligibility follows the terms shown by the provider at checkout.", "Approved refunds are returned through the original payment method where possible.", "Processing time can vary by provider, bank and payment method.", "AlpNile cannot promise a refund for a provider service that was not purchased through an AlpNile-controlled checkout."] },
    { id: "disputes", title: "Disputes and chargebacks", body: "If a charge or booking detail looks incorrect, contact the provider first using the confirmation details. If AlpNile handled the request, contact us with the reference number so we can investigate. Please do not share full card numbers or security codes." },
    { id: "updates", title: "Policy updates", body: "We may update this policy when our services, providers or payment flows change. The date above indicates when this version was last reviewed." },
  ]} />;
}
