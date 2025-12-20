import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import TryCatch from "../utils/TryCatch.js";
import type { AutheticatedRequest } from "../middleware/isAuth.js";
import getBuffer from "../utils/dataUri.js";
import { v2 as cloudinary } from 'cloudinary';

/*
Controller logic for Google login 

Receive Google user info (or token) -> Find user by email -> Create user if not exists -> Return user 

*/

export const loginUser = TryCatch(async (req, res) => {
  const { email, name, image } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      image,
    });
  }

  const token = await jwt.sign(
    { userId: user._id }, 
    process.env.JWT_SECRET as string, 
    {
    expiresIn: "5d",
  });

  console.log("Token: ", token)

  res.status(200).json({
    message: "Login success",
    token,
    user,
  });
});

export const myProfile = TryCatch(async (req:AutheticatedRequest, res) => {
    res.json(req.user) ; 
});

export const getUserProfile = TryCatch(async (req, res) => {

    const user = await User.findById(req.params.id) ; 

    if(!user){ 
        return res.status(404).json({
            message: "No User with this id"
        })
    }

    res.json(user) ; 
})

export const updateUser = TryCatch(async (req: AutheticatedRequest, res) => {

  if(!req.user){
    return res.status(401).json({
      message: "Unauthorized"
    }) ;  
  }

  const {name, instagram, facebook, linkedin, bio} = req.body ;
  
  // update only provided fields 

  // if(name !== undefined) req.user.name = name ; 
  // if(bio !== undefined) req.user.bio = bio ; 
  // if(instagram !== undefined) req.user.instagram = instagram ; 
  // if(facebook !== undefined) req.user.facebook = facebook ; 
  // if(linkedin !== undefined) req.user.linkedin = linkedin ; 

  const user = await User.findByIdAndUpdate(
    req.user?._id, 
    {
      name, instagram, linkedin, facebook, bio
    }, 
    {
      new: true
    }
  ) 
  
  const token = jwt.sign(
    {user}, 
    process.env.JWT_SECRET as string, 
    {
      expiresIn: "5d"
    }
  )

  res.json({
    message: "User updated successfully.", 
    token, 
    user
  })
})

export const updateProfilePic = TryCatch(async(req: AutheticatedRequest, res) => {
  const file = req.file ; 

  if(!file){
    return res.status(400).json({
      message: "No file to upload"
    })
  }

  const fileBuffer = getBuffer(file) ; 

  if(!fileBuffer || !fileBuffer.content){
    return res.status(400).json({
      message: "Failed to generate buffer"
    })
  }

  const cloud = await cloudinary.uploader.upload(
    fileBuffer.content, 
    {
      folder: "blogs"
    }
  )

  const user = await User.findByIdAndUpdate(
    req.user?._id, 
    {
      image: cloud.secure_url 
    }, {
      new: true 
    }
  ) ; 

  const token = jwt.sign(
    {user}, 
    process.env.JWT_SECRET as string, 
    {
      expiresIn: "5d"
    }
  ) ; 

  res.json({
    message: "User profile pic updated", 
    token, 
    user 
  })

})