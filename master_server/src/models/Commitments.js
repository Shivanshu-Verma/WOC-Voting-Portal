import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";
import { POSITIONS } from "../constants/positions.js";
import EVM from "./EVM.js";

export const Commitment = sequelize.define(
    "Commitment",
    {
        position: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIn: [Object.values(POSITIONS)], // Ensure position is valid
            },
        },
        evm: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: EVM,
                key: "id",
            },
            // onDelete: "CASCADE", // Ensures commitments get deleted if EVM is removed
        },
        voter: {
            type: DataTypes.STRING,
            allowNull: false,
            reference: {
                model: "Voter",
                key: "voterId"
            }
        },
        commitment: {
            type: DataTypes.TEXT, // Changed from TSVECTOR to TEXT, as TSVECTOR is specific to Postgres full-text search
            allowNull: false,
        }
    },
    {
        tableName: "Commitments",
    }
);
