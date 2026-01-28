import Navbar from "./Navbar";
import CampaignList from "./CampaignList";

const Home = ({ 
  campaigns, 
  setCampaigns, 
  balance, 
  setBalance, 
  setView, 
  setEditingCampaign 
}) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar 
        balance={balance} 
        setView={setView}
        setEditingCampaign={setEditingCampaign}
      />

      <div className="container mx-auto p-6">
        <CampaignList 
          campaigns={campaigns} 
          setCampaigns={setCampaigns}
          setBalance={setBalance}
          setView={setView}       
          setEditingCampaign={setEditingCampaign} 
        />
      </div>
    </div>
  );
};

export default Home;