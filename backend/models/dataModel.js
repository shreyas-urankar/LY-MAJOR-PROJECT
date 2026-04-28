// import mongoose from "mongoose";

// const dataSchema = new mongoose.Schema({
//   username: { type: String, required: true },
//   analysisResult: { type: String, required: true },
//   pollutionLevel: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
//   city: { type: String, required: true },
//   population: { type: String },
//   density: { type: String },
//   growth: { type: String },
//   urbanData: {
//     greenSpaces: { type: Number },
//     trafficIndex: { type: Number },
//     housingIndex: { type: Number },
//     employmentRate: { type: Number }
//   },
//   createdAt: { type: Date, default: Date.now }
// });

// const Data = mongoose.model("Data", dataSchema);
// export default Data;


import mongoose from "mongoose";

const dataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  username: {
    type: String,
    required: true
  },

  action: {
    type: String,
    enum: ["LOGIN", "REGISTER", "PREDICT", "VIEW_DASHBOARD"],
    default: "PREDICT"
  },

  analysisResult: {
    type: String,
    required: true
  },

  city: {
    type: String,
    required: true
  },

  pollutionLevel: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium"
  },

  population: { type: Number },
  density: { type: Number },
  growth: { type: Number },   // % growth

  year: {
    type: Number   // e.g. 2020
  },

  prediction: {
    urbanAreaPercent: { type: Number },
    accuracy: { type: Number },
    f1Score: { type: Number },
    iou: { type: Number }
  },

  modelInfo: {
    name: { type: String, default: "urban_growth_unet" },
    version: { type: String, default: "v1.0" }
  },

  urbanData: {
    greenSpaces: { type: Number },
    trafficIndex: { type: Number },
    housingIndex: { type: Number },
    employmentRate: { type: Number }
  },

  embedding: {
    type: [Number], // Array of floats from OpenAI embeddings
    default: []
  }

}, {
  timestamps: true
});

const Data = mongoose.model("Data", dataSchema);
export default Data;
