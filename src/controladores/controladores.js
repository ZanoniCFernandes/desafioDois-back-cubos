let { numeroConta, banco } = require('../bancodedados');
const bancodedados = require('../bancodedados');
let bancoDeDados = require('../bancodedados');
const { format } = require('date-fns');
const { verificarBodyCompleto, verificarDuplicidadeCpf, verificarEmail, validarCpf } = require('../intermediarios/intermediarios');
const { json } = require('express/lib/response');


function listarContas(req, res) {
    try {
        return res.status(200).json(bancoDeDados.contas)
    } catch (erro) {
        console.log(erro.message)
        return res.status(500).json({ "mensagem": "Erro inesperado do servidor" })
    }
};

function criarContaBancaria(req, res) {
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    nome = nome.trim();
    cpf = cpf.trim();
    data_nascimento = data_nascimento.trim();
    telefone = telefone.trim();
    email = email.trim();

    if (verificarBodyCompleto(nome, cpf, data_nascimento, telefone, email, senha)) {
        return res.status(400).json({ "mensagem": "Os campos de nome, CPF, data de nascimento, telefone, e-mail e senha são obrigatórios. Por favor, verifique seus dados." })
    }

    if (verificarDuplicidadeCpf(cpf)) {
        return res.status(400).json({ "mensagem": "Já existe uma conta com o CPF informado!" })
    }

    if (validarCpf(cpf)) {
        return res.status(400).json({ "mensagem": "CPF inválido. Por favor, informe apenas os 11 (onze) números de seu CPF." })
    }

    if (verificarEmail(email)) {
        return res.status(400).json({ "mensagem": "Já existe uma conta com o e-mail informado!" })
    }

    const novoUsuario = {
        numeroConta: numeroConta++,
        saldo: 0,
        usuario: {
            nome: nome,
            cpf: cpf,
            data_nascimento: data_nascimento,
            telefone: telefone,
            email: email,
            senha: senha,
        }
    }

    bancoDeDados.contas.push(novoUsuario)

    return res.status(201).json()
}

function atualizarContaBancaria(req, res) {
    let { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    nome = nome.trim();
    cpf = cpf.trim();
    data_nascimento = data_nascimento.trim();
    telefone = telefone.trim();
    email = email.trim();
    let { numeroContaParams } = req.params;
    numeroContaParams = Number(numeroContaParams);

    if (isNaN(numeroContaParams)) {
        return res.status(400).json({ "mensagem": `O número da conta informado como parâmetro não é um número válido. Por favor, verifique seus dados.` })
    }

    if (verificarBodyCompleto(nome, cpf, data_nascimento, telefone, email, senha)) {
        return res.status(400).json({ "mensagem": "Os campos de nome, CPF, data de nascimento, telefone, e-mail e senha são obrigatórios. Por favor, verifique seus dados." });
    }

    if (verificarDuplicidadeCpf(cpf)) {
        return res.status(400).json({ "mensagem": "Já existe uma conta com o CPF informado!" })
    }

    if (validarCpf(cpf)) {
        return res.status(400).json({ "mensagem": "CPF inválido. Por favor, informe apenas os 11 (onze) números de seu CPF." })
    }

    if (verificarEmail(email)) {
        return res.status(400).json({ "mensagem": "Já existe uma conta com o e-mail informado!" })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numeroContaParams) {
            return conta
        };
    });

    if (!usuario) {
        return res.status(404).json({ "mensagem": `Não existe conta para o número de conta informado (${numeroContaParams}). Por favor, verifique seus dados.` })
    }

    usuario.usuario.nome = nome;
    usuario.usuario.cpf = cpf;
    usuario.usuario.data_nascimento = data_nascimento;
    usuario.usuario.telefone = telefone;
    usuario.usuario.email = email;
    usuario.usuario.senha = senha;

    return res.status(204).json();
};

function excluirConta(req, res) {
    let { numeroContaParams } = req.params;
    numeroContaParams = Number(numeroContaParams);

    if (isNaN(numeroContaParams)) {
        return res.status(400).json({ "mensagem": `O número da conta informado como parâmetro não é um número válido. Por favor, verifique seus dados.` })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numeroContaParams) {
            return conta
        };
    });

    if (!usuario) {
        return res.status(404).json({ "mensagem": `Não existe conta para o número de conta informado (${numeroContaParams}). Por favor, verifique seus dados.` })
    }

    if (usuario.saldo !== 0) {
        return res.status(400).json({ "mensagem": "Não é possível excluir uma conta com saldo credor ou devedor. Por favor, verifique seus dados." })
    };

    const index = bancoDeDados.contas.indexOf(usuario)

    bancoDeDados.contas.splice(index, 1)

    return res.status(204).json();
}

function depositarConta(req, res) {
    let { numero_conta, valor } = req.body;
    numero_conta = Number(numero_conta);
    valor = Number(valor);

    if (!numero_conta || !valor) {
        return res.status(400).json({ "mensagem": "Os campos de conta de destino e valor do depósito são obrigatórios. Por favor, verifique seus dados." })
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ "mensagem": `O número da conta informado não é um número válido. Por favor, verifique seus dados.` })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta) {
            return conta
        };
    });

    if (!usuario) {
        return res.status(404).json({ "mensagem": `Não existe conta para o número de conta informado (${numero_conta}). Por favor, verifique seus dados.` })
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "Não é possível depositar valor zero ou negativo. Por favor, verifique seus dados." })
    }

    usuario.saldo = usuario.saldo + valor;

    const deposito = {
        "data": format(new Date, "yyyy-MM-dd HH:mm:ss"),
        "numero_conta": numero_conta,
        "valor": Number(valor),
    };

    bancoDeDados.depositos.push(deposito);

    return res.status(204).json();
}

function sacarConta(req, res) {
    let { numero_conta, valor, senha } = req.body;
    numero_conta = Number(numero_conta);
    valor = Number(valor);

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ "mensagem": "Os campos de conta de origem,  valor do saque e senha do usuário são obrigatórios. Por favor, verifique seus dados." })
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ "mensagem": `O número da conta informado não é um número válido. Por favor, verifique seus dados.` })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta) {
            return conta
        }
    });

    if (!usuario) {
        return res.status(404).json({ "mensagem": `Não existe conta para o número de conta informado (${numero_conta}). Por favor, verifique seus dados.` })
    };

    if (usuario.usuario.senha !== senha) {
        return res.status(401).json({ "mensagem": "Senha do usuário incorreta. Por favor, verifique seus dados." })
    }

    if (usuario.saldo < valor) {
        return res.status(400).json({ "mensagem": "Saldo para saque insuficiente. Por favor, verifique seus dados." })
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "Não é possível sacar valor zero ou negativo. Por favor, verifique seus dados." })
    }

    usuario.saldo = usuario.saldo - valor;

    const saque = {
        "data": format(new Date, "yyyy-MM-dd HH:mm:ss"),
        "numero_conta": numero_conta,
        "valor": Number(valor),
    }

    bancoDeDados.saques.push(saque);

    return res.status(204).json();
}

function transferirContas(req, res) {
    let { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    numero_conta_origem = Number(numero_conta_origem);
    numero_conta_destino = Number(numero_conta_destino);
    valor = Number(valor);

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ "mensagem": "Os campos de conta de origem, conta de destino, valor de transferência e senha da conta de origem são obrigatórios. Por favor, verifique seus dados." })
    };

    if (isNaN(numero_conta_origem)) {
        return res.status(400).json({ "mensagem": `O número da conta de origem informado não é um número válido. Por favor, verifique seus dados.` })
    }

    if (isNaN(numero_conta_destino)) {
        return res.status(400).json({ "mensagem": `O número da conta de destino informado não é um número válido. Por favor, verifique seus dados.` })
    }

    const contaOrigem = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta_origem) {
            return conta
        };
    });

    const contaDestino = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta_destino) {
            return conta
        };
    });

    if (!contaOrigem) {
        return res.status(404).json({ "mensagem": `Conta de origem não encontrada para o número informado (${numero_conta_origem}). Por favor, verifique seus dados.` });
    };

    if (!contaDestino) {
        return res.status(404).json({ "mensagem": `Conta de destino não encontrada para o número informado (${numero_conta_destino}). Por favor, verifique seus dados.` });
    }

    if (valor <= 0) {
        return res.status(400).json({ "mensagem": "Não é possível transferir valor zero ou negativo. Por favor, verifique seus dados." })
    }

    if (senha !== contaOrigem.usuario.senha) {
        return res.status(401).json({ "mensagem": "Senha do usuário de origem da transferência incorreta. Por favor, verifique seus dados." })
    }

    if (valor > contaOrigem.saldo) {
        return res.status(400).json({ "mensagem": "Não há saldo suficiente para transferência na conta de origem. Por favor, verifique seus dados" })
    }

    contaOrigem.saldo = contaOrigem.saldo - valor;

    contaDestino.saldo = contaDestino.saldo + valor;

    const transferencia = {
        "data": format(new Date, "yyyy-MM-dd HH:mm:ss"),
        "numero_conta_origem": numero_conta_origem,
        "numero_conta_destino": numero_conta_destino,
        "valor": Number(valor),
    }

    bancoDeDados.transferencias.push(transferencia);

    return res.status(204).json();
}

function consultarSaldo(req, res) {
    let { numero_conta, senha } = req.query;
    numero_conta = Number(numero_conta);

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "Os campos de número da conta e senha são obrigatórios. Por favor, verifique seus dados." })
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ "mensagem": `O número da conta informado não é um número válido. Por favor, verifique seus dados.` })
    }

    const usuario = bancoDeDados.contas.find((conta) => {
        if (conta.numeroConta === numero_conta) {
            return conta
        }
    })

    return res.status(204).json({ "saldo": usuario.saldo })
}

function consultarExtrato(req, res) {
    let { numero_conta, senha } = req.query;
    numero_conta = Number(numero_conta);

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "Os campos de número da conta e senha são obrigatórios. Por favor, verifique seus dados." });
    }

    if (isNaN(numero_conta)) {
        return res.status(400).json({ "mensagem": `O número da conta informado não é um número válido. Por favor, verifique seus dados.` });
    }

    const depositosUsuario = bancoDeDados.depositos.filter((deposito) => {
        if (deposito.numero_conta === numero_conta) {
            return deposito
        }
    });

    const saquesUsuario = bancoDeDados.saques.filter((saque) => {
        if (saque.numero_conta === numero_conta) {
            return saque
        }
    });

    const transferenciasEnviadas = bancoDeDados.transferencias.filter((transferencia) => {
        if (transferencia.numero_conta_origem === numero_conta) {
            return transferencia
        }
    })

    const transferenciasRecebidas = bancoDeDados.transferencias.filter((transferencia) => {
        if (transferencia.numero_conta_destino === numero_conta) {
            return transferencia
        }
    })

    return res.status(200).json({ "depositos": depositosUsuario, "saques": saquesUsuario, "transferenciasEnviadas": transferenciasEnviadas, "transferenciasRecebidas": transferenciasRecebidas });

}

module.exports = {
    listarContas,
    criarContaBancaria,
    atualizarContaBancaria,
    excluirConta,
    depositarConta,
    sacarConta,
    transferirContas,
    consultarSaldo,
    consultarExtrato,
}