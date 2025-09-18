import mongoose ,{Schema} from "mongoose"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        avatar:{
            type:{
                url:String,
                localPath:String,
            },
            default:{
                url:`https://placehold.co/200x200`,
                localPath:""
            }
        },
        username:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        fullName:{
            type:String,
            trim:true,
        },
        password:{
            type:String,
            required:[true,"Password is Required"]
        },
        isEmailVerified:{
            type:Boolean,
            default:false
        },
        refreshToken:{
            type:String
        },
        forgotPasswordToken:{
            type:String
        },
        forgotPasswordExpiry:{
            type:Date
        },
        emailVerificationToken:{
            type:String
        },
        emailVerificationExpiry:{
            type:Date
        }

    },
    {
        timestamps:true
    }
)


userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.method("generateAccessToken",  function (){
      return jwt.sign(
        {
           _id:this._id,
           username:this.username,
           email:this.email,
           fullName:this.fullName,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
      )
   })

   userSchema.method("generateRefreshToken" , function(){
        return jwt.sign(
            {
             _id:this._id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
                expiresIn:process.env.REFRESH_TOKEN_EXPIRY
            }
        )
   })



export const User = mongoose.model("Users",userSchema)