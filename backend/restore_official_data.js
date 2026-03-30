const mongoose = require('mongoose');
require('dotenv').config();

async function restore() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to Atlas");

    const BatchSummary = require('./models/BatchSummary');

    const usar2025 = {
        college: 'USAR',
        batch_year: '2025',
        // Overall stats (from Image 1 & 2)
        total_students: 501,
        actively_participated: 251,
        total_companies: 80,       // 80+ visited
        companies_offered: 26,
        highest_package: 27,
        average_package: 6.11,
        median_package: 6,
        total_offers: 115,         // Total placed students (36+30+33+16)
        ppo_offers: 11,
        internship_offers: 5,
        placement_rate: 45.81,
        is_official: true,

        // Branch-level highest packages
        branch_highest: [
            { name: 'Industrial Internet of Things', value: 27 },
            { name: 'AI & Data Science',             value: 12 },
            { name: 'AI & Machine Learning',         value: 12 },
            { name: 'Automation & Robotics',         value: 8  }
        ],

        // Branch-level average packages
        branch_average: [
            { name: 'AI & Data Science',             value: 6.33 },
            { name: 'AI & Machine Learning',         value: 6.16 },
            { name: 'Automation & Robotics',         value: 5.95 },
            { name: 'Industrial Internet of Things', value: 5.88 }
        ],

        // Branch-level median packages
        branch_median: [
            { name: 'AI & Data Science',             value: 6.35 },
            { name: 'AI & Machine Learning',         value: 6    },
            { name: 'Automation & Robotics',         value: 6    },
            { name: 'Industrial Internet of Things', value: 4.5  }
        ],

        // Full branch breakdown for rich popup (from Image 3)
        branch_full: [
            {
                name: 'AI & Data Science',
                total: 132, participated: 75, placed: 36,
                rate: 48.00, avg_package: 6.33, median_package: 6.35, highest_package: 12
            },
            {
                name: 'AI & Machine Learning',
                total: 131, participated: 69, placed: 30,
                rate: 43.48, avg_package: 6.16, median_package: 6, highest_package: 12
            },
            {
                name: 'Industrial Internet of Things',
                total: 127, participated: 66, placed: 33,
                rate: 50.00, avg_package: 5.88, median_package: 4.5, highest_package: 27
            },
            {
                name: 'Automation & Robotics',
                total: 111, participated: 41, placed: 16,
                rate: 39.02, avg_package: 5.95, median_package: 6, highest_package: 8
            }
        ],

        type_distribution: [
            { name: 'Software & IT',              value: 47 },
            { name: 'Sales & Consulting',          value: 13 },
            { name: 'Data Science, Analytics & AIML', value: 8 },
            { name: 'Cloud & DevOps',              value: 5  },
            { name: 'Electronics & IOT',           value: 11 },
            { name: 'Mechatronics & Robotics',     value: 4  },
            { name: 'Technical Consultant',        value: 6  },
            { name: 'Product Management',          value: 7  }
        ]
    };

    await BatchSummary.findOneAndUpdate(
        { college: 'USAR', batch_year: '2025' },
        usar2025,
        { upsert: true, new: true }
    );
    console.log("✅ USAR 2025 official data restored with full branch_full details");

    process.exit(0);
}

restore().catch(e => { console.error(e); process.exit(1); });
