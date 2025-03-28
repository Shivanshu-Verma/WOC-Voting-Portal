import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";
import { Voter } from "./Voter.js";
import { POSITIONS } from "../constants/positions.js";


const EVM = sequelize.define(
    "EVM",
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        room: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ip: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        health: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        verifiedByStaff: {
            type: DataTypes.STRING,
            references: {
                model: "EC_Staff",
                key: "id",
            },
        },
        buffer: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            validate: {
                async isArrayOfValidVoters(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("Buffer must be an array.");
                    }

                    for (const entry of value) {
                        if (
                            typeof entry !== "object" ||
                            !entry.voter ||
                            !entry.votedAt
                        ) {
                            throw new Error(
                                "Each buffer entry must be an object with 'voter' and 'votedAt' keys."
                            );
                        }

                        // Check if the voter exists in the Voter model
                        const voterExists = await Voter.findByPk(entry.voter);
                        if (!voterExists) {
                            throw new Error(
                                `Voter with ID ${entry.voter} does not exist.`
                            );
                        }
                    }
                },
            },
        },
        randomVector: {
            type: DataTypes.JSON,
            allowNull: false,
            defaultValue: [],
            validate: {
                isValidRandomVector(value) {
                    if (!Array.isArray(value)) {
                        throw new Error("RandomVector must be an array.");
                    }

                    for (const entry of value) {
                        if (
                            typeof entry !== "object" ||
                            !entry.position ||
                            !entry.randomVector
                        ) {
                            throw new Error(
                                "Each RandomVector entry must be an object with 'position' and 'randomVector' keys."
                            );
                        }

                        if (!Object.values(POSITIONS).includes(entry.position)) {
                            throw new Error(
                                `Position '${entry.position}' is not valid. Valid positions are: ${Object.values(
                                    POSITIONS
                                ).join(", ")}.`
                            );
                        }

                        if (typeof entry.randomVector !== "string") {
                            throw new Error("RandomVector must be a string.");
                        }
                    }
                },
            },
        },
    },
    {
        tableName: "EVM",
    }
);

export default EVM;
