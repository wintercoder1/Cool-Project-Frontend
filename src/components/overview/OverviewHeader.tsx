import { CardHeader, CardTitle } from "@/components/ui/card";

const OverviewHeader = ({ categoryData, topic }) => {
  return (
    <CardHeader className="pb-2 ">
      {categoryData !== 'Financial Contributions' && (
        <CardTitle className="text-2xl font-bold">
          Overview for {topic}
        </CardTitle>
      )}
      {categoryData === 'Financial Contributions' && (
        <CardTitle className="text-2xl font-bold pb-8">
          Financial Contributions Overview for {topic}
        </CardTitle>
      )}
    </CardHeader>
  );
};

export default OverviewHeader;