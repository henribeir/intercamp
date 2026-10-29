// ============================================================
// Ação do mestre (gol, ponto, encerrar, salvar...).
// Uso:
//   const acao = useAcaoMestre();
//   acao.mutate(() => api.registrarPonto(id, 'A', 1), { onSuccess, onError });
//
// - Enquanto roda, acao.isPending = true (os botões ficam desligados)
// - Trava contra toque duplo: uma 2ª ação disparada antes de a 1ª
//   terminar é ignorada (o botão desligado só aparece no próximo
//   desenho da tela, e um toque duplo é mais rápido que isso)
// - Sem internet, falha na hora com aviso (não fica guardada para depois)
// - Se a resposta for um jogo, a tela do jogo é atualizada na hora
// - Depois, todas as listas são buscadas de novo
// ============================================================
import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chaves } from './consultas';

/** Vibração curta no celular: confirma o toque mesmo sem olhar a tela */
export function vibrar() {
  navigator.vibrate?.(25);
}

export function useAcaoMestre() {
  const queryClient = useQueryClient();
  const travado = useRef(false);

  const mutacao = useMutation({
    mutationFn: (executar) => executar(),
    // Sem internet, falha NA HORA com "Sem conexão" (o padrão seria guardar
    // a ação e enviá-la sozinha quando a internet voltasse: um gol "atrasado"
    // poderia entrar quando o mestre já nem quer mais)
    networkMode: 'always',
    onSuccess: (resultado) => {
      // A API devolve o jogo atualizado: já mostra sem esperar nova busca
      if (resultado?.id && resultado?.competicao) {
        queryClient.setQueryData(chaves.jogo(resultado.id), resultado);
      }
      queryClient.invalidateQueries();
    },
  });

  function mutate(executar, opcoes = {}) {
    if (travado.current) return; // já tem uma ação em andamento
    travado.current = true;
    mutacao.mutate(executar, {
      ...opcoes,
      onSettled: (...argumentos) => {
        travado.current = false;
        opcoes.onSettled?.(...argumentos);
      },
    });
  }

  return { ...mutacao, mutate };
}
