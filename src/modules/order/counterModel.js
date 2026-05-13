// modules/order/counter.model.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g. "order"
  seq: { type: Number, default: 0 },
});

/**
 * Atomically increments the counter and returns the next value.
 * Creates the counter document if it doesn't exist.
 */
counterSchema.statics.nextSequence = async function (name) {
  const doc = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return doc.seq;
};

const Counter = mongoose.model("Counter", counterSchema);
export default Counter;