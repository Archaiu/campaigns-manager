const Navbar = ({ balance, setView, setEditingCampaign, onLogout }) => {
  return (
    <nav className="sticky top-0 z-50 w-full bg-blue-900 shadow-md">
      <div className="container mx-auto flex justify-between items-center p-4">
        <div className="font-bold text-white">
          Budget: <span className="ml-2 text-amber-300">{balance} PLN</span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditingCampaign(-1);
              setView("addingCampaign");
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold"
          >
            + Add Campaign
          </button>
          <button
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;