import React from "react";
import Item from "./Item";

const CampaignList = ({
  campaigns,
  setCampaigns,
  setBalance,
  setView,
  setEditingCampaign,
  fetchCampaigns,
}) => {
  return (
    <div className="overflow-hidden">
      <div className="grid grid-cols-12 gap-4 p-4 font-semibold border-b">
        <div className="col-span-2">Name </div>
        <div className="col-span-2">Keywords </div>
        <div className="col-span-1 text-center">Bid </div>
        <div className="col-span-1 text-center">Fund </div>
        <div className="col-span-1 text-center">Status </div>
        <div className="col-span-2 text-center">Town </div>
        <div className="col-span-1 text-center">Radius </div>
        <div className="col-span-2 text-end">Actions </div>
      </div>
      <div>
        {campaigns.map((campaign, index) => (
          <Item
            key = {campaign._id}
            index = {index}
            campaign = {campaign}
            setCampaigns = {setCampaigns}
            setBalance = {setBalance}
            setView = {setView}
            setEditingCampaign = {setEditingCampaign}
            fetchCampaigns = {fetchCampaigns}
          />
        ))}
      </div>
    </div>
  );
};

export default CampaignList;