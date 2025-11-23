const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin', 'courier'],
    default: 'customer'
  }, 
  

  favorites: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }
  ],
 
  savedAddresses: [
    {
      title: String, // Örn: "Ev", "Ofis - Londra"
      recipientName: String,
      recipientPhone: String,
      address: String,
      city: String,
      postcode: String
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);