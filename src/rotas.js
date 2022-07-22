const express = require('express');
const { validarSenhaBanco, validarSenhaUsuario } = require('./intermediarios/intermediarios');
const controladores = require('./controladores/controladores');

const rotas = express();

rotas.use(express.json());


rotas.get('/contas', validarSenhaBanco, controladores.listarContas);
rotas.post('/contas', validarSenhaBanco, controladores.criarContaBancaria);
rotas.put('/contas/:numeroContaParams/usuario', validarSenhaBanco, controladores.atualizarContaBancaria);
rotas.delete('/contas/:numeroContaParams', validarSenhaBanco, controladores.excluirConta);
rotas.post('/transacoes/depositar', controladores.depositarConta);
rotas.post('/transacoes/sacar', controladores.sacarConta);
rotas.post('/transacoes/transferir', controladores.transferirContas);
rotas.get('/contas/saldo', validarSenhaUsuario, controladores.consultarSaldo);
rotas.get('/contas/extrato', validarSenhaUsuario, controladores.consultarExtrato);

module.exports = rotas;