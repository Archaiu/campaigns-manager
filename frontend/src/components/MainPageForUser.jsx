import Navbar from "./Navbar";
import CampaignList from "./CampaignList";

const MainPageForUser = ({ 
  campaigns, 
  setCampaigns, 
  balance, 
  setBalance, 
  setView, 
  setEditingCampaign,
  fetchCampaigns,
  onLogout 
}) => {
  return (
    <div className="min-h-screen">
      <Navbar 
        balance={balance} 
        setView={setView}
        setEditingCampaign={setEditingCampaign}
        onLogout={onLogout}
      />

      <div className="p-6">
        <CampaignList 
          campaigns={campaigns} 
          setCampaigns={setCampaigns}
          setBalance={setBalance}
          setView={setView}       
          setEditingCampaign={setEditingCampaign}
          fetchCampaigns={fetchCampaigns} 
        />
      </div>
    </div>
  );
};

export default MainPageForUser;
