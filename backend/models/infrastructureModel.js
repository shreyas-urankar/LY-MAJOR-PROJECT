import mongoose from "mongoose";

const infrastructureSchema = new mongoose.Schema(
    {
        city: {
            type: String,
            required: true,
            default: "Pune"
        },
        year: {
            type: Number,
            required: true
        },
        roadsKm: {
            type: Number,
            required: true
        },
        hospitals: {
            type: Number,
            required: true
        },
        schools: {
            type: Number,
            required: true
        },
        housingIndex: {
            type: Number,
            min: 0,
            max: 100,
            required: true
        },
        waterSupply: {
            type: String,
            enum: ["Low", "Medium", "High", "Excellent"],
            default: "Medium"
        },
        powerAvailability: {
            type: String,
            enum: ["<8hrs", "8-12hrs", "12-16hrs", ">16hrs", "24hrs"],
            default: "12-16hrs"
        },
        smartCityScore: {
            type: Number,
            min: 0,
            max: 100,
            default: 65
        },
        populationServed: {
            type: Number
        },
        wardWiseData: [
            {
                wardName: String,
                wardNumber: Number,
                roadsKm: Number,
                hospitals: Number,
                schools: Number,
                housingIndex: Number
            }
        ]
    },
    {
        timestamps: true
    }
);

// Unique index: city + year
infrastructureSchema.index({ city: 1, year: 1 }, { unique: true });

// ✅ Create model ONCE and export it
const Infrastructure = mongoose.model(
    "Infrastructure",
    infrastructureSchema
);

export default Infrastructure;