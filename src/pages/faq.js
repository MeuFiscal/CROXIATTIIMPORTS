export async function renderFaq(container) {
  container.innerHTML = `
    <div class="container" style="max-width: 800px; padding: 60px 20px; font-family: var(--font-sans);">
      <h1 style="font-family: var(--font-serif); font-size: 2.2rem; font-weight: 500; margin-bottom: 32px; color: var(--black);">Dúvidas Frequentes</h1>
      
      <div style="display: flex; flex-direction: column; gap: 24px;">
        
        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">1. Os produtos são originais?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Sim. Trabalhamos apenas com produtos originais e cuidadosamente selecionados.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">2. Como faço meu pedido?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Escolha os produtos desejados, finalize o pedido pelo site e envie sua solicitação através do WhatsApp.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">3. O pagamento é feito pelo site?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Atualmente o pedido é finalizado através do WhatsApp, onde serão informadas as opções de pagamento disponíveis.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">4. Vocês trabalham com encomendas?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Sim. Alguns produtos são vendidos sob encomenda. O prazo será informado durante o atendimento.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">5. Posso trocar um perfume se não gostar da fragrância?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Não. Não realizamos trocas por preferência pessoal, gosto ou expectativa sobre a fragrância.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">6. Em quais situações a troca é aceita?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Apenas em casos de embalagem rompida, vazamento causado pelo transporte ou envio de produto incorreto.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">7. Como solicitar suporte?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Entre em contato através do WhatsApp informado na loja.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">8. Quanto tempo demora para receber meu pedido?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">O prazo varia conforme a disponibilidade do produto e a modalidade de envio utilizada.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">9. Como acompanhar meu pedido?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">As informações de acompanhamento serão enviadas após a postagem.</p>
        </div>

        <div>
          <h3 style="font-family: var(--font-serif); font-size: 1.2rem; font-weight: 500; color: var(--black); margin-bottom: 8px;">10. Não encontrei o perfume que procuro. O que faço?</h3>
          <p style="color: var(--gray-600); line-height: 1.6;">Entre em contato pelo WhatsApp para verificar disponibilidade de encomenda.</p>
        </div>

      </div>
    </div>
  `;
}
