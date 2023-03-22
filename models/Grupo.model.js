const { Schema, model } = require("mongoose");

const grupoSchema = new Schema(
  {
    Nombre: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Grupo = model("Grupo", grupoSchema);

module.exports = Grupo;
