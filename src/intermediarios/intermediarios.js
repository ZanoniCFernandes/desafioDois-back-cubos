const bancoDeDados = require('../bancodedados');

function validarSenhaBanco(req, res, next) {
    const { senha_banco } = req.query;

    if (!senha_banco) {
        return res.status(401).json({ "mensagem": "Autenticação necessária. Por favor, informe a senha." })
    }

    if (senha_banco !== 'Cubos123Bank') {
        return res.status(401).json({ "mensagem": "Senha incorreta. Por favor, verifique sua senha" })
    }
    next();
}

function validarSenhaUsuario(req, res, next) {
    let { numero_conta, senha } = req.query;
    numero_conta = Number(numero_conta);

    if (!senha) {
        return res.status(401).json({ "mensagem": "Autenticação necessária. Por favor, informe a senha." })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta) {
            return conta
        }
    });

    if (!usuario) {
        return res.status(404).json({ "mensagem": `Não existe conta para o número de conta informado (${numero_conta}). Por favor, verifique seus dados.` })
    }

    if (senha !== usuario.usuario.senha) {
        return res.status(401).json({ "mensagem": "Senha de usuário incorreta. Por favor, verifique sua senha" })
    }
    next();
}

function verificarBodyCompleto(nome, cpf, data_nascimento, telefone, email, senha) {
    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return true
    } else {
        return false
    }
}

function verificarDuplicidadeCpf(cpf) {

    return bancoDeDados.contas.find((usuario) => {
        if (usuario.usuario.cpf === cpf) {
            return usuario
        }
    });
};

function validarCpf(cpf) {

    if (cpf.length !== 11) {
        return true
    }

}

function verificarEmail(email) {
    return bancoDeDados.contas.find((usuario) => {
        if (usuario.usuario.email === email) {
            return usuario
        }
    });
};

module.exports = {
    validarSenhaBanco,
    validarSenhaUsuario,
    verificarBodyCompleto,
    verificarDuplicidadeCpf,
    validarCpf,
    verificarEmail,
}