import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrganizationDetail = ({ data }) => {
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
  } = data || defaultData;

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
          <div className="text-blue-600 underline">
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