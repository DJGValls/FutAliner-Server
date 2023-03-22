const { Schema, model } = require("mongoose");

const playerSchema = new Schema(
  {
    portero: {
      type: Number,
      required: true,
      trim: true,
    },
    defensa: {
      type: Number,
      required: true,
      trim: true,
    },
    tecnica: {
      type: Number,
      required: true,
      trim: true,
    },
    ataque: {
      type: Number,
      required: true,
      trim: true,
    },
    cardio: {
      type: Number,
      required: true,
      trim: true,
    },
    grupo: {
      type: Schema.Types.ObjectId,
      ref: "Grupo",
    },
    role: {
      type: String,
      enum: [jugador, capitan],
    },
  },
  {
    timestamps: true,
  }
);

const Player = model("Player", playerSchema);

module.exports = Player;
