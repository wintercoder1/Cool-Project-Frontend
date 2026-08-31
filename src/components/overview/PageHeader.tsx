import LogoHeader from "../LogoHeader";
import AuthNavBar from "../AuthNavBar";

// The logo floats above the page and each consumer absolutely positions its own
// content below the header, so the two have to be kept in sync by hand.
// The logo sits at top-4 (16px) and is 44px tall, so it ends at 60px; the auth
// row starts just below it and measures 39px tall (1px top rule + 36px row +
// 2px bottom rule), so it ends at 108px. AuthNavBar pins that row height so it
// stays 39px whether signed in, signed out, or still loading.
const AUTH_BAR_TOP = 69;

// Where consumers should park their absolutely positioned content. Their first
// child carries mt-8 (32px), so this lands the gray band flush under the auth
// row at 108px.
export const PAGE_CONTENT_TOP = '76px';

const PageHeader = ({ onLogoClick }) => {
    return (
      <div className="bg-white w-full pb-6">
        <div className="flex justify-center top-0 w-full">
          <div className="absolute top-4 left-8 cursor-pointer">
            <LogoHeader onClick={onLogoClick} />
          </div>
        </div>
        <div
          className="absolute left-0 right-0 z-[2]"
          style={{ top: `${AUTH_BAR_TOP}px` }}
        >
          <AuthNavBar />
        </div>
      </div>
    );
  };

  export default PageHeader;
