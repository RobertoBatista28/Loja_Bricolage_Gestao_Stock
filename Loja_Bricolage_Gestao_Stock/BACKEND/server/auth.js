const bodyParser = require("body-parser");
const express = require("express");
const Utilizadores = require("../data/utilizador");
const UtilizadoresModel = require("../data/utilizador/utilizador");
const EmailService = require("../server/emailService");
const scopes = require("../data/utilizador/scopes");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

function AuthRouter() {
    let router = express();

    router.use(bodyParser.json({ limit: "100mb" }));
    router.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));

    router.post("/register", async (req, res) => {
        try {
            let body = req.body;

            if (!body.username || !body.password || !body.nome || !body.morada || !body.telemovel || !body.dataNascimento || !body.nif || !body.email) {
                return res.status(400).send("Todos os campos devem ser preenchidos.");
            }

            let verificarUser = await Utilizadores.findByUsername(body.username);
            if (verificarUser) {
                return res.status(409).json({ success: false, error: "Esse username já está em uso, escolha outro!" });
            }

            let verificarEmail = await Utilizadores.findByEmail(body.email);
            if (verificarEmail) {
                return res.status(409).json({ success: false, error: "Esse email já está associado a uma conta, escolha outro!" });
            }

            body.role = body.role || { nome: "utilizador", scopes: [scopes.utilizador] };

            if (body.role.scopes) {
                for (let scope of body.role.scopes) {
                    if (!Object.values(scopes).includes(scope)) {
                        return res.status(400).send("Scope inválido: " + scope);
                    }
                }
            }

            const verificationToken = crypto.randomBytes(32).toString('hex');
            body.verificationToken = verificationToken;
            body.isVerified = false;

            let novoUtilizador = await Utilizadores.create(body);

            await EmailService.sendVerificationEmail(body.email, verificationToken);
            res.status(200).json({ success: true, message: "Utilizador registado. Verifique seu email para concluir o registro.",user: novoUtilizador });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    });

    router.route("/me").get(function (req, res, next) {
        let token = req.headers["x-access-token"];

        if (!token) { return res.status(401).send({ auth: false, message: "Sem token para verificação!" }); }

        return Utilizadores.verifyToken(token)
            .then((decoded) => { res.status(202).send({ auth: true, decoded }); })
            .catch((err) => {
                res.status(500).send(err);
                next();
            });
    });

    router.post("/login", function (req, res) {
        const { username, password } = req.body;
      
        UtilizadoresModel.findOne({ username })
          .then(utilizador => {
            if (!utilizador) {
                return res.status(401).json({ auth: false, message: "Username incorreto" });
            }

            bcrypt.compare(password, utilizador.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).json({ auth: false, message: "Erro ao comparar as senhas" });
                }
                if (!isMatch) {
                    return res.status(401).json({ auth: false, message: "Credenciais incorretas" });
                }

                if (!utilizador.isVerified) {
                    return res.status(401).json({ auth: false, message: "Sua conta não está verificada, verifique seu email para concluir o registro." });
                }
      
            const scopes = utilizador.role.scopes || []; 
            const token = Utilizadores.createToken(utilizador, scopes);
      
            res.cookie('token', token, { httpOnly: false, secure: false, sameSite: 'Strict', maxAge: 24 * 60 * 60 * 1000 });
            res.send({ auth: true, scopes });
          })
        })
          .catch(err => {
            res.status(401).json({ auth: false, message: err.message });
          });
      });

      router.get("/verify-email", async (req, res) => {
        const { token } = req.query;
    
        try {
            let user = await Utilizadores.findByVerificationToken(token);
            if (!user) {
                return res.status(400).send(renderHTML("Token de verificação inválido", "Erro"));
            }
    
            user.isVerified = true;
            user.verificationToken = null;
            await Utilizadores.updateVerified(user.username, user);
    
            res.status(200).send(renderHTML("Email verificado com sucesso", "Sucesso"));
        } catch (error) {
            console.error("Erro:", error);
            res.status(500).send(renderHTML("Ocorreu um erro ao verificar o email", "Erro"));
        }
    });
    
    function renderHTML(message, status) {
        let statusColor = "";
        let statusText = "";
        let style = "";
        
        if (status === "Sucesso") {
            statusColor = "green";
            statusText = "Verificação concluída com sucesso!";
            style = "font-size: 1.3em;";
        } else if (status === "Erro") {
            statusColor = "red";
            statusText = "Erro na verificação.";
            style = "font-size: 1.3em;";  // Define o estilo para tamanho maior
        } else {
            statusColor = "black";
            statusText = "Estado desconhecido da verificação.";
            style = "font-size: 1.3em;";
        }
    
        let introduction = `
            <p style="font-size: 1.3em;">Bem-vindo à página de verificação da Bibliogo. Esta página mostra a verificação de email da sua conta.</p>
            <p style="font-size: 1.9em;">&#8681;</p>
        `;
    
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Verificação de Email</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        margin: 0;
                        background-color: #f4f4f4;
                    }
                    .container {
                        text-align: center;
                        background: white;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0,0,0,0.1);
                        max-width: 600px;
                        margin: auto;
                    }
                    h1 {
                        color: #333;
                    }
                    .status {
                        margin-top: 2px;
                        font-weight: bold;
                        color: ${statusColor};
                        ${style}  /* Aplica o estilo dinâmico */
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Verificação de Email</h1>
                    ${introduction}
                    <p style="font-size: 1.3em;">${message}</p>
                    <div class="status">${statusText}</div>
                </div>
            </body>
            </html>
        `;
    }


    router.route("/forgot-password").post(async function (req, res, next) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ error: "O email é obrigatório para a recuperação da password!" });
            }
            const user = await Utilizadores.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ error: "Utilizador não foi encontrado com o email fornecido" });
            }

            const resetToken = Utilizadores.generateResetToken();
            await Utilizadores.updateResetToken(user.id, resetToken);
            await EmailService.sendPasswordResetEmail(email, resetToken);

            res.status(200).json({ success: "Instruções de recuperação de palavra-passe enviadas para o seu email" });
        } catch (error) {
            console.error("Erro:", error);
            res.status(500).json({ error: "Erro ao processar a solicitação de recuperação de password!" });
        }
    });

    router.route("/reset-password").post(async function (req, res, next) {
        try {
            const { email, token, novaPassword } = req.body;
    
            if (!email || !token || !novaPassword) {
                return res.status(400).json({ error: "Email, token e nova password são campos obrigatórios para redefinir a password!" });
            }
    
            const user = await Utilizadores.findUserByEmail(email);
            if (!user) {
                return res.status(404).json({ error: "Não foi possível encontrar um utilizador com esse email!" });
            }
    
            if (user.resetToken !== token) {
                return res.status(400).json({ error: "O token é inválido!" });
            }
    
            await Utilizadores.updatePassword(user.id, novaPassword);
            await Utilizadores.clearResetToken(user.id);
    
            res.status(200).json({ success: "Password redefinida com sucesso." });
        } catch (error) {
            console.error("Erro ao processar a solicitação de redefinição de password:", error);
            res.status(500).json({ error: "Erro ao processar a solicitação de redefinição de password!" });
        }
    });

    return router;
}

module.exports = AuthRouter;
