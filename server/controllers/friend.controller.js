const { ApiError } = require("../middlewares/apiError");
const { User } = require("../models/user");
const { FriendInvitation } = require("../models/friendInvitation");
const { authService, userService, friendService } = require("../services/");
const {
  friendInvitationSchema,
  inviteDecisionSchema,
} = require("../validations/friendInvitationValidation");
const httpStatus = require("http-status");
require("dotenv").config();
const {
  updateFriendsPendingInvitations,
  updateFriends,
} = require("../socketHandlers/updates/friends");

const friendController = {
  async invite(req, res, next) {
    try {
      //validating using joi

      let value = await friendInvitationSchema.validateAsync(req.body);

      let userId = req.authenticated.id;

      if (value) {
        let sender = value.senderMailAddress;
        let target = value.targetMailAddress;
        //check self invite
        if (sender.toLowerCase() === target.toLowerCase()) {
          return res
            .status(httpStatus.CONFLICT)
            .send("Sorry, You cannot become friends with yourself.");
        }

        //find target user
        let targetUser = await User.findOne({
          email: target.toLowerCase(),
        });

        //target user not found
        if (!targetUser) {
          return res
            .status(httpStatus.NOT_FOUND)
            .send(`${target} has not been found, Please check email address.`);
        }

        //invitation already exists/sent check

        let invitationExists = await FriendInvitation.findOne({
          senderId: userId,
          receiverId: targetUser._id,
        });

        if (invitationExists) {
          return res
            .status(httpStatus.CONFLICT)
            .send(`Invitation already sent!`);
        }

        // check if target is already a friend
        const alreadyFriends = targetUser.friends.find(
          (friendId) => friendId.toString() === userId.toString()
        );

        if (alreadyFriends) {
          return res
            .status(httpStatus.CONFLICT)
            .send(`Friend already exists, please check friends list`);
        }

        //create new invitation
        let newInvitation = await friendService.createInvitation({
          senderId: userId,
          receiverId: targetUser._id,
        });

        //update receiver's pending invitation list in realtime communication

        updateFriendsPendingInvitations(targetUser._id.toString());

        if (newInvitation) {
        }
        return res.status(httpStatus.CREATED).send(`Invitation has been sent!`);
      }
    } catch (error) {
      next(error);
    }
  },

  async acceptInvite(req, res, next) {
    try {
      let value = await inviteDecisionSchema.validateAsync(req.body);
      let userId = req.authenticated.id;

      if (value) {
        const invitation = await FriendInvitation.findById(value.id);
        if (invitation) {
          const { senderId, receiverId } = invitation;

          //add friends to both users

          const senderUser = await User.findById(senderId);
          const receiverUser = await User.findById(receiverId);

          senderUser.friends = [...senderUser.friends, receiverId];
          senderUser.save();
          receiverUser.friends = [...receiverUser.friends, senderId];
          receiverUser.save();

          //delete invitation
          await FriendInvitation.findByIdAndDelete(value.id);

          //update the pending list of receiver
          updateFriendsPendingInvitations(userId);

          //update list of friends if user is online
          updateFriends(senderId.toString());
          updateFriends(receiverId.toString());

          return res.status(httpStatus.OK).send("Friend successfully added!");
        } else {
          return res
            .status(httpStatus.NOT_FOUND)
            .send("Error occured, please try again later");
        }
      }
    } catch (error) {
      next(error);
    }
  },
  async rejectInvite(req, res, next) {
    try {
      let value = await inviteDecisionSchema.validateAsync(req.body);
      let userId = req.authenticated.id;

      if (value) {
        //remove invitation from friend invitation collection
        const invitationExists = await FriendInvitation.exists({
          _id: value.id,
        });

        if (invitationExists) {
          await FriendInvitation.findByIdAndDelete(value.id);
        }

        //update pending invitations
        updateFriendsPendingInvitations(userId);

        return res
          .status(httpStatus.OK)
          .send("Invitation Successfully rejected");
      }
    } catch (error) {
      next(error);
    }
  },
};
module.exports = friendController;
