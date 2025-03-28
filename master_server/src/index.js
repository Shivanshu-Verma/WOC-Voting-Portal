import "dotenv/config"
import app from './app.js'
import { connectDB, sequelize } from "./db/db.js";
import { Voter } from "./models/Voter.js";
import { EC_Staff } from "./models/EC_Staff.js";
import { EC_Volunteer } from "./models/EC_Volunteer.js";
import { Candidate } from "./models/Candidate.js";
import { Commitment } from "./models/Commitments.js";
import { EVM } from "./models/EVM.js";

(async () => {
    try {
        // Connect to Postrgres
        await connectDB();
        await EC_Staff.sync({ alter: true });
        await EC_Volunteer.sync({ alter: true });
        await Candidate.sync({ alter: true })
        await Voter.sync({ alter: true });
        await EVM.sync({ alter: true });
        await Commitment.sync({ alter: true });

        console.log("Tables synchronized successfully!");
        await sequelize.sync({ alter: true }); // Sync the database and create tables

        // Start the server
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error during server initialization:", error);
    }
})();
