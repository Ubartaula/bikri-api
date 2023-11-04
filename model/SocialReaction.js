const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const socialReactionSchema = new Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    item: {
      type: mongoose.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    reactions: {
      thumbsUp: {
        type: Number,
      },
      wow: {
        type: Number,
      },
      heart: {
        type: Number,
      },
      laugh: {
        type: Number,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SocialReaction", socialReactionSchema);

// the text field is to communicate between supplier and buyer,
// it has to be handled as same as you post socialReactions on item on your amazone clone project
// once you put your text here the supplier will be notified
