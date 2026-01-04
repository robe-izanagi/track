// import React, { useState } from 'react';

// const UserDashboard: React.FC = () => {
//   // two codes for better security
//   const [accountCode1, setAccountCode1] = useState([]) // array of account code
//   const [accountCode2, setAccountCode2] = useState([]) // array of account code
//   const [num, setNum] = useState(0)
  
//   const handleCode = () => {
//     // generate account code's, depends on number of n
//     // the code should be contain lower/upper case and number, and min lenght of 8
//     // accountCode1 and accountCode2 should be different value, but same concept of code
//     for (let i = 0; i < num; i++) {
//       //  accountCode1 generate code -> push that code, till num
//       //  accountCode2 generate code -> push that code, till num
//     }

//     // then post it to the db
//   }
  
//   return (
//     <div style={{ padding: '20px' }}>
//       <h1>Welcome to UserDashboard!</h1>
//       <p>You are logged in.</p>
//       <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login'; }}>Logout</button>

//       <form onSubmit={handleCode}>
//         <h1>Generate Account Code</h1>
//         <label htmlFor="number">Quantity Number: </label>
//         <input type="number" placeholder='quantity' onChange={(e) => setNum(Number(e.target.value))}/>
//         <button type='submit'>Generate</button>
//       </form>
//     </div>
//   );
// };

// export default UserDashboard;

// import React from 'react'

function UserDashboard() {
  return (
    <div>UserDashboard</div>
  )
}

export default UserDashboard