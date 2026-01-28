import React from "react";
import Keywords from "./Keywords";
import apiClient from "../utils/apiClient";

const Item = ({
  campaign,
  index,
  setCampaigns,
  setBalance,
  setView,
  setEditingCampaign,
  fetchCampaigns,
}) => {
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b items-center">
      <div className="col-span-2 font-bold">{campaign.name}</div>
      <div className="col-span-2">
        <Keywords text={campaign.keywords} />
      </div>
      <div className="col-span-1 text-center">{campaign.bidAmount}</div>
      <div className="col-span-1 text-center">{campaign.fund}</div>
      <div className="col-span-1 text-center">{campaign.status}</div>
      <div className="col-span-2 text-center">{campaign.town}</div>
      <div className="col-span-1 text-center">{campaign.radius} km</div>
      <div className="col-span-2 flex justify-end gap-2">
        <button
          onClick={() => {
            setEditingCampaign(index);
            setView("addingCampaign");
          }}
          className="font-medium"
        >
          Edit
        </button>
        <button
          onClick={async () => {
            try {
              await apiClient.delete(`/campaigns/${campaign._id}`);
              setBalance((prev) => prev + Number(campaign.fund));
              await fetchCampaigns();
            } catch (error) {
              console.error('Error deleting campaign:', error);
              alert('Failed to delete campaign');
            }
          }}
          className="font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default Item;