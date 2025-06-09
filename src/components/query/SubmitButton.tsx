import { Button } from "@/components/ui/button";

const SubmitButton = ({ 
  disabled = false, 
  children = "Continue", 
  className = "",
  ...buttonProps 
}) => {
  return (
    <div className="flex justify-center">
      <Button 
        type="submit"
        className={`bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md ${className}`}
        disabled={disabled}
        {...buttonProps}
      >
        {children}
      </Button>
    </div>
  );
};

export default SubmitButton;