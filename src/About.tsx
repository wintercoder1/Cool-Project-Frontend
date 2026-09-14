import { useNavigate } from 'react-router-dom';
import LogoHeader from './components/LogoHeader';
import AuthNavBar from './components/AuthNavBar';
import Footer from './components/Footer';
import { APP_NAME } from './config';

/**
 * About page.
 *
 * Every mention of the product name comes from APP_NAME rather than being
 * written out, so the copy follows VITE_APP_NAME (and the ?appName= override)
 * along with the rest of the app.
 */
export default function About() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white flex flex-col">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pt-2 px-8 bg-white">
        <LogoHeader onClick={() => navigate('/')} />
      </div>
      <AuthNavBar className="mt-2" />

      <div className="flex-1 bg-gray-100 pt-8 pb-16 px-4">
        <div className="w-full max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            About {APP_NAME}
          </h1>

          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 space-y-5 text-gray-700 leading-relaxed">
            <p>
              {APP_NAME} helps you understand companies through public data,
              with a primary focus on financial contributions and leadership
              demographics.
            </p>

            <p>
              Search an organization to see how its associated political
              contributions are distributed, which recipients or committees
              appear in public records, and what aggregate demographic signals
              are available for company leadership. Leadership demographic
              analysis uses population-level surname data and should be
              understood as an estimate, not as a statement about any
              individual person.
            </p>

            <p>
              {APP_NAME} also includes a values quiz that helps users compare
              companies based on what matters most to them, along with
              additional exploratory categories such as political leaning,
              environmental impact, DEI friendliness, technology innovation,
              immigration support, and wokeness. These are secondary analysis
              tools meant to add context, comparison, and perspective.
            </p>

            <p>
              Results are based on public records, regulatory filings, company
              sources, and available datasets. {APP_NAME} does not endorse any
              company, candidate, party, policy position, or demographic
              conclusion.
            </p>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
