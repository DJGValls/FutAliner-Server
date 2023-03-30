const { Schema, model } = require("mongoose");

const teamSchema = new Schema(
  {
    teamName: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
    },
    image: {
      type: String,
      default:
        "https://res.cloudinary.com/dn3vdudid/image/upload/v1679479488/FutAliner/userIcon_hv30gr.png",
    },
    players: {
      type: [{ type: Schema.Types.ObjectId, ref: "Player" }],
    },
  },
  {
    timestamps: true,
  }
);

const Team = model("Team", teamSchema);

module.exports = Team;
