import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate} from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
  } from "@/components/ui/dialog";

const OrganizationQuery = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [onClose, setOnClose] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the search submission here
    console.log('User typed in:', searchTerm);
    fetchData(searchTerm)
    openWaitingPageCurrentTab()
  };

  const fetchData = async (query_topic) => {
    // query_topic = query_topic.trim()
    try {
      const response = await fetch(`http://18.188.2.109:443/getPoliticalLeaning/${query_topic}`);
    //   const response = await fetch(`http://127.0.0.1:8000/getPoliticalLeaning/${query_topic}`);
      if (!response.ok) {
        handleErrorOnUI()
        throw new Error('Network response was not ok');
      }
      const jsonData = await response.json();
      console.log('data fetched:')
      console.log(jsonData)
      openDetailPageCurrentTab(jsonData)
    //   setData(jsonData);
    } catch (err) {
    //   setError(err.message);
      console.error('Error fetching data:', err);
      handleErrorOnUI()
    }
  };

  const openDetailPageCurrentTab = (organization) => {
    navigate('/organization', { state: organization});
  };

  const openWaitingPageCurrentTab = () => {
    navigate('/waiting', {});
  };

  const handleErrorOnUI = () => {
    console.log('dialog should show now')
    setErrorMessage('Something went wrong!');
    // setIsError(true);
    setIsOpen(true)
  };


  const ErrorPopup = ({ isOpen, onClose, errorMessage }) => {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription className="text-red-500">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
          <DialogClose asChild>
            <Button>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen w-screen flex items-center py-10 justify-center bg-white">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 px-6 pb-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="text-center space-y-6">
              <h1 className="text-xl font-medium">
                What organization do you want to find 
                <br />
                the political leaning of?
              </h1>
              
              <Input
                type="text"
                placeholder="Type here."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border-2 rounded-md px-4 py-2 text-gray-600"
              />
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit"
                className="bg-blue-100 hover:bg-blue-200 text-gray-800 px-6 py-2 rounded-md"
              >
                Continue
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationQuery;