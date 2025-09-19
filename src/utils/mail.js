import Mailgen from "mailgen";

const emailVerificationMailgenContent = (username,verficationUrl) =>{
    return {
        body:{
            name:username,
            intro:"Welcome to our App we are excited to have you on on board.",
            action:{
                instructions:"To verify email Please click on the following butoon",
                button:{
                    color:"#22BC66",
                    text:"Verify Your Email",
                    link:verficationUrl
                }
            },
            outro:"Need help, Or have Qustions just reply to this email, we'd love to help"
        }
    }
}

const forgotPasswordMailgenContent = (username,passwordResetUrl) =>{
    return {
        body:{
            name:username,
            intro:"We got a request to reset the password of your account.",
            action:{
                instructions:"To reset your password click on the following butoon or link",
                button:{
                    color:"#e64242ff",
                    text:"reset your password",
                    link:passwordResetUrl
                }
            },
            outro:"Need help, Or have Qustions just reply to this email, we'd love to help"
        }
    }
}

export {
    forgotPasswordMailgenContent,
    emailVerificationMailgenContent
}