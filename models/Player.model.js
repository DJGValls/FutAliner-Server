const { Schema, model } = require("mongoose");

const playerSchema = new Schema(
  {
    portero: {
      type: Number,
      trim: true,
      default: 0,
    },
    defensa: {
      type: Number,
      trim: true,
      default: 0,
    },
    tecnica: {
      type: Number,
      trim: true,
      default: 0,
    },
    ataque: {
      type: Number,
      trim: true,
      default: 0,
    },
    cardio: {
      type: Number,
      trim: true,
      default: 0,
    },
    grupo: {
      type: Schema.Types.ObjectId,
      ref: "Grupo",
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    role: {
      type: String,
      enum: ["jugador", "capitan"],
      default: "jugador",
    },
    votes: {
      type: Number,
      trim: true,
      default: 0,
    },
    total:{
      type:Number,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Player = model("Player", playerSchema);

module.exports = Player;
