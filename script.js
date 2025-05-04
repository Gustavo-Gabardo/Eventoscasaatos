/**
 * Sistema de Gerenciamento de Eventos da Casa Atos
 * Este arquivo contém todas as funcionalidades JavaScript do sistema,
 * incluindo o gerenciamento de eventos, inscrições e área administrativa.
 */

/**
 * Página Inicial - Funções relacionadas à exibição dos eventos na página principal
 */

// Carrega e exibe os eventos disponíveis na página inicial
function carregarEventos() {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const eventosContainer = document.getElementById("eventosContainer");

    // Se não houver eventos, mostra uma mensagem amigável
    if (eventos.length === 0) {
        eventosContainer.innerHTML = `
            <div class="no-events">
                <i class="fas fa-calendar-times" style="font-size: 3rem; color: #ff9800; margin-bottom: 15px;"></i>
                <p>Ainda não temos eventos disponíveis. Volte em breve!</p>
            </div>
        `;
        return;
    }

    // Limpa o container antes de adicionar os eventos
    eventosContainer.innerHTML = "";

    // Cria os cards para cada evento
    eventos.forEach((evento, index) => {
        eventosContainer.innerHTML += `
            <div class="evento-card">
                <div class="evento-header">
                    <h3>${evento.nome} <span onclick="mostrarDescricao(${index})" class="descricao-icone">
                        <i class="fas fa-info-circle"></i>
                    </span></h3>
                </div>
                <p class="data"><i class="fas fa-calendar-day"></i> ${formatarData(evento.data)}</p>
                <div class="horario-local">
                    <span><i class="far fa-clock"></i> ${evento.horario}</span>
                    <span><i class="fas fa-map-marker-alt"></i> ${evento.local}</span>
                </div>
                <div id="descricao-${index}" class="descricao-evento" style="display: none;">
                    <p><i class="fas fa-align-left"></i> ${evento.descricao}</p>
                </div>
                <button onclick="inscreverEvento('${evento.nome}')">
                    <i class="fas fa-user-plus"></i> Participar deste Evento
                </button>
            </div>
        `;
    });
}

// Formata a data para o formato brasileiro com dia da semana
function formatarData(data) {
    const partes = data.split("-");
    const dataObj = new Date(`${partes[0]}-${partes[1]}-${partes[2]}`);
    return dataObj.toLocaleDateString("pt-BR", { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });
}

// Controla a exibição da descrição do evento ao clicar no ícone de informação
function mostrarDescricao(index) {
    const descricao = document.getElementById(`descricao-${index}`);
    descricao.style.display = descricao.style.display === "none" ? "block" : "none";
}

// Redireciona para a página de inscrição com o evento selecionado
function inscreverEvento(eventoNome) {
    window.location.href = `cadastro.html?evento=${encodeURIComponent(eventoNome)}`;
}

/**
 * Validação de CPF
 * Implementa a lógica completa de validação de CPF seguindo as regras da Receita Federal
 */
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]+/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica CPFs com números repetidos (ex: 111.111.111-11)
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let digito1 = 11 - (soma % 11);
    if (digito1 === 10 || digito1 === 11) digito1 = 0;
    if (digito1 !== parseInt(cpf.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf.charAt(i)) * (11 - i);
    }
    let digito2 = 11 - (soma % 11);
    if (digito2 === 10 || digito2 === 11) digito2 = 0;
    if (digito2 !== parseInt(cpf.charAt(10))) return false;
    
    return true;
}

/**
 * Área Administrativa - Funções para gerenciamento de eventos e usuários
 */

// Valida o login do administrador
function validarLogin(event) {
    event.preventDefault();
    const senhaDigitada = document.getElementById("senha").value;
    const senhaCorreta = "0000"; // Senha padrão do administrador

    if (senhaDigitada === senhaCorreta) {
        window.location.href = "dashboard.html";
    } else {
        document.getElementById("erroSenha").textContent = "❌ Senha incorreta. Por favor, tente novamente.";
    }
}

// Cadastra um novo evento no sistema
function cadastrarEvento() {
    // Coleta os dados do formulário
    const nome = document.getElementById("nomeEvento").value;
    const data = document.getElementById("dataEvento").value;
    const horario = document.getElementById("horarioEvento").value;
    const local = document.getElementById("localEvento").value;
    const descricao = document.getElementById("descricaoEvento").value;

    // Salva o novo evento
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    eventos.push({ nome, data, horario, local, descricao });
    localStorage.setItem("eventos", JSON.stringify(eventos));

    alert("✅ Evento cadastrado com sucesso!");
}

/**
 * Gerenciamento de Inscritos - Funções para listar e gerenciar participantes
 */

// Carrega a lista de eventos no painel administrativo
function carregarEventosAdmin() {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const listaEventos = document.getElementById("listaEventos");

    listaEventos.innerHTML = eventos.length === 0 ? "<p>Nenhum evento cadastrado.</p>" : "";

    eventos.forEach((evento, index) => {
        listaEventos.innerHTML += `
            <div class="evento-lista">
                <div class="evento-header">
                    <div class="evento-titulo">
                        <h4>${evento.nome}</h4>
                        <div class="evento-detalhes">
                            <span>📅 ${formatarData(evento.data)}</span>
                            <span>🕒 ${evento.horario}</span>
                            <span>📍 ${evento.local}</span>
                        </div>
                    </div>
                    <div class="evento-acoes">
                        <button class="botao-acao editar" onclick="editarEvento(${index})" title="Editar evento">
                            ✏️ Editar
                        </button>
                        <button class="botao-acao excluir" onclick="excluirEvento(${index})" title="Excluir evento">
                            🗑️ Excluir
                        </button>
                    </div>
                </div>
                <div class="evento-descricao">
                    <p>${evento.descricao}</p>
                </div>
            </div>
        `;
    });
}

// Carrega e exibe a lista de inscritos por evento
function carregarInscritos() {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const inscritos = JSON.parse(localStorage.getItem("inscritos")) || [];
    const listaInscritos = document.getElementById("listaInscritos");

    const eventosAtivos = eventos.map(evento => evento.nome);
    const inscritosAtivos = inscritos.filter(inscrito => eventosAtivos.includes(inscrito.evento));

    listaInscritos.innerHTML = inscritosAtivos.length === 0 ? "<p>Nenhum inscrito até o momento.</p>" : "";

    const eventosComInscritos = [...new Set(inscritosAtivos.map(inscrito => inscrito.evento))];

    eventosComInscritos.forEach(eventoNome => {
        const inscritosEvento = inscritosAtivos.filter(inscrito => inscrito.evento === eventoNome);
        const evento = eventos.find(e => e.nome === eventoNome);
        
        let html = `
            <div class="evento-lista">
                <div class="evento-header">
                    <div class="evento-titulo">
                        <h4>${eventoNome}</h4>
                        <div class="evento-detalhes">
                            <span>📅 ${formatarData(evento?.data)}</span>
                            <span>🕒 ${evento?.horario || 'Horário não definido'}</span>
                            <span>📍 ${evento?.local || 'Local não definido'}</span>
                        </div>
                    </div>
                    <div class="evento-contador">
                        <span class="contador-inscritos">
                            👥 ${inscritosEvento.length} inscrito${inscritosEvento.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
        `;
        
        inscritosEvento.forEach(inscrito => {
            html += `
                <div class="inscrito-item">
                    <div class="inscrito-info">
                        <strong>${inscrito.nome}</strong>
                        <span class="inscrito-detalhes">
                            <span>${inscrito.idade} anos</span>
                            <span class="inscrito-cpf">CPF: ${formatarCPF(inscrito.cpf)}</span>
                        </span>
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        listaInscritos.innerHTML += html;
    });

    // Adicionar evento de exportação para Excel
    const btnExportar = document.getElementById('exportarExcel');
    if (btnExportar) {
        btnExportar.addEventListener('click', exportarParaExcel);
    }
}

// Formata o CPF para exibição (000.000.000-00)
function formatarCPF(cpf) {
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Exportação de Dados - Função para exportar lista de inscritos para Excel
 */
function exportarParaExcel() {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const inscritos = JSON.parse(localStorage.getItem("inscritos")) || [];
    
    // Preparar dados para exportação
    const dados = inscritos.map(inscrito => {
        const evento = eventos.find(e => e.nome === inscrito.evento);
        return {
            'Nome': inscrito.nome,
            'Idade': inscrito.idade,
            'CPF': formatarCPF(inscrito.cpf),
            'Evento': inscrito.evento,
            'Data': evento?.data || 'Não definida',
            'Horário': evento?.horario || 'Não definido',
            'Local': evento?.local || 'Não definido'
        };
    });

    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inscritos");

    // Configurar larguras das colunas
    const colunas = [
        { wch: 30 }, // Nome
        { wch: 8 },  // Idade
        { wch: 15 }, // CPF
        { wch: 30 }, // Evento
        { wch: 12 }, // Data
        { wch: 10 }, // Horário
        { wch: 30 }  // Local
    ];
    ws['!cols'] = colunas;

    // Exportar arquivo
    const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `Lista_Inscritos_${dataAtual}.xlsx`);
}

/**
 * Gerenciamento de Eventos - Funções para edição e exclusão
 */

// Remove um evento e seus inscritos
function excluirEvento(index) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const eventoRemovido = eventos[index].nome;

    eventos.splice(index, 1);
    localStorage.setItem("eventos", JSON.stringify(eventos));

    let inscritos = JSON.parse(localStorage.getItem("inscritos")) || [];
    inscritos = inscritos.filter(inscrito => inscrito.evento !== eventoRemovido);
    localStorage.setItem("inscritos", JSON.stringify(inscritos));

    carregarEventosAdmin();
    carregarInscritos();
}

// Permite editar os dados de um evento
function editarEvento(index) {
    const eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    const evento = eventos[index];

    const novoNome = prompt("Novo nome do evento:", evento.nome);
    const novaData = prompt("Nova data do evento:", evento.data);
    const novoHorario = prompt("Novo horário do evento:", evento.horario);
    const novoLocal = prompt("Novo local do evento:", evento.local);
    const novaDescricao = prompt("Nova descrição do evento:", evento.descricao);

    if (novoNome && novaData && novoHorario && novoLocal && novaDescricao) {
        eventos[index] = { 
            nome: novoNome, 
            data: novaData, 
            horario: novoHorario,
            local: novoLocal, 
            descricao: novaDescricao 
        };
        localStorage.setItem("eventos", JSON.stringify(eventos));
        carregarEventosAdmin();
    }
}

// Remove um evento específico do sistema
function limparEventoEspecifico(nomeEvento) {
    // Remover o evento específico
    let eventos = JSON.parse(localStorage.getItem("eventos")) || [];
    eventos = eventos.filter(evento => evento.nome !== nomeEvento);
    localStorage.setItem("eventos", JSON.stringify(eventos));

    // Remover inscritos deste evento
    let inscritos = JSON.parse(localStorage.getItem("inscritos")) || [];
    inscritos = inscritos.filter(inscrito => inscrito.evento !== nomeEvento);
    localStorage.setItem("inscritos", JSON.stringify(inscritos));
}

/**
 * Inicialização do Sistema
 * Configura os eventos e comportamentos quando a página é carregada
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicialização para página de cadastro
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        // Adicionar jQuery e jQuery Mask Plugin
        const jqueryScript = document.createElement('script');
        jqueryScript.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
        document.head.appendChild(jqueryScript);

        jqueryScript.onload = function() {
            const maskScript = document.createElement('script');
            maskScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jquery.mask/1.14.16/jquery.mask.min.js';
            document.head.appendChild(maskScript);

            maskScript.onload = function() {
                // Aplicar máscara ao CPF
                $('#cpf').mask('000.000.000-00');

                // Validação do CPF em tempo real
                $('#cpf').on('blur', function() {
                    const cpf = $(this).val();
                    if (cpf) {
                        if (!validarCPF(cpf)) {
                            $('#cpfError').show();
                            $(this).addClass('input-error');
                        } else {
                            $('#cpfError').hide();
                            $(this).removeClass('input-error');
                        }
                    }
                });
            };
        };

        cadastroForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const cpf = document.getElementById('cpf').value;

            if (!validarCPF(cpf)) {
                alert('CPF inválido. Por favor, insira um CPF válido.');
                return;
            }

            const nome = document.getElementById('nome').value;
            const idade = document.getElementById('idade').value;
            const urlParams = new URLSearchParams(window.location.search);
            const evento = urlParams.get('evento') || 'Evento não especificado';

            const inscritos = JSON.parse(localStorage.getItem('inscritos')) || [];
            inscritos.push({ 
                nome, 
                idade, 
                cpf: cpf.replace(/[^\d]+/g, ''), 
                evento 
            });

            localStorage.setItem('inscritos', JSON.stringify(inscritos));

            const mensagem = document.getElementById('mensagemSucesso');
            mensagem.style.display = 'block';
            mensagem.classList.add('fade-in');

            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000);
        });
    }

    // Inicialização para outras páginas
    if (document.getElementById('eventosContainer')) {
        carregarEventos();
    }
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', validarLogin);
    }
    if (document.getElementById('eventoForm')) {
        document.getElementById('eventoForm').addEventListener('submit', function(event) {
            event.preventDefault();
            cadastrarEvento();
        });
    }
    if (document.getElementById('listaEventos')) {
        carregarEventosAdmin();
        carregarInscritos();
    }
    
    // Limpar o evento Workshop de Tecnologia
    limparEventoEspecifico("Workshop de Tecnologia");
});