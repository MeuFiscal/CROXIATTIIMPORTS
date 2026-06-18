export async function renderPolicy(container) {
  container.innerHTML = `
    <div class="container" style="max-width: 800px; padding: 60px 20px; font-family: var(--font-sans);">
      <h1 style="font-family: var(--font-serif); font-size: 2.2rem; font-weight: 500; margin-bottom: 32px; color: var(--black);">Política de Trocas e Devoluções</h1>
      
      <div style="font-size: 1rem; line-height: 1.8; color: var(--gray-600); display: flex; flex-direction: column; gap: 20px;">
        <p>Na <strong>Croxiatti Imports</strong> trabalhamos com produtos importados cuidadosamente selecionados e conferidos antes do envio.</p>
        
        <p>Por esse motivo, <strong>não realizamos trocas por arrependimento, preferência de fragrância, expectativa pessoal ou qualquer motivo relacionado ao gosto do cliente.</strong></p>
        
        <h3 style="font-family: var(--font-serif); font-size: 1.3rem; font-weight: 500; color: var(--black); margin-top: 16px;">A troca ou substituição será realizada apenas nos seguintes casos:</h3>
        <ul style="padding-left: 20px; list-style-type: disc;">
          <li style="margin-bottom: 8px;">Produto recebido com embalagem rompida durante o transporte;</li>
          <li style="margin-bottom: 8px;">Produto recebido com vazamento visível causado pelo transporte;</li>
          <li style="margin-bottom: 8px;">Produto diferente do solicitado no pedido.</li>
        </ul>
        
        <h3 style="font-family: var(--font-serif); font-size: 1.3rem; font-weight: 500; color: var(--black); margin-top: 16px;">Importante:</h3>
        <ul style="padding-left: 20px; list-style-type: disc;">
          <li style="margin-bottom: 8px;">O cliente deve comunicar o problema em até <strong>24 horas</strong> após o recebimento.</li>
          <li style="margin-bottom: 8px;">Será necessário enviar fotos da embalagem, do produto e da etiqueta de envio para análise.</li>
          <li style="margin-bottom: 8px;">Após a confirmação do problema, a Croxiatti Imports realizará a substituição do produto sem custos adicionais.</li>
        </ul>
        
        <div style="margin-top: 32px; padding: 24px; background: var(--gray-50); border-radius: var(--radius-md); text-align: center; font-style: italic;">
          Ao finalizar uma compra, o cliente declara estar ciente e de acordo com esta política.
        </div>
      </div>
    </div>
  `;
}
