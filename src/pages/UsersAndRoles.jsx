// npm install @faker-js/faker
// needed to generate fake testing data

import React, { useState } from 'react';
import { faker } from '@faker-js/faker';
import './UsersAndRoles.css';
import { FaEdit, FaUserPlus, FaUserMinus } from 'react-icons/fa';
import { Link } from 'react-router-dom'

// generate 25 fake users based user tiers
const generateFakeUsers = () => {
  const roles = ['Admin', 'Editor', 'Viewer', 'MEBA Member'];
  return Array.from({ length: 25 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(roles),
    email: faker.internet.email(),
  }));
};

// define functionality
const UsersAndRoles = () => {
  const [searchWord, setSearchWord] = useState('');
  //populate with generateFakeUsers
  const [users, setUsers] = useState(generateFakeUsers());
  //remove case sensitivity
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(searchWord.toLowerCase()) ||
    user.role.toLowerCase().includes(searchWord.toLowerCase())
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

              {/*Button that links to the edit user page*/}
              <Link to={'/edituser'} state={user}>
                <button className="edit-button" title="Edit Role">
                  <FaEdit />
                </button>
              </Link>
            </div>
            <div className="grid-cell">{user.role}</div>
            <div className="grid-cell">{user.name}</div>
            <div className="grid-cell">{user.email}</div>

            {/*Button that deletes a user; NOT IMPLEMENTED WITH SUPABASE YET*/}
            <button 
              className="remove-button" 
              title="Remove User" 
              onClick={() => {setUsers(users.filter(a => a.id !== user.id))}}
            >
              <FaUserMinus />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersAndRoles;
