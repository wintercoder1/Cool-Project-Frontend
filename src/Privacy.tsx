import { useNavigate } from 'react-router-dom';
import LogoHeader from './components/LogoHeader';
import AuthNavBar from './components/AuthNavBar';
import Footer from './components/Footer';
import { APP_NAME } from './config';

/**
 * Privacy policy.
 *
 * Adapted from the mobile app's policy, but the two properties differ in ways
 * that matter: the app has no accounts and stores saved items on the device,
 * while this site has Clerk accounts and stores favorites server-side against
 * an email address. Every claim here was checked against the code rather than
 * carried over — see the sections on accounts, favorites and the quiz.
 *
 * Deliberately no <AdBanner />. A page explaining what third parties collect
 * should not itself load an ad script.
 */
export default function Privacy() {
  const navigate = useNavigate();

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader onClick={() => navigate('/')} />
      </div>
      <AuthNavBar className="mt-2" />

      <div className="flex-1 bg-gray-100 pt-8 pb-16 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-4">Effective date: September 14, 2026</p>

          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-7 text-gray-700 leading-relaxed">
            <p>
              {APP_NAME} is a website operated by Covariant Apps LLC. This policy
              explains what the site collects, how it is used, and the choices
              available to you. It covers the website only. Our mobile app is
              covered by its own policy.
            </p>

            <Section title="Information We Collect">
              <p>
                {APP_NAME} provides informational analysis about companies using
                public records, regulatory filings, company sources, and other
                publicly available datasets. When you use the site, we may
                process:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Search terms and company names you enter</li>
                <li>Quiz answers you submit, in order to calculate your results</li>
                <li>
                  Your email address and an account identifier, if you create an
                  account
                </li>
                <li>Which analyses you save to your favorites, if you use that feature</li>
                <li>
                  Standard server and usage information such as IP address,
                  browser type, pages requested, and error diagnostics
                </li>
                <li>
                  Advertising information collected by Google AdSense and its
                  partners
                </li>
              </ul>
              <p>
                You do not need an account to search, read any analysis, or take
                the quiz. An account is required only to save favorites.
              </p>
            </Section>

            <Section title="Accounts">
              <p>
                Accounts are handled by Clerk, our authentication provider. If
                you sign up, we store your email address, an account identifier
                issued by Clerk, and the dates your account was created and last
                updated. We do not store your password; Clerk handles
                credentials and sign-in, and sets cookies in your browser to
                keep you signed in.
              </p>
              <p>
                Deleting your account deletes your saved favorites along with
                it.
              </p>
            </Section>

            <Section title="Quiz Data">
              <p>
                The quiz sends the answers you select to our server so it can
                calculate your results. Those answers are not stored on our
                server, and they are not attached to your account. They are used
                to compute the ranking and then discarded.
              </p>
              <p>
                Because the quiz asks about political giving, social positions,
                and immigration, your answers may reveal political opinions.
                This is the reason the site does not retain them and does not
                use them for advertising.
              </p>
              <p>
                If you choose to share a quiz result, the share link itself
                contains your answers in encoded form. Anyone who has that link
                can view or infer the positions you selected, and links can be
                exposed through browser history, chat previews, and referrer
                information. The site warns you about this wherever it offers
                the link. Sharing is always your choice.
              </p>
              <p>
                The site does not currently offer a way to save a quiz result.
                Quiz results exist only in your browser until you leave the
                page.
              </p>
            </Section>

            <Section title="Favorites">
              <p>
                If you save an analysis to your favorites, we store a reference
                to that analysis against your account on our servers, so it is
                available when you sign in on any device. What is stored is a
                pointer to a publicly viewable analysis and the date you saved
                it. You can remove a saved item at any time from the Favorites
                page.
              </p>
            </Section>

            <Section title="Browser Storage">
              <p>
                The site stores information in your browser to make it work
                properly. This includes cached listings and the category and
                page you were last viewing, so the site can restore where you
                were, and session cookies set by Clerk if you are signed in.
                Google sets its own cookies for advertising, described below.
              </p>
              <p>
                You can clear this at any time through your browser settings.
                Clearing it signs you out and resets your browsing position, but
                does not delete your account or your saved favorites.
              </p>
            </Section>

            <Section title="Advertising">
              <p>
                {APP_NAME} uses Google AdSense to display advertisements. Google
                and its partners may use cookies and similar technologies, and
                may collect device and usage information, approximate location,
                and your interactions with ads, in order to serve, measure, and
                personalize advertising, depending on your settings and consent
                choices.
              </p>
              <p>
                We do not run advertising on the quiz pages, and we do not pass
                your quiz answers to any advertising provider.
              </p>
              <p>
                You can manage personalized advertising through your Google
                account at{' '}
                <a
                  href="https://adssettings.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  adssettings.google.com
                </a>
                , and through your browser&apos;s cookie controls. Google&apos;s
                privacy practices are described at{' '}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand underline underline-offset-2"
                >
                  policies.google.com/privacy
                </a>
                .
              </p>
            </Section>

            <Section title="How We Use Information">
              <ul className="list-disc pl-5 space-y-1">
                <li>To provide search results and company analysis</li>
                <li>To calculate quiz recommendations</li>
                <li>To store and display your saved favorites</li>
                <li>To operate, secure, and improve the site</li>
                <li>To display advertisements</li>
                <li>To detect abuse, errors, and technical problems</li>
              </ul>
            </Section>

            <Section title="What We Do Not Do">
              <p>
                {APP_NAME} does not endorse any company, candidate, party,
                policy position, or demographic conclusion. Where the quiz
                recommends a company, it is matching that company against the
                priorities you entered, not offering a view of its own.
              </p>
              <p>
                <strong className="font-semibold text-gray-900">
                  We do not sell your personal information.
                </strong>{' '}
                Not to advertisers, not to data brokers, not to anyone. The site
                is supported by advertising, and we intend to offer a paid
                ad-free option. Neither of those depends on selling what we know
                about you, which is the point of choosing them.
              </p>
              <p>
                One thing to be clear about, because it is a real distinction
                rather than a caveat: Google&apos;s advertising, described above,
                involves Google collecting information through this site for its
                own purposes. Some state privacy laws classify that kind of
                activity as &quot;sharing&quot; personal information for targeted
                advertising, even where no money is paid for data and none is
                here. You can switch off personalized advertising using the
                controls in the Advertising section, and you can contact us with
                any request relating to your information.
              </p>
            </Section>

            <Section title="Public Sources and Estimates">
              <p>
                Financial contribution information is drawn from public FEC
                filings, and leadership information from public company records.
                Our category ratings, and the quiz built on top of them, are
                assessments generated by a language model from public
                information. They are opinions rather than measurements, and the
                prompts behind them take positions.
              </p>
              <p>
                Leadership demographic analysis uses population-level surname
                data and should be understood as an estimate, not as a statement
                about any individual person.
              </p>
              <p>
                Quiz results and company ratings are informational and for
                entertainment purposes only. They are not financial, investment,
                legal, professional, or political advice.
              </p>
            </Section>

            <Section title="Data Sharing">
              <p>
                We share information with the service providers that operate the
                site: our hosting and content delivery provider, our
                authentication provider, and our advertising provider. Each
                processes information under its own privacy policy.
              </p>
              <p>
                We may also disclose information if required by law, to protect
                rights and safety, or to prevent abuse of the service.
              </p>
            </Section>

            <Section title="Data Retention">
              <p>
                Account records and saved favorites are kept until you delete
                them or delete your account. Server logs and diagnostics are
                kept only as long as reasonably needed for security, debugging,
                and operating the service. Quiz answers are not retained.
              </p>
            </Section>

            <Section title="Children&rsquo;s Privacy">
              <p>
                {APP_NAME} is not intended for children under 13, and we do not
                knowingly collect personal information from children under 13.
                If you believe a child has provided us with personal
                information, contact us and we will delete it.
              </p>
            </Section>

            <Section title="Your Choices">
              <ul className="list-disc pl-5 space-y-1">
                <li>Use the site without an account</li>
                <li>Remove saved items from the Favorites page</li>
                <li>Delete your account, which deletes your saved favorites</li>
                <li>Clear cookies and site data in your browser</li>
                <li>Manage personalized advertising through Google Ads Settings</li>
                <li>Choose not to share a quiz result link</li>
                <li>Contact us with privacy questions or deletion requests</li>
              </ul>
            </Section>

            <Section title="Security">
              <p>
                We use reasonable technical and organizational measures to
                protect information. No system can be guaranteed to be
                completely secure.
              </p>
            </Section>

            <Section title="Changes">
              <p>
                We may update this policy from time to time. If we make material
                changes, we will update the effective date above and, where
                appropriate, provide notice on the site.
              </p>
            </Section>

            <Section title="Contact">
              <p>
                Questions about this policy, or requests relating to your
                information, can be sent to{' '}
                <a
                  href="mailto:covariant.apps@gmail.com"
                  className="text-brand underline underline-offset-2"
                >
                  covariant.apps@gmail.com
                </a>
                .
              </p>
            </Section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
