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

const login = asyncHandler(async(req,res)=>{

    const {username,email,password} = req.body

    if(!username || ! email){
        throw new ApiError(400,"Username or email is required")
    }

    const user = await User.findOne(
        {
            $or: [{email} , {username}]
        }
    )

    if(!user){
        throw new ApiError(400,"User does noy exsites")
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invailid credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
        user._id,
      );
    
      const loggedInUser = await User.findById(user._id).select(
        "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
      );
    
      const options = {
        httpOnly: true,
        secure: true,
      };
    
      return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
          new ApiResponse(
            200,
            {
              user: loggedInUser,
              accessToken,
              refreshToken,
            },
            "User logged in successfully",
          ),
        );
    });

const logoutUser = asyncHandler(async(req,res)=>{

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:""
            }
        },
        {
            new:true
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
      .status(200)
      .clearCookie("refreshToken",options)
      .clearCookie("accessToken",options)
      .json(
        new ApiResponse(200,{},"User logged Out ")
      )
})

const getCurrentUser = asyncHandler(async(req,res)=>{

    return res
      .status(200)
      .json(
        new ApiResponse(200,req.user,"user data feated successfully")
      )

})

const verifyEmail = asyncHandler(async(req,res)=>{
    const {VerificationToken}=req.params

    if(!VerificationToken){
        throw new ApiError(400,"email verification token is missing")
    }

    let hashedToken = crypto
            .createHash("sha256")
            .update(VerificationToken)
            .digest("hex")
    
    const user = await User.findOne({
        emailVerificationToken:hashedToken,
        emailVerificationExpiry:{$gt:Date.now()}
    })

    if(!user){
        throw new ApiError(400,"Token is invalid or expired")
    }

    user.emailVerificationToken=undefined
    user.emailVerificationExpiry=undefined

    user.isEmailVerified = true
    await user.save({validateBeforeSave:false})

    return res
    .status(200)
    .json(
        new ApiResponse(200,{isEmailVerified:true},"email is varified")
    )
})

const resendEmailVerification = asyncHandler(async(req,res)=>{
    const user = await User.findById(req.user._id)

    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    if(user.isEmailVerified){
        throw new ApiError(409,"Email is already verified")
    }

    const {unHashedToken, hashedToken, tokenExpiry} = user.generateTemporaryToken()

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

    return res 
      .status(200)
      .json(
        new ApiResponse(200,{},"Mail has been sent to your email ID")
      )
})

export {
    registerUser,
    login,
    logoutUser,
    getCurrentUser,
    verifyEmail,
    resendEmailVerification
};