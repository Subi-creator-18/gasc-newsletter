require('dotenv').config();
console.log("ENV:", process.env.MONGODB_URI);
const mongoose = require('mongoose');
const Department = require('../models/Department');
const User = require('../models/User');
const CollegeInfo = require('../models/CollegeInfo');

const departments = [
  // AIDED
  { name: 'Tamil', type: 'aided', display_order: 1 },
  { name: 'English', type: 'aided', display_order: 2 },
  { name: 'Mathematics', type: 'aided', display_order: 3 },
  { name: 'Physics', type: 'aided', display_order: 4 },
  { name: 'Chemistry', type: 'aided', display_order: 5 },
  { name: 'Botany', type: 'aided', display_order: 6 },
  { name: 'Zoology', type: 'aided', display_order: 7 },
  { name: 'Commerce', type: 'aided', display_order: 8 },
  { name: 'Economics', type: 'aided', display_order: 9 },
  { name: 'Computer Science', type: 'aided', display_order: 10 },
  { name: 'Political Science', type: 'aided', display_order: 11 },
  { name: 'History', type: 'aided', display_order: 12 },
  // UNAIDED
  { name: 'English (Unaided)', type: 'unaided', display_order: 1 },
  { name: 'Mathematics (Unaided)', type: 'unaided', display_order: 2 },
  { name: 'Physics (Unaided)', type: 'unaided', display_order: 3 },
  { name: 'Commerce (CA)', type: 'unaided', display_order: 4 },
  { name: 'Management (BBA)', type: 'unaided', display_order: 5 },
  { name: 'Computer Science (Unaided)', type: 'unaided', display_order: 6 },
  { name: 'Information Technology', type: 'unaided', display_order: 7 },
  { name: 'Management (MBA)', type: 'unaided', display_order: 8 },
  { name: 'Computer Applications (MCA)', type: 'unaided', display_order: 9 },
  // FORUMS & OTHERS
  { name: 'NSS', type: 'forum', display_order: 1 },
  { name: 'Youth Red Cross (YRC)', type: 'forum', display_order: 2 },
  { name: 'Fine Arts Club', type: 'forum', display_order: 3 },
  { name: 'Blood Donors Club', type: 'forum', display_order: 4 },
  { name: 'Career Guidance & Placement Cell', type: 'forum', display_order: 5 },
  { name: 'GASC Alumni Association', type: 'forum', display_order: 6 },
  { name: 'Physical Education', type: 'forum', display_order: 7 },
  { name: 'General', type: 'forum', display_order: 8 }
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Department.deleteMany({});
    await User.deleteMany({});
    await CollegeInfo.deleteMany({});
    console.log('🧹 Cleared existing data');

    // Create departments
    const createdDepts = await Department.insertMany(departments);
    console.log(`✅ Created ${createdDepts.length} departments`);

    // Map department name to _id
    const deptMap = {};
    createdDepts.forEach(d => { deptMap[d.name] = d._id; });

    // Create principal (no department)
    await User.create({
      name: 'Prof. Dr. V. Thiagarasu',
      email: 'principal@gasc.edu',
      password: 'Principal@123',
      role: 'principal',
      department_id: null,
      designation: 'Principal'
    });
    console.log('✅ Created principal account: principal@gasc.edu / Principal@123');

    // Create sample staff for key departments
    const staffAccounts = [
      { name: 'Dr. M.R. Kumaraswamy', email: 'english.staff@gasc.edu', dept: 'English', designation: 'Head & Asst. Professor of English' },
      { name: 'Mr. K.N. Elangovan', email: 'tamil.staff@gasc.edu', dept: 'Tamil', designation: 'Assistant Professor of Tamil' },
      { name: 'Dr. P. Duraisamy', email: 'math.staff@gasc.edu', dept: 'Mathematics', designation: 'Assistant Professor of Mathematics' },
      { name: 'Mrs. V. Mahalakshmi', email: 'physics.staff@gasc.edu', dept: 'Physics', designation: 'Assistant Professor of Physics' },
      { name: 'Dr. A. Ilamparithi', email: 'chemistry.staff@gasc.edu', dept: 'Chemistry', designation: 'Assistant Professor of Chemistry' },
      { name: 'Ms. B.K. Karthikeyini', email: 'botany.staff@gasc.edu', dept: 'Botany', designation: 'Assistant Professor of Botany' },
      { name: 'Dr. M. Raju', email: 'economics.staff@gasc.edu', dept: 'Economics', designation: 'Assistant Professor of Economics' },
      { name: 'Dr. P. Saminathan', email: 'commerce.staff@gasc.edu', dept: 'Commerce', designation: 'Associate Professor of Commerce' },
      { name: 'Mr. P. Narendran', email: 'cs.staff@gasc.edu', dept: 'Computer Science', designation: 'Assistant Professor of CS' },
      { name: 'Dr. S. Saravanakumar', email: 'polsci.staff@gasc.edu', dept: 'Political Science', designation: 'Assistant Professor' },
      { name: 'Dr. K. Vasudevan', email: 'mgmt.staff@gasc.edu', dept: 'Management (BBA)', designation: 'Assistant Professor' },
      { name: 'Mrs. S. Annapoorani', email: 'csunaided.staff@gasc.edu', dept: 'Computer Science (Unaided)', designation: 'Assistant Professor' },
      { name: 'Mr. NSS Coordinator', email: 'nss.staff@gasc.edu', dept: 'NSS', designation: 'NSS Programme Officer' }
    ];

    for (const s of staffAccounts) {
      await User.create({
        name: s.name,
        email: s.email,
        password: 'Staff@123',
        role: 'staff',
        department_id: deptMap[s.dept] || null,
        designation: s.designation
      });
    }
    console.log(`✅ Created ${staffAccounts.length} staff accounts (password: Staff@123)`);

    // Create college info singleton
    await CollegeInfo.create({
      editorial_board: [
        { name: 'Prof. Dr. V. Thiagarasu', role: 'Patron' },
        { name: 'Dr. S.M. Jagatheesan', role: 'Editor' },
        { name: 'Dr. M.R. Kumaraswamy', role: 'Joint Editor' },
        { name: 'Dr. G.T. Prabhavathi', role: 'Member' },
        { name: 'Dr. T.K. Shanmugam', role: 'Member' },
        { name: 'Dr. R. Nagarajan', role: 'Member' },
        { name: 'Mrs. K.E. Rathiya', role: 'Member' },
        { name: 'Mrs. A.P. Nandhini', role: 'Member' },
        { name: 'Mr. S. Santhosh Kumar', role: 'Member' },
        { name: 'Mr. S. Chakkarapani', role: 'Member' }
      ]
    });
    console.log('✅ Created college info');

    console.log('\n🎉 Seed complete!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Principal: principal@gasc.edu / Principal@123');
    console.log('Staff:     cs.staff@gasc.edu  / Staff@123');
    console.log('Staff:     tamil.staff@gasc.edu / Staff@123');
    console.log('(All staff password: Staff@123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
