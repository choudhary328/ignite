import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    // Keeping date/time as strings to match existing data usage in the app
    date: { type: String, required: true },
    time: { type: String, required: true },
    location: { type: String, required: true },
    category: { type: String, default: "Technology" },
    maxParticipants: { type: Number, default: 100 },

    // Optional event image
    imageUrl: { type: String },

    // The user who created the event (not required to avoid breaking older records)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },

    // List of users who joined the event with attendance tracking
    participants: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: { type: String, enum: ['Registered', 'Attended'], default: 'Registered' },
        checkedInAt: { type: Date }
      }
    ],

    // --- NEW: Waitlist (Ignite 3.0) ---
    waitlist: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        joinedAt: { type: Date, default: Date.now }
      }
    ],

    // --- NEW: Event Details (User Features) ---
    deadline: { type: String }, // Registration deadline
    mode: {
      type: String,
      enum: ['Offline', 'Online'],
      default: 'Offline',
      set: (v) => v ? v.charAt(0).toUpperCase() + v.slice(1).toLowerCase() : 'Offline'
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved'
    },
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
