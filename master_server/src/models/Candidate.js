import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";
import { POSITIONS } from "../constants/positions.js";

export const Candidate = sequelize.define(
    "Candidate",
    {
        id: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        contact: {
            type: DataTypes.STRING,
        },
        basis: {
            type: DataTypes.STRING,
        },
        verfiedByVolunteer: {
            type: DataTypes.STRING,
            references: {
                model: "EC_Volunteer",
                key: "id",
            },
        },
        verifiedByStaff: {
            type: DataTypes.STRING,
            references: {
                model: "EC_Staff",
                key: "id",
            },
        },
        position: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [Object.values(POSITIONS)], // Ensure position is valid
            },
        },
        imageUrl: {
            type: DataTypes.STRING,
        }
    },
    {
        tableName: "Candidate",
    }
);
