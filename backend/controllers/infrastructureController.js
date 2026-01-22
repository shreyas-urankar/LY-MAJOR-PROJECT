import Infrastructure from "../models/infrastructureModel.js";

// Simple seed data matching your model
const initialData = [
    {
        city: "Pune",
        year: 2020,
        roadsKm: 450,
        hospitals: 45,
        schools: 320,
        housingIndex: 65,
        waterSupply: "Medium",
        powerAvailability: "12-16hrs",
        smartCityScore: 78,
        populationServed: 3500000
    },
    {
        city: "Pune",
        year: 2021,
        roadsKm: 480,
        hospitals: 48,
        schools: 335,
        housingIndex: 68,
        waterSupply: "Medium",
        powerAvailability: "12-16hrs",
        smartCityScore: 82,
        populationServed: 3600000
    },
    {
        city: "Pune",
        year: 2022,
        roadsKm: 510,
        hospitals: 52,
        schools: 350,
        housingIndex: 72,
        waterSupply: "High",
        powerAvailability: ">16hrs",
        smartCityScore: 85,
        populationServed: 3700000
    },
    {
        city: "Pune",
        year: 2023,
        roadsKm: 540,
        hospitals: 55,
        schools: 365,
        housingIndex: 75,
        waterSupply: "High",
        powerAvailability: ">16hrs",
        smartCityScore: 88,
        populationServed: 3800000
    },
    {
        city: "Pune",
        year: 2024,
        roadsKm: 570,
        hospitals: 58,
        schools: 380,
        housingIndex: 78,
        waterSupply: "Excellent",
        powerAvailability: "24hrs",
        smartCityScore: 90,
        populationServed: 3900000
    }
];

// ✅ Get infrastructure data by city (with auto-seed)
export const getInfrastructureByCity = async (req, res) => {
    try {
        const { city } = req.params;
        const cityName = city || "Pune";

        console.log(`📊 Fetching infrastructure data for city: ${cityName}`);

        // Check if data exists in database
        let infrastructureData = await Infrastructure.find({ city: cityName }).sort({ year: -1 });

        // If no data exists, seed initial data
        if (infrastructureData.length === 0) {
            console.log(`🌱 Seeding initial infrastructure data for ${cityName}...`);

            try {
                // Insert initial data
                const seedData = initialData.map(item => ({
                    ...item,
                    city: cityName
                }));

                await Infrastructure.insertMany(seedData);
                infrastructureData = await Infrastructure.find({ city: cityName }).sort({ year: -1 });

                console.log(`✅ Seeded ${infrastructureData.length} records for ${cityName} into MongoDB`);
            } catch (seedError) {
                console.error("❌ Seeding error:", seedError);
                // If seeding fails, return initial data anyway
                infrastructureData = initialData.filter(item => item.city === cityName);
            }
        }

        // Log user access
        const username = req.user?.username || "Anonymous";
        console.log(`👤 ${username} accessed infrastructure data for ${cityName} (${infrastructureData.length} records)`);

        // Return only needed fields for frontend
        const formattedData = infrastructureData.map(item => ({
            year: item.year,
            roadsKm: item.roadsKm,
            hospitals: item.hospitals,
            schools: item.schools,
            smartCityScore: item.smartCityScore,
            // Include other fields if needed
            housingIndex: item.housingIndex,
            waterSupply: item.waterSupply,
            powerAvailability: item.powerAvailability
        }));

        res.json({
            success: true,
            city: cityName,
            data: formattedData,
            count: formattedData.length,
            source: infrastructureData[0]?.createdAt ? "MongoDB Database" : "Seeded Data",
            message: "Infrastructure data retrieved successfully"
        });

    } catch (error) {
        console.error("❌ Error fetching infrastructure data:", error);
        res.status(500).json({
            success: false,
            message: "Server error while fetching infrastructure data",
            error: error.message
        });
    }
};

// ✅ Get all infrastructure data
export const getAllInfrastructure = async (req, res) => {
    try {
        const infrastructureData = await Infrastructure.find().sort({ city: 1, year: -1 });

        res.json({
            success: true,
            count: infrastructureData.length,
            data: infrastructureData,
            message: "All infrastructure data retrieved"
        });
    } catch (error) {
        console.error("❌ Error fetching all infrastructure data:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ✅ Add new infrastructure data (protected)
export const addInfrastructureData = async (req, res) => {
    try {
        const {
            city,
            year,
            roadsKm,
            hospitals,
            schools,
            housingIndex,
            waterSupply,
            powerAvailability,
            smartCityScore,
            populationServed
        } = req.body;

        // Validate required fields
        if (!city || !year || !roadsKm || !hospitals || !schools || !smartCityScore) {
            return res.status(400).json({
                success: false,
                message: "City, year, roads, hospitals, schools, and smartCityScore are required"
            });
        }

        // Check if data already exists for this city and year
        const existingData = await Infrastructure.findOne({ city, year });
        if (existingData) {
            return res.status(400).json({
                success: false,
                message: `Data already exists for ${city} in year ${year}`
            });
        }

        // Create new infrastructure record
        const newInfrastructure = new Infrastructure({
            city,
            year,
            roadsKm,
            hospitals,
            schools,
            housingIndex: housingIndex || 65,
            waterSupply: waterSupply || "Medium",
            powerAvailability: powerAvailability || "12-16hrs",
            smartCityScore,
            populationServed: populationServed || 0
        });

        await newInfrastructure.save();

        console.log(`✅ New infrastructure data added for ${city} (${year}) to MongoDB`);

        res.status(201).json({
            success: true,
            message: "Infrastructure data added successfully",
            data: newInfrastructure
        });

    } catch (error) {
        console.error("❌ Error adding infrastructure data:", error);
        res.status(500).json({
            success: false,
            message: "Server error while adding infrastructure data",
            error: error.message
        });
    }
};

// ✅ Get infrastructure analytics
export const getInfrastructureAnalytics = async (req, res) => {
    try {
        const analytics = await Infrastructure.aggregate([
            {
                $group: {
                    _id: "$city",
                    totalRoads: { $sum: "$roadsKm" },
                    totalHospitals: { $sum: "$hospitals" },
                    totalSchools: { $sum: "$schools" },
                    avgSmartScore: { $avg: "$smartCityScore" },
                    avgHousingIndex: { $avg: "$housingIndex" },
                    yearsTracked: { $addToSet: "$year" },
                    recordCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    city: "$_id",
                    totalRoads: 1,
                    totalHospitals: 1,
                    totalSchools: 1,
                    avgSmartScore: { $round: ["$avgSmartScore", 2] },
                    avgHousingIndex: { $round: ["$avgHousingIndex", 2] },
                    yearsTracked: { $size: "$yearsTracked" },
                    recordCount: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            success: true,
            data: analytics,
            message: "Infrastructure analytics retrieved"
        });
    } catch (error) {
        console.error("❌ Error fetching infrastructure analytics:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ✅ Get infrastructure trends for a city
export const getInfrastructureTrends = async (req, res) => {
    try {
        const { city } = req.params;
        const trends = await Infrastructure.find({ city })
            .sort({ year: 1 })
            .select("year roadsKm hospitals schools housingIndex smartCityScore -_id");

        res.json({
            success: true,
            city,
            data: trends,
            message: "Infrastructure trends retrieved"
        });
    } catch (error) {
        console.error("❌ Error fetching infrastructure trends:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

// ✅ Get infrastructure scorecard
export const getInfrastructureScorecard = async (req, res) => {
    try {
        const { city, year } = req.params;

        let query = { city };
        if (year) {
            query.year = parseInt(year);
        }

        const data = await Infrastructure.findOne(query).sort({ year: -1 });

        if (!data) {
            return res.status(404).json({
                success: false,
                message: `No infrastructure data found for ${city}${year ? ` in year ${year}` : ''}`
            });
        }

        // Calculate scores
        const score = {
            roadsScore: Math.min(100, (data.roadsKm / 1000) * 100),
            healthScore: Math.min(100, (data.hospitals / 100) * 100),
            educationScore: Math.min(100, (data.schools / 500) * 100),
            housingScore: data.housingIndex,
            smartCityScore: data.smartCityScore
        };

        const overallScore = (
            score.roadsScore * 0.2 +
            score.healthScore * 0.2 +
            score.educationScore * 0.2 +
            score.housingScore * 0.2 +
            score.smartCityScore * 0.2
        ).toFixed(1);

        res.json({
            success: true,
            city,
            year: data.year,
            scores: score,
            overallScore,
            data,
            message: "Infrastructure scorecard retrieved"
        });
    } catch (error) {
        console.error("❌ Error fetching infrastructure scorecard:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};