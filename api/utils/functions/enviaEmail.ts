import nodemailer from 'nodemailer';

export async function enviaEmail(email: string, token: string, subject: string, textEmail: string) {
    // Endereço do remetente
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    await transporter.sendMail({
        from: process.env.EMAIL,
        to: email,
        subject: subject,
        text: textEmail,
        html: `
        <h1> CutHub</h1>
            <br/>
            <p style="font-size: 18px">Aqui está o seu código para recuperação de senha! Lembre-se de não compartilhar esse código com ninguém.</p>
            <br/>
            <div>
                <p style="color:black; font-size: 22px; text-align: center;"> <b style="border-radius: 15px; padding: 15px; background-color: #55AAFF;">${token}</b> </p>
            </div>
            <br/>
            <p style="font-size: 16px">Escreva o código na área solicitada para definir uma nova senha dentro de uma hora!</p> 
        `,
    });

    console.log('Email enviado com sucesso');
}