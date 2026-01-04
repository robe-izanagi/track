require('dotenv').config();
const connectDB = require('../db'); // your DB connection util
const AccountCode = require('../models/AccountCode');

(async () => {
  await connectDB(process.env.MONGO_URI || 'mongodb://localhost:27017/track');

  try {
    const userCode = [
      { accountCode1: '10145admin', accountCode2: '10145admin2', userType: 'admin', generateBy: 'default' },
      { accountCode1: '10145user', accountCode2: '10145user2', userType: 'user', generateBy: 'default' },
    ];

    for (const u of userCode) {
      const exists = await AccountCode.findOne({ accountCode1: u.accountCode1, accountCode2: u.accountCode2 });
      if (!exists) {
        await new AccountCode({ ...u, usedBy: null }).save();
        console.log('Created Account Code:', u.accountCode1, u.accountCode2);
      } else {
        console.log('Already exists:', u.accountCode1, u.accountCode2);
      }
    }

    console.log('Seeding finished.');
    process.exit(0);
  } catch (err) {
    console.error('SeedUsers error:', err);
    process.exit(1);
  }
})();
