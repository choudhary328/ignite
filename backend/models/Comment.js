import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
    {
        event: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        userName: { type: String, required: true }, // Store name for quick display without population
        text: { type: String, required: true },
    },
    { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);
export default Comment;
