import React, { useState } from 'react';
import './PasswordRecovery.css';

function PasswordRecovery() {

  const [text, setText] = useState("");

  const handleChange = (event) => {
    setText(event.target.value); // Update state with the input value
  };

  return (
    <div>
      <div className="top-strip"></div>
      <div className="titleContainer">
        <div className="content">
          <h2>Marine Engineers Beneficial Association (MEBA)</h2>
        </div>
      </div>

      <div className = "passwordContainer">
        <h3>Forgot Password?</h3>
        <div className="content">
          <label htmlFor="inputField">Enter Your E-mail address: </label>
          <input
            type="text"
            id="inputField"
            value={text}
            onChange={handleChange}
            placeholder="Type your email here"
          />
          <button className="recoveryButton">Send recovery email</button>

          <button className="backoutButton">BACK TO LOGIN PAGE</button>

        </div>
      </div>
      <div className="bottom-strip"></div>
    </div>
  );
}

export default PasswordRecovery;