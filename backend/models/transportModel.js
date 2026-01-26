import mongoose from "mongoose";

const transportSchema = new mongoose.Schema({
    city: {
        type: String,
        required: true,
        default: "Pune"
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    trafficIndex: {
        type: Number,
        min: 0,
        max: 300,
        required: true
    },
    avgSpeed: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    congestionLevel: {
        type: Number,
        min: 0,
        max: 100,
        required: true
    },
    accidents: {
        type: Number,
        min: 0,
        default: 0
    },
    publicTransportUsage: {
        type: Number,
        min: 0,
        default: 0
    },
    // Additional fields for ML predictions
    dayOfWeek: {
        type: Number,
        min: 0,
        max: 6
    },
    month: {
        type: Number,
        min: 1,
        max: 12
    },
    year: {
        type: Number
    },
    hour: {
        type: Number,
        min: 0,
        max: 23
    },
    // For heatmap data
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [73.8567, 18.5204] // Pune coordinates
        }
    },
    // User who analyzed this data
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    username: {
        type: String
    },
    source: {
        type: String,
        enum: ["API", "User", "System", "Test", "Sample", "Mock", "Prediction"],
        default: "User"
    }
}, {
    timestamps: true,
    indexes: [
        { city: 1, date: -1 },
        { userId: 1, date: -1 }
    ]
});

// Add compound index for efficient queries
transportSchema.index({ city: 1, date: 1 });

const Transport = mongoose.model("Transport", transportSchema);

export default Transport;