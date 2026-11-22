function limpaNumeros(valor) {
  return valor.replace(/\D/g, '');
}

function validaCPF(cpf) {
  cpf = limpaNumeros(cpf);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf[i]) * (10 - i);
  let dig1 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
  if (dig1 !== parseInt(cpf[9])) return false;
  
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf[i]) * (11 - i);
  let dig2 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
  return dig2 === parseInt(cpf[10]);
}

function validaCNPJ(cnpj) {
  cnpj = limpaNumeros(cnpj);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
  
  const p1 = [5,4,3,2,9,8,7,6,5,4,3,2];
  let soma = 0;
  for (let i = 0; i < 12; i++) soma += parseInt(cnpj[i]) * p1[i];
  let dig1 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
  if (dig1 !== parseInt(cnpj[12])) return false;
  
  const p2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
  soma = 0;
  for (let i = 0; i < 13; i++) soma += parseInt(cnpj[i]) * p2[i];
  let dig2 = (soma % 11) < 2 ? 0 : 11 - (soma % 11);
  return dig2 === parseInt(cnpj[13]);
}

module.exports = { limpaNumeros, validaCPF, validaCNPJ };
