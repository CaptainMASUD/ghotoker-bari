import React, { useState, useEffect } from "react";
import axios from "axios";

// Admin Membership Management Component
const MembershipManagement = () => {
  const [memberships, setMemberships] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    duration: "",
    features: "",
  });
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedMembership, setSelectedMembership] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch memberships
  useEffect(() => {
    axios
      .get("http://localhost:4000/api/memberships")
      .then((response) => {
        setMemberships(response.data);
      })
      .catch((err) => {
        setError("Error fetching memberships");
      });
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle submit for creating a membership
  const handleCreateMembership = (e) => {
    e.preventDefault();
    const membershipData = {
      name: formData.name,
      price: formData.price,
      duration: formData.duration,
      features: formData.features.split(","),
    };
    axios
      .post("http://localhost:4000/api/memberships", membershipData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((response) => {
        setSuccessMessage("Membership created successfully!");
        setFormData({ name: "", price: "", duration: "", features: "" });
      })
      .catch((err) => {
        setError("Error creating membership");
      });
  };

  // Handle assigning membership to user
  const handleAssignMembership = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:4000/api/memberships/assign",
        { userId: selectedUser, membershipId: selectedMembership },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      )
      .then((response) => {
        setSuccessMessage("Membership assigned successfully!");
        setSelectedUser("");
        setSelectedMembership("");
      })
      .catch((err) => {
        setError("Error assigning membership");
      });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6">Admin Membership Management</h2>

      {error && <div className="text-red-600">{error}</div>}
      {successMessage && <div className="text-green-600">{successMessage}</div>}

      {/* Create Membership Form */}
      <div className="mb-6">
        <h3 className="text-xl font-medium">Create Membership</h3>
        <form onSubmit={handleCreateMembership} className="space-y-4">
          <div>
            <label className="block">Name:</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Price:</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Duration (in days):</label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Features (comma separated):</label>
            <input
              type="text"
              name="features"
              value={formData.features}
              onChange={handleChange}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Create Membership
          </button>
        </form>
      </div>

      {/* Assign Membership to User */}
      <div>
        <h3 className="text-xl font-medium">Assign Membership</h3>
        <form onSubmit={handleAssignMembership} className="space-y-4">
          <div>
            <label className="block">User ID:</label>
            <input
              type="text"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>

          <div>
            <label className="block">Select Membership:</label>
            <select
              value={selectedMembership}
              onChange={(e) => setSelectedMembership(e.target.value)}
              className="mt-1 block w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="">Select Membership</option>
              {memberships.map((membership) => (
                <option key={membership._id} value={membership._id}>
                  {membership.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
          >
            Assign Membership
          </button>
        </form>
      </div>
    </div>
  );
};

export default MembershipManagement;
