// npm install @faker-js/faker
// needed to generate fake testing data

import React, { useState, useEffect } from 'react';
import { useContext } from 'react';
import { faker } from '@faker-js/faker';
import './UsersAndRoles.css';
import { FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import supabase from '../supabaseClient';
import ImageDropdown from '../components/ImageDropdown/ImageDropdown'
  
const getAllUsers = async () => {
  const { data, error } = await supabase.from("Users").select("*");

  if (error) {
    console.log("Error fetching users:", error);
    return [];
  }

  return data;
};

// define functionality
const UsersAndRoles = () => {
  const [searchWord, setSearchWord] = useState('');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const supabaseUsers = await getAllUsers();
      console.log("Fetched users:", supabaseUsers);
      setUsers(supabaseUsers);
    }

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    String(user.first_name || "")
      .toLowerCase()
      .includes(searchWord.toLowerCase()) ||
    String(user.role_id || "")
      .toLowerCase()
      .includes(searchWord.toLowerCase())
  );

  // good ole div block
  // structure of page below
  return (
    <div className="users-roles-container">
      <h1>Maritime Assign Role Manager</h1>
      <div className='flex justify-center gap-2'>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search by name or role..."
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            className="search-input"
          />
        </div>
        {/*Button that links to the add user page; Add link later*/}
        <Link className='content-center'>
          <button className="add-button" title="Add User">
            <FaUserPlus/>
          </button>
        </Link>
      </div>

      <div className="grid-container">
        <div className="grid-header">
          <div className="grid-cell"></div>
          <div className="grid-cell">Role
            <span className="info-icon" title="Roles: Admin, Editor, Viewer, MEBA Member">
              🔍
            </span>
          </div>
          <div className="grid-cell">Name</div>
          <div className="grid-cell">Email</div>
        </div>
        {filteredUsers.map((user) => (
          <div className="grid-row" key={user.id}>
            <div className="grid-cell">
              <ImageDropdown 
                userId={user.id} 
                currentRole={user.role_id}
                onRoleChange={(newRole) => {
                  console.log(`User ${user.id} changed role to: ${newRole}`);
                }}
              />
            </div>
            <div className="grid-cell">{user.first_name}</div>
            <div className="grid-cell">{user.email}</div>

           {/*Button that links to the edit user page*/}
              <Link to={'/edituser'} state={user}>
                <button className="edit-button" title="Edit Role">
                  <FaEdit />
                </button>
              </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersAndRoles;
