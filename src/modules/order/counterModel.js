// modules/order/counterModel.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  _id:  { type: String, required: true }, // e.g. "order"
  seq:  { type: Number, default: 0 },
});

counterSchema.statics.nextSequence = async function (name) {
  const counter = await this.findByIdAndUpdate(
    name,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
export default Counter;