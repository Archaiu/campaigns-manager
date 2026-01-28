import React, { useState } from "react";
import apiClient from "../utils/apiClient";

const POLISH_TOWNS = [
  "Warszawa", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", 
  "Szczecin", "Bydgoszcz", "Lublin", "Białystok", "Katowice", 
  "Olsztyn", "Rzeszów", "Kielce", "Toruń", "Opole", 
  "Zielona Góra", "Gorzów Wielkopolski"
];

const PREDEFINED_KEYWORDS = [
  "Sales", "Clothing", "Electronics", "Summer", "Winter", 
  "Promotion", "New Arrival", "Discount", "Premium"
];

const INITIAL_FORM_STATE = {
  keywords: "",
  bidAmount: "",
  fund: "",
  status: "on",
  town: "",
  radius: "",
};

const FormField = ({ label, error, children }) => (
  <div className="flex flex-col">
    <label className="font-semibold">{label}</label>
    {children}
    {error && <span className="text-xs">{error}</span>}
  </div>
);

const ActionButtons = ({ isEditing, onCancel }) => {
  return (
    <div className="flex gap-4">
      <button
        type="submit"
        className={`flex-1 px-4 py-2 rounded text-white font-bold ${
          isEditing ? "bg-blue-600" : "bg-emerald-600"
        }`}
      >
        {isEditing ? "Save Changes" : "Add Campaign"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded"
      >
        Cancel
      </button>
    </div>
  );
};

const CampaignForm = ({
  campaigns,
  setCampaigns,
  balance,
  setBalance,
  setView,
  editingCampaign,
  setEditingCampaign,
  fetchCampaigns,
}) => {
  const isEditing = editingCampaign !== -1;
  
  const [formData, setFormData] = useState(
    isEditing ? campaigns[editingCampaign] : INITIAL_FORM_STATE
  );
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.keywords.trim()) newErrors.keywords = "Keywords are required";
    
    if (!formData.bidAmount || isNaN(formData.bidAmount) || Number(formData.bidAmount) <= 0) {
      newErrors.bidAmount = "Bid amount must be greater than 0";
    }
    
    if (!formData.radius || isNaN(formData.radius) || Number(formData.radius) <= 0) {
      newErrors.radius = "Radius must be greater than 0";
    }

    const currentFund = isEditing ? Number(campaigns[editingCampaign].fund) : 0;
    const availableBalance = balance + currentFund;  
    if (!formData.fund || isNaN(formData.fund) || Number(formData.fund) <= 0) {
      newErrors.fund = "Fund is required and must be > 0";
    } else if (Number(formData.fund) > availableBalance) {
      newErrors.fund = `Insufficient funds. Max: ${availableBalance}`;
    }
    if (!formData.town.trim()) newErrors.town = "Town is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    const fundNum = Number(formData.fund);

    try {
      if (isEditing) {
        const oldFund = Number(campaigns[editingCampaign].fund);
        const fundDifference = fundNum - oldFund;

        await apiClient.put(`/campaigns/${formData._id}`, formData);
        setBalance((prev) => prev - fundDifference);
      } else {
        await apiClient.post('/campaigns', formData);
        setBalance((prev) => prev - fundNum);
      }
      
      await fetchCampaigns();
      setEditingCampaign(null);
      setView("mainPage");
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) { setErrors((prev) => ({ ...prev, [name]: null }));}
  };  

  const inputClass = (error) =>
    `border p-2 rounded w-full focus:outline-none ${
      error ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        {isEditing ? "Edit Campaign" : "New Campaign"}
      </h2>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <FormField label="Keywords" error={errors.keywords}>
          <input
            name="keywords"

            value={formData.keywords}
            onChange={handleChange}
            list="keywords-list"
            className={inputClass(errors.keywords)}
            placeholder="Select or type keywords"
          />
          <datalist id="keywords-list">
            {PREDEFINED_KEYWORDS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Bid Amount (PLN)" error= {errors.bidAmount}>
            <input
              type="number"
              name="bidAmount"

              value={formData.bidAmount}
              onChange={handleChange}
              className={inputClass(errors.bidAmount)}
            />
          </FormField>

          <FormField label="Campaign Fund (PLN)" error={errors.fund}>
            <input
              type="number"
              name="fund"

              value={formData.fund}
              onChange={handleChange}
              className={inputClass(errors.fund)}
            />
          </FormField>
        </div>

        <FormField label="Status" error ={errors.status}>
          <select
            name="status"

            value={formData.status}
            onChange={handleChange}
            className={inputClass(errors.status)}
          >
            <option value="on">On</option>
            <option value="off">Off</option>
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Town" error ={errors.town} >
            <input
              name="town"
              
              value={formData.town}
              onChange={handleChange}
              list="towns-list"
              className={inputClass(errors.town)}
              placeholder="Select town"
            />
            <datalist id="towns-list">
              {POLISH_TOWNS.map((town) => (
                <option key={town} value={town} />
              ))}
            </datalist>
          </FormField >

          <FormField label="Radius (km)" error={errors.radius}>
            <input
              type="number"
              name="radius"
              value={formData.radius}
              onChange={handleChange}
              className={inputClass(errors.radius)}
            />
          </FormField>
        </div>

        < ActionButtons 
          isEditing={isEditing} 
          onCancel={() => setView("mainPage")} 
        />
      </form>
    </div>
  );
};

export default CampaignForm;