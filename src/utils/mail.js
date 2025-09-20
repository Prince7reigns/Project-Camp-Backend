import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendMail = async(options) =>{
    const mailgen = new Mailgen({
         theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Task Manager',
        link: 'https://taskmanager.com'
        // Optional product logo
        // logo: 'https://mailgen.js/img/logo.png'
    }
    })

    const emailTextual = mailgen.generatePlaintext(options.mailgenContent)
    const emailHtml = mailgen.generatePlaintext(options.mailgenContent)

    const  transporter = nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user:process.env.MAILTRAP_SMTP_USER,
            pass:process.env.MAILTRAP_SMTP_PASS
        }
    })

    const mail = {
        from:"prinsyadac@gmail.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHtml
    }

    try {
        await transporter.sendMail(mail)
    } catch (error) {
       console.error("Email service failed siliently make sure that you have provided your MAILTRAP credentials in the .env file") 
       console.error("Error" , error)
    }
}

//TODO:PRint optins 

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
    emailVerificationMailgenContent,
    sendMail
}