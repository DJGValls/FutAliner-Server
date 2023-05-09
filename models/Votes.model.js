const { Schema, model } = require("mongoose");

const votesSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    playerId: {
      type: String,
      required: true,
      trim: true,
    },    
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Votes = model("Votes", votesSchema);
module.exports = Votes;
