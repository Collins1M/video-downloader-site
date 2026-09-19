import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for using Reel to download video.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" effectiveDate="August 24, 2026">
      <LegalSection heading="Acceptable use">
        <p>
          Reel is a tool for downloading video and audio you own or have permission to download.
          You are responsible for ensuring your use of the service complies with all applicable
          copyright terms and laws. Reel does not review your downloads and takes no position on any
          source or link.
        </p>
      </LegalSection>

      <LegalSection heading="No accounts">
        <p>
          You do not need to register to use Reel. Every session is anonymous. We do not keep
          any durable records of your activity or identity.
        </p>
      </LegalSection>

      <LegalSection heading="Fair use">
        <p>
          To keep the service available for everyone, we use automatic limits on how many
          requests you can make and how many downloads you can process at once.
        </p>
      </LegalSection>

      <LegalSection heading="Temporary downloads">
        <p>
          Completed downloads are kept for a very short time and are deleted automatically.
          If you do not retrieve your file quickly, it will be removed and you will need
          to start over.
        </p>
      </LegalSection>

      <LegalSection heading="No warranty">
        <p>
          Reel is provided &quot;as is.&quot; We cannot guarantee that any particular link will work
          or that the service will be available without interruption.
        </p>
      </LegalSection>

      <LegalSection heading="Changes">
        <p>
          These terms may be updated as the service evolves. By continuing to use Reel,
          you accept the current version of these terms.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
