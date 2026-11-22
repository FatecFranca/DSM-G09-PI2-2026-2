// =====================================================
// VALIDAÇÕES E MÁSCARAS — SISTEMA DE GESTÃO
// Arquivo sem módulos: funciona em arquivo local (file://)
// =====================================================

// ======================
// MÁSCARAS EM TEMPO REAL
// ======================

function mascararCPF(campo) {
  let valor = campo.value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  
  if (valor.length > 9) {
    valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (valor.length > 6) {
    valor = valor.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (valor.length > 3) {
    valor = valor.replace(/(\d{3})(\d{1,3})/, '$1.$2');
  }
  
  campo.value = valor;
}

function mascararCNPJ(campo) {
  let valor = campo.value.replace(/\D/g, '');
  if (valor.length > 14) valor = valor.slice(0, 14);
  
  if (valor.length > 12) {
    valor = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } else if (valor.length > 8) {
    valor = valor.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
  } else if (valor.length > 5) {
    valor = valor.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
  } else if (valor.length > 2) {
    valor = valor.replace(/(\d{2})(\d{1,3})/, '$1.$2');
  }
  
  campo.value = valor;
}

function mascararTelefone(campo) {
  let valor = campo.value.replace(/\D/g, '');
  if (valor.length > 11) valor = valor.slice(0, 11);
  
  if (valor.length > 6) {
    valor = valor.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) $2-$3');
  } else if (valor.length > 2) {
    valor = valor.replace(/(\d{2})(\d{1,5})/, '($1) $2');
  }
  
  campo.value = valor;
}

function mascararCEP(campo) {
  let valor = campo.value.replace(/\D/g, '');
  if (valor.length > 8) valor = valor.slice(0, 8);
  
  if (valor.length > 5) {
    valor = valor.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  campo.value = valor;
}

// ======================
// VALIDAÇÕES DE DADOS
// ======================

function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1+$/.test(cpf)) return false; // Bloqueia sequências iguais

  let soma = 0;
  for (let i = 1; i <= 9; i++) {
    soma += parseInt(cpf[i - 1]) * (11 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[9])) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++) {
    soma += parseInt(cpf[i - 1]) * (12 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf[10])) return false;

  return true;
}

function validarCNPJ(cnpj) {
  cnpj = cnpj.replace(/\D/g, '');
  
  if (cnpj.length !== 14) return false;
  if (/^(\d)\1+$/.test(cnpj)) return false; // Bloqueia sequências iguais

  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  tamanho += 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }
  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

function validarTelefone(telefone) {
  const limpo = telefone.replace(/\D/g, '');
  return limpo.length >= 10 && limpo.length <= 11;
}

function validarCEP(cep) {
  const limpo = cep.replace(/\D/g, '');
  return limpo.length === 8;
}

// ======================
// UTILITÁRIAS
// ======================

function limparMascara(valor) {
  if (!valor) return null;
  return valor.replace(/\D/g, '');
}

// =====================================================
// DISPONIBILIZA TODAS NO ESCOPO GLOBAL
// =====================================================
window.mascararCPF = mascararCPF;
window.mascararCNPJ = mascararCNPJ;
window.mascararTelefone = mascararTelefone;
window.mascararCEP = mascararCEP;
window.validarCPF = validarCPF;
window.validarCNPJ = validarCNPJ;
window.validarTelefone = validarTelefone;
window.validarCEP = validarCEP;
window.limparMascara = limparMascara;

// =====================================================
// INTEGRAÇÃO COM VIACEP — PREENCHIMENTO AUTOMÁTICO
// =====================================================

async function buscarCEP(cep, prefixo = '') {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    return { erro: 'CEP inválido' };
  }

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    
    if (!resposta.ok) {
      return { erro: 'Erro na consulta' };
    }

    const dados = await resposta.json();
    
    if (dados.erro) {
      return { erro: 'CEP não encontrado' };
    }

    // Preenche os campos automaticamente
    if (prefixo) {
      const endereco = document.getElementById(prefixo + 'endereco');
      const bairro = document.getElementById(prefixo + 'bairro');
      const cidade = document.getElementById(prefixo + 'cidade');
      const estado = document.getElementById(prefixo + 'estado');

      if (endereco) endereco.value = dados.logradouro || '';
      if (bairro) bairro.value = dados.bairro || '';
      if (cidade) cidade.value = dados.localidade || '';
      if (estado) estado.value = dados.uf || '';
    }

    return dados;
  } catch (erro) {
    return { erro: 'Falha na conexão' };
  }
}

// Disponibilizar globalmente
window.buscarCEP = buscarCEP;
