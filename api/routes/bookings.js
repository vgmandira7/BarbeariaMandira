function calcularHorariosOcupados(horario, servico, duracaoManual) {

  // SE EXISTE DURAÇÃO MANUAL → usa ela
  if (duracaoManual) {
    const slots = duracaoManual >= 60 ? 2 : 1;

    const [h, m] = horario.split(":").map(Number);
    const ocupados = [];

    for (let i = 0; i < slots; i++) {
      const totalMin = h * 60 + m + i * 30;
      const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
      const mm = String(totalMin % 60).padStart(2, "0");
      ocupados.push(`${hh}:${mm}`);
    }

    return ocupados;
  }

  // CASO SEJA CLIENTE (SEM duração manual)
  const duracoes = {
    "cabelo": 60,
    "cabelo + barba": 60,
    "barba": 30,
    "sobrancelha": 30,
  };

  const duracao = duracoes[servico.toLowerCase()] || 30; // 👈 padrão NÃO é 60!
  const slots = duracao >= 60 ? 2 : 1;

  const [h, m] = horario.split(":").map(Number);
  const ocupados = [];

  for (let i = 0; i < slots; i++) {
    const totalMin = h * 60 + m + i * 30;
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(totalMin % 60)).padStart(2, "0");
    ocupados.push(`${hh}:${mm}`);
  }

  return ocupados;
}
