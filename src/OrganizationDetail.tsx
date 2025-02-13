import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'react-router-dom';

const OrganizationDetail = () => {

  const location = useLocation();
  const organizationData = location.state; 

  // console.log("OrganizationDetail   topic ", info['topic'] );
  // console.log("OrganizationDetail   lean ", info['lean'] );
  // console.log("OrganizationDetail   rating ", info['rating']);
  // console.log("OrganizationDetail   context ", info.context );
  // console.log("OrganizationDetail   citation ", info.citation );

  // Default data if none provided
  const defaultData = {
    timestamp: "2024-11-15T05:17:32.156000",
    citation: "none",
    context: "Organization context will be displayed here.",
    lean: "conservative",
    rating: 4,
    topic: "Organization Name"
  };

  // Use provided data or fall back to default
  const {
    topic,
    lean,
    rating,
    context,
    citation
  } = organizationData || defaultData;

  return (
    <Card className="w-screen  mx-auto content-around px-20 py-10 bg-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-2xl font-bold">
          Overview for {topic}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Lean and Rating */}
        <div className="space-y-1">
          <div className="text-lg">
            Lean: {lean.trim()}
          </div>
          <div className="text-lg">
            Rating {rating}
          </div>
        </div>

        {/* Context */}
        <div className="text-base">
          {context}
        </div>

        {/* Citations */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Citations:</h3>
          {/* <div className="text-blue-600 underline">  */} {/* Add link highlights once citatations get implemented */}
          <div className="text-base">
            {citation !== "none" ? citation : "No citations available"}
          </div>
        </div>

        {/* Financial Contributions */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Financial Contributions:</h3>
          <div className="text-base">
            Information about financial contributions will be displayed here.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrganizationDetail;


{/* <OrganizationDetail data={organizationData} /> */}