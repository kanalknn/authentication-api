const adminModel = require('../../models/admin.model');
const { validateEmail, validatePassword } = require('../../utilities/validators');

exports.createAdmin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!validateEmail(email)) {
      throw new Error('Invalid email format');
    }

    if (!validatePassword(password)) {
      throw new Error('Password must be at least 6 characters');
    }

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      throw new Error('Invalid admin role');
    }

    const admin = await adminModel.createAdmin(email, password, role);
    
    res.status(201).json({ 
      success: true,
      admin: { 
        id: admin.id, 
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateAdminRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'editor', 'viewer'].includes(role)) {
      throw new Error('Invalid admin role');
    }

    const admin = await adminModel.updateAdminRole(parseInt(id), role);
    
    res.json({ 
      success: true,
      admin: { 
        id: admin.id, 
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

