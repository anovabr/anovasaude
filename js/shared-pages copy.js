// ===== SHARED PAGES TEMPLATE =====
// This file injects pages 2, 3, 4 into any test HTML
// Just include this script and call injectSharedPages()

function injectSharedPages() {
    const testContainer = document.querySelector('.test-container');
    
    const sharedPagesHTML = `
        <!-- PAGE 2: RESULTS PAGE -->
        <div id="results-page" class="page-section" style="display: none;">
            <div class="test-header">
                <h1>Seus Resultados</h1>
            </div>

            <div class="result-box">
                <div class="result-score-display">
                    <div class="score-number" id="result-score">0</div>
                    <div class="score-max">de <span id="result-max">1</span></div>
                </div>

                <div class="result-interpretation">
                    <h2 id="result-level">Nível</h2>
                    <p id="result-description">Descrição</p>
                </div>
            </div>

            <div class="result-answers" id="result-answers-container">
                <h3>Suas Respostas</h3>
            </div>

            <div class="test-navigation">
                <a href="#" class="btn btn-secondary" onclick="history.back(); return false;">Voltar</a>
                <button id="interpretation-btn" class="btn btn-primary">
                    Quero Interpretação Humana
                </button>
            </div>
        </div>

        <!-- PAGE 3: DEMOGRAPHICS FORM -->
        <div id="demographics-page" class="page-section" style="display: none;">
            <div class="test-header">
                <h1>Informações Pessoais</h1>
                <p>Para enviar seus resultados e solicitar a interpretação profissional, preencha o formulário abaixo:</p>
            </div>

            <form id="demographics-form">
                <div class="form-group">
                    <label for="full-name">Nome Completo *</label>
                    <input type="text" id="full-name" name="full-name" required>
                </div>

                <div class="form-group">
                    <label for="birth-date">Data de Nascimento (DD/MM/AAAA) *</label>
                    <input type="text" id="birth-date" name="birth-date" placeholder="DD/MM/AAAA" required>
                </div>

                <div class="form-group">
                    <label for="state">Estado *</label>
                    <select id="state" name="state" required>
                        <option value="">Selecione seu estado</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="gender">Sexo *</label>
                    <select id="gender" name="gender" required>
                        <option value="">Selecione</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Feminino">Feminino</option>
                        <option value="Outro">Outro</option>
                        <option value="Prefiro não informar">Prefiro não informar</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="diagnosis">Já recebeu algum diagnóstico psiquiátrico dado por um médico? *</label>
                    <select id="diagnosis" name="diagnosis" required>
                        <option value="">Selecione</option>
                        <option value="Sim">Sim</option>
                        <option value="Não">Não</option>
                        <option value="Não tenho certeza">Não tenho certeza</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="phone">Telefone (com DDD) *</label>
                    <input type="tel" id="phone" name="phone" placeholder="(11) 99999-9999" required>
                </div>

                <div class="form-group">
                    <label for="email">Email *</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="test-navigation">
                    <button type="button" id="back-to-results-btn" class="btn btn-secondary">
                        Voltar
                    </button>
                    <button type="submit" class="btn btn-primary">
                        Enviar Resultados
                    </button>
                </div>
            </form>
        </div>

        <!-- PAGE 4: PAYMENT PAGE -->
        <div id="payment-page" class="page-section" style="display: none;">
            <div class="test-header">
                <h1>Próxima Etapa: Pagamento</h1>
            </div>

            <div class="payment-message">
                <p>Agora que você mandou os resultados, após a confirmação de seu pagamento, em até 2 dias úteis você terá um relatório técnico com seus resultados, a interpretação deles e possíveis sugestões e comentários de forma a te auxiliar não apenas a entender o processo, mas ter ações que possam te ajudar no futuro.</p>
            </div>

            <div class="test-navigation">
                <a href="#" class="btn btn-secondary" onclick="history.back(); return false;">Voltar</a>
                <a href="https://anovasaude.lojavirtualnuvem.com.br/produtos/relatorio-personalizado/" target="_blank" class="btn btn-primary">
                    Ir para Pagamento
                </a>
            </div>
        </div>
    `;
    
    // Insert shared pages after page 1
    testContainer.insertAdjacentHTML('beforeend', sharedPagesHTML);
}

// Auto-inject when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectSharedPages);
} else {
    injectSharedPages();
}