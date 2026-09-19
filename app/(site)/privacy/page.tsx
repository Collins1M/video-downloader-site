import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Reel handles the data involved in downloading a video.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" effectiveDate="August 24, 2026">
      <LegalSection heading="No accounts">
        <p>
          Reel does not have user accounts or a saved history of what you have downloaded.
          Every visitor is anonymous.
        </p>
      </LegalSection>

      <LegalSection heading="Anonymous session cookie">
        <p>
          When you use Reel, we set a temporary session cookie. This is a random ID used
          only to apply fair usage limits and ensure one visitor doesn&apos;t overload the
          service. It is not used for tracking or advertising.
        </p>
      </LegalSection>

      <LegalSection heading="Download data">
        <p>
          While a download is processing, we store basic details about the request to
          track its progress. This includes the link you submitted and the current status
          of the job. This information is deleted automatically once the download is
          finished or has expired.
        </p>
      </LegalSection>

      <LegalSection heading="Automatic deletion">
        <p>
          The files you download live briefly in temporary storage and are removed
          immediately after you retrieve them. We do not store your downloads indefinitely.
        </p>
      </LegalSection>

      <LegalSection heading="No tracking">
        <p>
          Reel does not run advertising, use tracking pixels, or share your information
          with third parties. The service is built to be private and secure.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          If our data handling practices change, this policy will be updated accordingly.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
