import React, { useState, useRef, useEffect } from "react";
import supabase from "../../supabaseClient"; // Make sure path is correct

const ImageDropdown = ({ userId, currentRole, onRoleChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedRole, setSelectedRole] = useState(currentRole);
  const selectRef = useRef(null);
  const containerRef = useRef(null);

  const roles = ["Admin", "Editor", "Viewer", "MEBA Member"];

  // Focus the dropdown immediately on open
  useEffect(() => {
    if (showDropdown && selectRef.current) {
      selectRef.current.focus();
    }
  }, [showDropdown]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageClick = () => {
    setShowDropdown(true);
  };

  const handleSelectChange = async (e) => {
    const newRole = e.target.value;
    setSelectedRole(newRole);
    setShowDropdown(false);

    // Update in Supabase
    const { error } = await supabase
      .from("Users")
      .update({ role_id: newRole }) // or the actual column name
      .eq("id", userId);

    if (error) {
      console.error("Error updating role:", error.message);
      alert("Failed to update role.");
    } else {
      console.log(`Updated user ${userId} role to ${newRole}`);
      // Optionally notify parent component
      if (onRoleChange) onRoleChange(newRole);
    }
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <img
        src="null"
        alt="Edit"
        style={{ cursor: "pointer" }}
        onClick={handleImageClick}
      />

      {showDropdown && (
        <select
          ref={selectRef}
          onChange={handleSelectChange}
          value={selectedRole || ""}
          style={{
            position: "absolute",
            top: "45px",
            left: 0,
            zIndex: 1000,
            padding: "5px",
          }}
        >
          <option value="" disabled>Select a role</option>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default ImageDropdown;
