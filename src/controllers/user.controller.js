import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import asyncHandler from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"
import { emailVerificationMailgenContent, sendMail } from "../utils/mail.js"



const generateAccessAndRefereshTokens = async (userId) =>{
    try {
    const user = await User.findById(userId);

    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken

    await user.save({validateBeforeSave:false})

    return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}



const registerUser = asyncHandler(async(req,res)=>{
    const {fullName,username,password,email,role} = req.body

    if(
        [fullName,email,password,username].some((feilds => feilds?.trim()===""))
    ){
        throw new ApiError(400,"all feilds are required")
    }

    const existedUser = await User.findOne(
        {
            $or:[{username},{email}]
        }
    )

    if(existedUser){
        throw new ApiError(409,"User with email or username already exists",[])
    }

    const user = await User.create({
        fullName,
        username,
        password,
        email,
        isEmailVerified:false
    })

   const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

   const {accessToken,refreshToken} = generateAccessAndRefereshTokens(user._id)

    user.emailVerificationToken=hashedToken
    user.emailVerificationExpiry=tokenExpiry

    await user.save({validateBeforeSave:false})

    await sendMail(
        {
            email:user?.email,
            subject:"Please varify Your email",
            mailgenContent:emailVerificationMailgenContent(
                user?.username,
                `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`
            )
        }
    )

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry"  
    )

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering User")
    }

    return res
      .status(201)
      .json(
        new ApiResponse(
            200,
            {user:createdUser},
            "User Registered Successfully varication email has been sent on your email"
        )
      )

})

export {registerUser};