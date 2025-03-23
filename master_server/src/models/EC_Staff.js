import { DataTypes } from "sequelize";
import { sequelize } from "../db/db.js";

export const EC_Staff = sequelize.define(
  "EC_Staff",
  {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    biometric_right: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    biometric_left: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "EC_Staff",
    timestamps: false,
  }
);
