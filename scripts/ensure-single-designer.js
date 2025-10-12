const mongoose = require('mongoose');
const User = require('../models/user');

mongoose.connect('mongodb://localhost:27017/designden')
  .then(async () => {
    console.log('MongoDB Connected');
    
    // Find the main designer account
    const mainDesigner = await User.findOne({ email: 'designer@designden.com', role: 'designer' });
    
    if (!mainDesigner) {
      // Create the main designer if doesn't exist
      const newDesigner = new User({
        username: 'Designer',
        email: 'designer@designden.com',
        password: 'designer123', // You should use a secure password
        role: 'designer',
        approved: true
      });
      await newDesigner.save();
      console.log('✅ Created main designer account: designer@designden.com');
    } else {
      console.log('✅ Main designer account exists: designer@designden.com');
      console.log('   Username:', mainDesigner.username);
      console.log('   ID:', mainDesigner._id);
    }
    
    // Remove all other designer accounts
    const otherDesigners = await User.find({ 
      role: 'designer', 
      email: { $ne: 'designer@designden.com' } 
    });
    
    if (otherDesigners.length > 0) {
      console.log(`\n⚠️  Found ${otherDesigners.length} other designer account(s):`);
      otherDesigners.forEach(d => {
        console.log(`   - ${d.email} (${d.username})`);
      });
      
      await User.deleteMany({ 
        role: 'designer', 
        email: { $ne: 'designer@designden.com' } 
      });
      console.log('✅ Removed all other designer accounts');
    } else {
      console.log('✅ No other designer accounts found');
    }
    
    // Count final designers
    const finalCount = await User.countDocuments({ role: 'designer' });
    console.log(`\n📊 Total designers in database: ${finalCount}`);
    
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
