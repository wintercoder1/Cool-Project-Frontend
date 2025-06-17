import LogoHeader from "../LogoHeader";

const PageHeader = ({ onLogoClick }) => {
    return (
      <div className="bg-white w-full pb-6" bg-white>
        <div className="flex justify-center top-0 w-full">
          <div className="absolute top-4 left-8 cursor-pointer">
            <LogoHeader onClick={onLogoClick} />
          </div>
        </div>
      </div>
    );
  };

  export default PageHeader;