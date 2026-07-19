import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
     if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)

        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Video unliked successfully"))
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    if (!like) {
        throw new ApiError(500, "Something went wrong while liking the video")
    }

    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
      if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { isLiked: false }, "Tweet unliked successfully"))
    }
    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (!like) {
        throw new ApiError(500, "Something went wrong while liking the tweet")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, { isLiked: true }, "Tweet liked successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}