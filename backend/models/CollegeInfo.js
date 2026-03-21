const mongoose = require('mongoose');

const editorialMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true }
}, { _id: false });

const collegeInfoSchema = new mongoose.Schema({
  college_name:      { type: String, default: 'Gobi Arts & Science College' },
  logo_url:          { type: String, default: '' },
  logo_public_id:    { type: String, default: '' },
  principal_photo_url:    { type: String, default: '' },
  principal_photo_public_id: { type: String, default: '' },
  principal_name:    { type: String, default: 'Prof. Dr. V. Thiagarasu' },
  accreditation:     { type: String, default: "Govt. Aided Autonomous Co-educational Institution Affiliated to Bharathiar University, Coimbatore. Reaccredited with 'A' Grade by NAAC [3rd Cycle], Nationally Ranked by, NIRF, MHRD, Govt. of India" },
  address:           { type: String, default: 'Gobichettipalayam – 638 453' },
  email:             { type: String, default: 'gobiartscollege@sancharnet.in' },
  phone:             { type: String, default: '04285 - 240147, 241139, 240741' },
  website:           { type: String, default: 'www.gobiartscollege.org' },
  established_year:  { type: String, default: '1968' },
  vision:            { type: String, default: 'Social and Economic upliftment of the people of this area through value based quality Education' },
  mission:           { type: String, default: 'Committed to serve the society with humility and trust, devoid of exploitation; to impart value based higher education, particularly to the socially and economically deprived sections of this area; to make students of this institution worthy citizens of our glorious motherland' },
  editorial_board:   { type: [editorialMemberSchema], default: [] }
}, { timestamps: true });

module.exports = mongoose.model('CollegeInfo', collegeInfoSchema);
