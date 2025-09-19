import bcrypt from 'bcryptjs';
import FirebaseModel from './firebaseModel.js';

class User extends FirebaseModel {
  constructor() {
    super('users');
  }

  // Override create to hash password before saving
  async create(userData) {
    // Hash password
    if (userData.password) {
      const salt = await bcrypt.genSalt(10);
      userData.password = await bcrypt.hash(userData.password, salt);
    }

    // Set default values
    const user = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'user',
      isVerified: userData.isVerified || false,
      otp: userData.otp || null,
      resetPasswordToken: userData.resetPasswordToken || null,
      resetPasswordExpires: userData.resetPasswordExpires || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return super.create(user);
  }

  // Override findByIdAndUpdate to handle password hashing if needed
  async findByIdAndUpdate(id, updateData) {
    // If updating password, hash it
    if (updateData.password || (updateData.$set && updateData.$set.password)) {
      const salt = await bcrypt.genSalt(10);
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, salt);
      } else if (updateData.$set && updateData.$set.password) {
        updateData.$set.password = await bcrypt.hash(updateData.$set.password, salt);
      }
    }

    // Always update the updatedAt timestamp
    if (updateData.$set) {
      updateData.$set.updatedAt = new Date();
    } else {
      updateData.updatedAt = new Date();
    }

    return super.findByIdAndUpdate(id, updateData);
  }

  // Compare password method
  async comparePassword(userId, candidatePassword) {
    const user = await this.findById(userId);
    if (!user) return false;
    return await bcrypt.compare(candidatePassword, user.password);
  }

  // Generate OTP method
  async generateOTP(userId) {
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    const otp = {
      code: otpCode,
      expiresAt: expiresAt
    };
    
    await this.findByIdAndUpdate(userId, { otp });
    return otpCode;
  }
}

const userModel = new User();
export default userModel;