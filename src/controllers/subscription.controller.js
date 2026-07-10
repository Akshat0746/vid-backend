import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
      if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel id")
    }
    // Prevent a user from subscribing to their own channel
    if (channelId === req.user?._id.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel")
    }
    const channel = await User.findById(channelId)
    if (!channel) {
        throw new ApiError(404, "Channel not found")
    }
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user?._id,
        channel: channelId
    })
    if (existingSubscription) {
        await Subscription.findByIdAndDelete(existingSubscription._id)
        return res
            .status(200)
            .json(new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully"))
    }
    const newSubscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId
    })
    return res
        .status(200)
        .json(new ApiResponse(200, { subscribed: true, subscription: newSubscription }, "Subscribed successfully"))
})
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid subscriber id")
    }
    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channel",
                pipeline: [
                    {
                        $lookup: {
                            from: "videos",
                            localField: "_id",
                            foreignField: "owner",
                            as: "videos"
                        }
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: "$videos"
                            }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1,
                            latestVideo: {
                                _id: 1,
                                videoFile: 1,
                                thumbnail: 1,
                                title: 1,
                                description: 1,
                                duration: 1,
                                views: 1,
                                createdAt: 1
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channel"
        },
        {
            $project: {
                _id: 0,
                channel: 1
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, subscribedChannels, "Subscribed channels fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}