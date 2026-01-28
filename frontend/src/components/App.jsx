import { useState, useEffect } from "react";
import MainPageForUser from "./MainPageForUser";
import CampaignForm from "./CampaignForm";
import LoginForm from "./LoginForm";
import apiClient from "../utils/apiClient";
import "../styles/LoginForm.css";

const INITIAL_CAMPAIGNS = [];

function App() {
  const [campaigns, setCampaigns] = useState(INITIAL_CAMPAIGNS);
  const [balance, setBalance] = useState(10000);
  const [view, setView] = useState("mainPage");
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [user, setUser] = useState(null);
  const [loginMessage, setLoginMessage] = useState("");

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (savedUser && token) {
      setUser(JSON.parse(savedUser));
    }

    apiClient.setTokenExpiredHandler((errorMessage) => {
      setUser(null);
      setLoginMessage(errorMessage || "Token wygasł, zaloguj się ponownie");
    });
  }, []);

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get('/campaigns');
      setCampaigns(data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCampaigns();
    }
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setView("mainPage");
    setLoginMessage("");
  };

  if (!user) {
    return <LoginForm setUser={setUser} message={loginMessage} />;
  }

  return (
    <div>
      {view === "mainPage" ? ( 
        <MainPageForUser
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          balance={balance}
          setBalance={setBalance}
          setView={setView}
          setEditingCampaign={setEditingCampaign}
          user={user}
          onLogout={handleLogout}
          fetchCampaigns={fetchCampaigns}
        />
      ) : (
        <CampaignForm
          campaigns={campaigns}
          setCampaigns={setCampaigns}
          balance={balance}
          setBalance={setBalance}
          setView={setView}
          editingCampaign={editingCampaign}
          setEditingCampaign={setEditingCampaign}
          fetchCampaigns={fetchCampaigns}
        />
      )}
    </div>
  );
}

export default App;