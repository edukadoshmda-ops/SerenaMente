# -*- coding: utf-8 -*-
"""
Gerador de Áudios Neurais Profissionais de Alta Fidelidade (Studio Quality)
Usa vozes neurais da Microsoft (pt-BR-FranciscaNeural e pt-BR-AntonioNeural)
com limpeza profunda de markdown, asteriscos, pontuação e símbolos.
"""

import asyncio
import os
import re
import sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PUBLIC_AUDIO = os.path.join(ROOT, "public", "audio")

VOICES = {
    "feminina": "pt-BR-FranciscaNeural",
    "masculina": "pt-BR-AntonioNeural"
}

def clean_speech_text(text: str) -> str:
    """Limpa rigorosamente qualquer markdown, asteriscos, pontos ou símbolos estranhos."""
    if not text:
        return ""
    
    t = text
    
    # 1. Pronúncias e termos técnicos / clínicos
    rules = [
        (r"5-4-3-2-1", "cinco, quatro, três, dois, um"),
        (r"4-7-8", "quatro, sete, oito"),
        (r"100%", "cem por cento"),
        (r"%", " por cento"),
        (r"\bCVV\b", "Centro de Valorização da Vida"),
        (r"\b188\b", "um, oito, oito"),
        (r"\b192\b", "um, nove, dois"),
        (r"\bSAMU\b", "Samu"),
        (r"\bUPA\b", "Upa"),
        (r"\bCAPS\b", "Caps"),
        (r"\bSUS\b", "Sus"),
        (r"\bTCC\b", "Terapia Cognitivo-Comportamental"),
        (r"\bTAG\b", "Transtorno de Ansiedade Generalizada"),
        (r"\bTOC\b", "Transtorno Obsessivo-Compulsivo"),
        (r"\bWhatsApp\b", "Uatsap"),
        (r"\*shhh\.\.\.\s*shhh\.\.\.\s*shhh\.\.\.\*", "um sussurro calmo e constante"),
        (r"Ploc\.\.\.\s*ploc\.\.\.", "Ploc, ploc"),
        (r"Tuc-tuc\.\.\.\s*tuc-tuc\.\.\.", "Tuc tuc, tuc tuc"),
        (r"Tock\.\.\.", "Tock,"),
        (r"Ahhh\.\.\.", "Ahhh,"),
    ]
    for pat, rep in rules:
        t = re.sub(pat, rep, t, flags=re.IGNORECASE)

    # 2. Remover formatação markdown (asteriscos, negrito, itálico, cabeçalhos, citações)
    t = re.sub(r"\*{1,3}(.*?)\*{1,3}", r"\1", t)  # **negrito** ou *itálico*
    t = re.sub(r"_{1,3}(.*?)_{1,3}", r"\1", t)    # __negrito__
    t = re.sub(r"#{1,6}\s*", "", t)               # # Título
    t = re.sub(r"^>\s*", "", t, flags=re.MULTILINE) # > Citação
    t = re.sub(r"`.*?`", "", t)                   # código inline
    
    # 3. Remover caracteres especiais e símbolos
    t = t.replace("*", "")
    t = t.replace("#", "")
    t = t.replace("~", "")
    t = t.replace("|", ", ")
    t = t.replace("&", " e ")
    t = t.replace("•", "")
    t = re.sub(r"^\s*-\s+", "", t, flags=re.MULTILINE) # - listas
    t = re.sub(r"^\s*\d+\.\s+", "", t, flags=re.MULTILINE) # 1. listas
    
    # 4. Traços e aspas
    t = t.replace("—", ", ").replace("–", ", ").replace(" - ", ", ")
    t = t.replace('"', "").replace("“", "").replace("”", "").replace("'", "")
    t = t.replace("(", ", ").replace(")", ", ")
    t = t.replace("[", "").replace("]", "")
    
    # 5. Remover emojis
    emoji_pattern = re.compile(
        r'[\U00010000-\U0010ffff]'
        r'|[\u2600-\u27BF]'
        r'|[\uD83C-\uDBFF\uDC00-\uDFFF]', 
        flags=re.UNICODE
    )
    t = emoji_pattern.sub('', t)

    # 6. Pontos suspensivos -> pausa suave (vírgula) para não ler 'ponto ponto ponto'
    t = re.sub(r"\.{2,}", ", ", t)

    # 7. Limpeza de espaços e pontuações duplicadas
    t = re.sub(r",\s*,+", ",", t)
    t = re.sub(r"\s+", " ", t).strip()
    
    return t

# Histórias e Capítulos dos Playbooks
STORIES_DATA = {
    "sono-cabana": {
        "rate": "-8%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """Ajuste o seu corpo no colchão. Puxe o cobertor até uma altura confortável. Permita que a sua cabeça afunde suavemente no centro do travesseiro.
Feche os olhos e deixe que a minha voz guie a sua imaginação para um lugar onde nada de ruim pode te alcançar.

Imagine que você está no início de uma trilha suave, no coração de uma floresta antiga de pinheiros e carvalhos gigantes.
O entardecer acabou de chegar, tingindo o céu entre as copas das árvores com tons suaves de lavanda e âmbar.
O ar aqui é incrivelmente puro, fresco e úmido. Quando você inspira, sente aquele aroma verde e terroso de folhas caídas, musgo macio e agulhas de pinheiro.

Cada passo que você dá sobre essa trilha é macio e silencioso. O solo acolchoado parece absorver o peso dos seus pés.
Com cada passo, você percebe que qualquer cansaço mental acumulado durante a semana, qualquer conversa difícil ou pensamento repetitivo vai ficando para trás. A floresta é imensa e generosa; ela recebe todas as suas tensões e as dissolve na terra viva.

Uma brisa fresca e suave toca a pele do seu rosto, levando embora o calor e a pressa do dia.
Ao longe, entre os galhos altos que balançam preguiçosamente ao vento, você ouve as primeiras gotas de uma chuva mansa de verão começando a cair sobre as folhas.
Um ritmo lento, constante e reconfortante."""
            },
            {
                "id": "cap-2",
                "text": """Seguindo a curva suave da trilha, envolta por uma névoa delicada, surge diante de você uma clareira acolhedora.
No centro da clareira está uma cabana de madeira maciça, construída com troncos escuros e pedras de rio.
Uma fumaça fina e aromática sobe em espirais pela chaminé de pedra, espalhando no ar o cheiro aconchegante de lenha queimando.
Pelas janelas de vidro grosso, uma luz dourada e alaranjada ilumina suavemente o chão molhado.

Você caminha até a varanda coberta de madeira, onde a chuva bate com um som oco e delicioso.
Você empurra a pesada porta de cedro. Ela se abre com um clique macio, sem rangidos.
Ao entrar, o contraste é imediato: o ar lá fora era fresco e chuvoso; aqui dentro, o calor ameno e doce te abraça por inteiro, como um agasalho felpudo recém-saído do sol.

Na lareira de pedra rústica, toras grossas de cedro e eucalipto crepitam num ritmo tranquilo e preguiçoso.
Pequenas centelhas douradas sobem e desaparecem na chaminé. O estalo ritmado da madeira queimando é como um metrônomo para o seu sistema nervoso.
Sobre uma mesa rústica, uma xícara de louça branca solta vapor com aroma de camomila, mel silvestre e folhas de erva-cidreira.
Não há relógios de parede. Não há telas de telefone piscando. O tempo aqui parou para que você possa finalmente repousar."""
            },
            {
                "id": "cap-3",
                "text": """Ao fundo da cabana, em um nicho protegido sob o teto inclinado de vigas de madeira, repousa uma cama ampla e convidativa.
Os lençóis de linho puro são macios e têm o cheiro fresco de lavanda orvalhada.
Sobre o colchão há um edredom pesado e acolchoado de penas macias.

Você se aproxima da cama e se deita devagar.
Sinta agora a sensação física de afundar nesse edredom. Ele envolve o seu corpo dos ombros aos pés com um peso perfeito e reconfortante, nem muito quente, nem frio. Apenas a temperatura ideal de segurança absoluta.
A chuva lá fora agora cai com mais firmeza, ritmada e sem pressa, batendo contra o telhado de telhas de ardósia logo acima de você.
O barulho contínuo e abafado da água escorrendo pelas calhas funciona como uma barreira protetora entre você e todo o resto do planeta.

Lá fora a noite é escura e chuvosa, mas você está abrigado, aquecido e sem nenhuma obrigação.
O fogo na lareira vai diminuindo suavemente, transformando-se em brasas vermelhas e douradas que emitem um calor constante e pacífico.
Seus pensamentos agora são lentos, pesados e preguiçosos, como folhas de outono flutuando sobre as águas calmas de um riacho.
Você solta o maxilar. Solta o pescoço. Os braços pesam. As pernas pesam.
Você não precisa fazer mais nada hoje. O que passou, passou; o que virá, esperará o amanhã.
Agora é só você, a cabana na floresta e o som suave da chuva te embalando para o sono mais profundo e restaurador da sua vida.
Durma... descanse... você está seguro."""
            }
        ]
    },
    "sono-expresso": {
        "rate": "-8%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """Deixe o seu corpo se acomodar. Solte a musculatura das costas e deixe a gravidade fazer o trabalho dela.
Você está prestes a embarcar no lendário Expresso Noturno das Montanhas.

Imagine-se caminhando pelo corredor silencioso de um vagão clássico de época.
As paredes são de mogno polido, os tapetes de veludo verde-escuro abafam completamente o som dos passos e pequenos candelabros de bronze emitem uma luz quente e suave.
Você encontra a sua cabine privativa. A porta de madeira desliza silenciosamente sobre trilhos de latão.

Ao entrar, você fecha a tranca. Esse é o seu espaço sagrado durante toda a noite.
Uma grande janela panorâmica de vidro duplo ocupa quase toda a parede externa.
Em frente à janela há uma cama espaçosa, já arrumada com lençóis de cetim fresco, travesseiros fofos e uma manta de lã azul-marinho.
O trem começa a se mover com lentidão imperceptível.
Uma vibração suave e profunda sobe do assoalho e percorre a estrutura do trem.
Tuc tuc, tuc tuc, tuc tuc.
O trem ganha ritmo constante, deslizando suavemente para fora da estação e entrando na imensidão da noite."""
            },
            {
                "id": "cap-2",
                "text": """Você apaga a luz principal da cabine, deixando acesa apenas uma luminária âmbar de intensidade mínima ao lado da cabeceira.
Pela grande janela panorâmica, o mundo exterior se transforma em uma pintura mágica em tons de azul e prata.
A lua cheia, alta e brilhante no céu limpo, ilumina vales profundos, rios de águas calmas que refletem as estrelas e florestas densas de coníferas.

O trem cruza uma alta ponte de pedra em arco sobre um desfiladeiro. O som dos trilhos se torna mais profundo e ecoa pelas montanhas como uma canção ancestral.
Mais adiante, nas encostas distantes dos vales, você avista pequenos vilarejos adormecidos. Quase todas as luzes das casas já estão apagadas; as famílias já repousam em paz.
O mundo inteiro está em silêncio, descansando.
Você percebe que a noite não é vazia; a noite é o abraço que a natureza oferece a todos os seres vivos para que possam reconstruir suas energias.

O balanço lateral do vagão é suave e compassado.
Para um lado... e para o outro.
Para a esquerda... e para a direita.
Como um berço infinito que acalma a mente mais agitada.
Cada metro que o trem avança pelas montanhas parece afastar você das preocupações terrestres, das listas de afazeres e das exigências do cotidiano."""
            },
            {
                "id": "cap-3",
                "text": """Você se deita confortavelmente sobre os travesseiros macios e puxa a manta azul até o queixo.
A temperatura da cabine é perfeita. O vidro panorâmico te permite contemplar as constelações enquanto seu corpo relaxa completamente.
O trem entra suavemente em um longo túnel esculpido na montanha de granito.
A escuridão do túnel é aveludada, acolhedora e segura.
O som abafado dos trilhos ganha um tom ainda mais grave e hipnótico:
Tuc tuc, tuc tuc, descanso, paz, sono.

A cada respiração sua, o peito sobe e desce sem esforço algum.
Seus olhos estão pesados demais para ficarem abertos. Você os fecha com doçura.
A imagem das estrelas e das montanhas continua gravada suavemente na sua memória interior.
O trem continuará cruzando a noite por você, firme e seguro em seus trilhos, sem que você precise guiar nada.
Entregue-se ao ritmo compassado.
Deixe que o sono venha como uma onda mansa de alívio.
Durma em paz. Tenha uma noite linda."""
            }
        ]
    },
    "sono-zen": {
        "rate": "-8%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """Solte todo o ar dos pulmões com um suspiro suave. Ahhh.
Deixe que o peso do dia saia de você junto com esse ar.
Agora visualize-se diante de um imenso portão de madeira antiga avermelhada, cravado na encosta de uma colina silenciosa.

Ao empurrar o portão, você entra em um jardim zen milenar banhado pela luz prateada da lua cheia.
O chão é formado por pedras de rio perfeitamente arredondadas e lisas.
A cada passo que você dá sobre as pedras, uma sensação deliciosa de massagem relaxa as solas dos seus pés.
Ao redor do caminho, altos bambuzais verdes balançam no ritmo do vento suave da noite.
O atrito dos colmos de bambu produz um sussurro calmo e musical, que limpa a poeira dos pensamentos acumulados."""
            },
            {
                "id": "cap-2",
                "text": """O caminho de pedras te conduz até a margem de um lago de águas incrivelmente límpidas e espelhadas.
Na superfície da água, dezenas de flores de lótus brancas e rosadas flutuam em repouso absoluto.
Ao lado do lago, uma bica de bambu deixa cair uma gota de água cristalina a cada poucos segundos sobre uma bacia de pedra esculpida.
Tock, o som límpido da gota na água reverbera no silêncio da noite, dissolvendo qualquer urgência.

Na água do lago, você enxerga o reflexo límpido da lua e das estrelas.
A água não tenta correr, não tenta se apressar; ela simplesmente repousa no seu próprio leito, serena e transparente.
Diga a você mesmo: Como as águas deste lago, a minha mente pode descansar em serenidade. Não há nada para defender, nada para provar.
Você se senta em um banco de madeira polida perto da água e sente a musculatura dos ombros, da nuca e da testa se descontraírem por completo."""
            },
            {
                "id": "cap-3",
                "text": """À beira do lago ergue-se um pavilhão com tatames macios de palha de arroz prensada, cobertos por futons fofos de algodão branco.
O ar aqui dentro tem o suave aroma de incenso de sândalo e flores frescas de lótus.
Paredes de papel de arroz filtram a brisa noturna, deixando entrar apenas um sopro fresco e puro.

Você se acomoda no futon. O contato com o colchão firme e macio sustenta a sua coluna com equilíbrio impecável.
Ao longe, os sinos de vento de cerâmica tocam notas agudas e cristalinas com o passar da brisa.
Tudo neste santuário existe para lembrar à sua mente que você é bem-vindo no mundo vivo.
A batalha de hoje acabou. Você fez o que foi possível e foi suficiente.
Feche os olhos para o mundo exterior e abra o seu coração para o descanso sagrado.
Respire, entregue-se, e durma no abraço sereno da noite."""
            }
        ]
    },
    "crise-sos": {
        "rate": "-5%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """Pare tudo o que você estiver fazendo agora. Coloque uma das mãos sobre o centro do seu peito e a outra sobre o seu umbigo.
Sinta o calor físico da sua mão contra a sua roupa.
Se o seu coração está disparado como um tambor, se a sua respiração parece curta e superficial, ou se você sente um nó na garganta e formigamento nos dedos, ouça isso com toda a clareza da ciência:

Você não está tendo um ataque cardíaco. Você não está enlouquecendo. Você não vai perder o controle.
Você está tendo apenas uma reação fisiológica de alarme falso.

O que aconteceu nos últimos minutos é que a sua amígdala cerebral disparou uma enxurrada de adrenalina e cortisol na sua corrente sanguínea. Esse sistema é maravilhoso: ele foi projetado há milhões de anos para proteger os nossos ancestrais de predadores selvagens. 
O problema é que o seu cérebro acionou o alarme sem que houvesse um leão na sua sala.
É como um alarme de fumaça ultrasensível que toca só porque alguém deixou o pão tostar demais na torradeira. Há barulho, mas não há incêndio mortal.

Repita em voz alta ou na mente agora:
Isso é muito desconfortável, mas é cem por cento inofensivo. Meu corpo é sábio e sabe exatamente como metabolizar essa adrenalina. Isso vai passar nos próximos minutos."""
            },
            {
                "id": "cap-2",
                "text": """Agora nós vamos acionar a fisiologia reversa através do nervo vago. O nervo vago é o cabo de comunicação que conecta o cérebro aos pulmões e ao coração.
Quando você alonga a sua expiração, os barorreceptores cardíacos enviam um sinal químico imediato para o nó sinoatrial dizendo: Diminua os batimentos cardíacos. Não há perigo aqui.

Vamos fazer quatro ciclos juntos agora:
Solte todo o ar pela boca, esvazie completamente os pulmões.
Agora, inspire suavemente pelo nariz contando: um, dois, três, quatro.
Segure esse ar tranquilamente nos pulmões: um, dois, três, quatro, cinco, seis, sete.
E agora sopre devagar pela boca entreaberta, fazendo um som suave de vento: um, dois, três, quatro, cinco, seis, sete, oito.

Muito bem. Vamos ao segundo ciclo:
Puxe o ar pelo nariz: um, dois, três, quatro.
Segure com serenidade: um, dois, três, quatro, cinco, seis, sete.
Solte o sopro longo e morno: um, dois, três, quatro, cinco, seis, sete, oito.

Perceba como os seus ombros caem naturalmente na expiração.
Destrave os dentes molares. Deixe a ponta da língua repousar solta atrás dos dentes inferiores.
O seu coração já está diminuindo o ritmo. O pico da adrenalina já começou a descer."""
            },
            {
                "id": "cap-3",
                "text": """A ansiedade vive exclusivamente no futuro hipotético, ela vive na pergunta assustadora: E se acontecer o pior?
A calma vive no único lugar que realmente existe: o mundo físico dos seus sentidos aqui e agora.
Abra os olhos devagar e olhe ao redor do seu espaço físico:

Procure mentalmente:
Cinco coisas que você pode ver com detalhes: a textura do teto, a maçaneta da porta, a costura da sua calça, a luz na janela, a sombra de um objeto.
Quatro coisas que você pode sentir pelo tato agora: o peso dos seus pés no chão, a textura do tecido da sua roupa, a temperatura do ar na ponta do nariz, o encosto da cadeira nas suas costas.
Três sons reais no ambiente: o som da minha voz, o som da geladeira ou de um carro distante na rua, o som do seu próprio fôlego.
Dois aromas ou cheiros presentes no ar.
Um sabor presente na sua boca ou tome agora um gole de água fresca sentindo a água descer até o estômago.

Olhe para as suas mãos. Você está aqui. Neste exato minuto, você está a salvo.
A tempestade perdeu a força. Você conseguiu superar mais uma onda. Respire com orgulho da sua coragem."""
            }
        ]
    },
    "passo-a-passo": {
        "rate": "-5%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """A maior crueldade da depressão é que ela te diz: Espere a vontade voltar para fazer alguma coisa.
Mas a neurobiologia moderna comprovou exatamente o oposto: na depressão, a via dopaminérgica da recompensa está temporariamente deprimida. Esperar a vontade espontânea chegar é como esperar o carro andar com o tanque vazio.

A regra de ouro da Terapia Cognitivo-Comportamental é: A ação precede a motivação.
A centelha de vontade só se acende depois que você se move minimamente.

Não tente arrumar a casa inteira hoje. Não tente responder a todos os emails atrasados.
Escolha uma ação de tamanho ridículo de tão fácil. Tão pequena que seja impossível falhar:
Não arrumar a cama inteira, apenas puxar o lençol até cobrir o travesseiro.
Não fazer exercícios pesados, apenas fazer um alongamento de braços de trinta segundos.
Não limpar a cozinha inteira, apenas colocar uma xícara na pia.

Ao concluir essa micro-ação, o seu cérebro registra: Eu consegui agir.
Cada micro-passo é uma vitória genuína contra a paralisia."""
            },
            {
                "id": "cap-2",
                "text": """Observe com que palavras você tem falado consigo mesmo nos últimos dias:
Eu sou um peso para os outros.
Eu deveria ser mais forte.
Olhe para as outras pessoas da minha idade produzindo tanto, e eu aqui sem forças.

Se um amigo seu estivesse com pneumonia grave, com trinta e nove graus de febre e sem forças para sair da cama, você gritaria com ele chamando-o de preguiçoso? Você diria que ele deveria ter vergonha por estar deitado?
Jamais. Você levaria uma caneca de sopa quente, arrumaria o cobertor dele e diria com carinho: Descanse o quanto precisar. Seu corpo está lutando contra uma doença.

A depressão é uma condição biológica tão real e debilitante quanto uma pneumonia ou uma perna fraturada.
A única diferença é que as feridas da depressão não sangram para fora; elas doem na alma.
Por que você é tão gentil com o sofrimento dos outros e tão impiedoso com a sua própria dor?

Hoje, toda vez que a voz da culpa surgir, responda com firmeza compassiva:
Eu estou doente agora, mas estou me curando. Eu estou fazendo o melhor que consigo com a energia que tenho hoje."""
            },
            {
                "id": "cap-3",
                "text": """O instinto primário da mente deprimida é cavar um buraco e se esconder do mundo. O isolamento parece proteger da vergonha, mas na verdade ele funciona como combustível para a tristeza.
Você não precisa comparecer a eventos sociais cheios de gente nem ter conversas longas e cansativas.

Use a estratégia da micro-conexão:
Envie um emoji de sol ou de coração no aplicativo para alguém de confiança, sem obrigação de continuar o assunto.
Acaricie um cachorro ou gato, sentindo a respiração morna e o pelo macio do animal. Os animais têm uma capacidade mágica de curar sem exigir explicações.
Ao comprar um pão ou café, olhe nos olhos do atendente e dê um sincero muito obrigado, tenha um bom dia.
Regue uma plantinha no vaso e veja a folha verde brilhar com a água.

Fazer contato com o mundo vivo, mesmo que por uma fração de segundo, quebra o ciclo de solidão da depressão e planta uma semente invisível de recomeço."""
            }
        ]
    },
    "reprogramando": {
        "rate": "-5%",
        "chapters": [
            {
                "id": "cap-1",
                "text": """A lição mais libertadora de toda a psicologia cognitivo-comportamental pode ser resumida em cinco palavras:
Pensamento não é fato consumado.

A sua mente é um órgão biológico especializado em produzir narrativas. Da mesma forma que o seu estômago produz suco gástrico e o seu coração bombeia sangue, o seu cérebro produz pensamentos, centenas deles a cada hora.
Muitos desses pensamentos são geniais e úteis. Mas muitos outros são lixo cognitivo, alarmes falsos e roteiros de filmes dramáticos que nunca vão acontecer.

Quando a sua mente disparar a frase: Vai dar tudo errado, eu vou perder tudo, não lute contra ela. Apenas coloque uma moldura ao redor:
Olha só: minha mente está tendo novamente o pensamento de catástrofe número três.

Ao dizer isso, você dá um passo para trás. Você deixa de ser a tempestade e volta a ser o céu imenso que observa a tempestade passar."""
            },
            {
                "id": "cap-2",
                "text": """Toda vez que uma preocupação obsessiva começar a rodar em loop na sua cabeça como um disco arranhado, coloque-a no banco dos réus e faça essas três perguntas:

Primeiro: Qual é a evidência concreta e comprovada desse medo agora?
Atenção: sentimentos não são evidências. Só porque você sente medo, isso não prova que há um perigo real.

Segundo: Se o pior cenário realmente acontecesse, o que eu faria para lidar com ele?
A ansiedade te faz subestimar terrivelmente a sua capacidade de adaptação. Lembre-se de quantas crises familiares, financeiras ou emocionais gravíssimas você já enfrentou e superou no passado.

Terceiro: Qual é o cenário mais provável e realista?
A vida raramente é o conto de fadas perfeito, mas quase nunca é a tragédia extrema que a mente ansiosa pinta. A realidade é sempre um tom equilibrado de cinza."""
            },
            {
                "id": "cap-3",
                "text": """Você não é fraco ou defeituoso por ter momentos de crise. Pelo contrário: carregar a carga invisível da ansiedade e da depressão exige uma resistência sobre-humana que poucas pessoas que nunca passaram por isso conseguem imaginar.

Parabenize a si mesmo por estar aqui hoje.
Por abrir este aplicativo, por colocar os fones de ouvido e por querer melhorar.
Esse gesto de autocuidado é a maior prova de amor próprio que você poderia se dar.
Você está no caminho da restauração. Um dia de cada vez, um suspiro de cada vez. Você vai vencer essa fase."""
            }
        ]
    }
}

async def generate_chapter(story_slug, chap_id, raw_text, rate):
    cleaned = clean_speech_text(raw_text)
    
    for gender, voice_name in VOICES.items():
        out_dir = os.path.join(PUBLIC_AUDIO, story_slug, gender)
        os.makedirs(out_dir, exist_ok=True)
        out_file = os.path.join(out_dir, f"{chap_id}.mp3")
        
        # Gerar áudio neural
        comm = edge_tts.Communicate(cleaned, voice_name, rate=rate)
        await comm.save(out_file)
        size_kb = os.path.getsize(out_file) // 1024
        print(f"[{gender.upper()}] Gerado: {story_slug}/{chap_id}.mp3 ({size_kb} KB)")

async def main():
    print("=== INICIANDO GERAÇÃO DE ÁUDIOS NEURAIS COM EDGE-TTS ===")
    total = sum(len(s["chapters"]) for s in STORIES_DATA.values()) * 2
    count = 0
    for story_slug, sdata in STORIES_DATA.items():
        rate = sdata.get("rate", "-5%")
        for ch in sdata["chapters"]:
            await generate_chapter(story_slug, ch["id"], ch["text"], rate)
            count += 2
            print(f"Progresso: {count}/{total} áudios concluídos.")
    print("=== TODOS OS ÁUDIOS FORAM GERADOS COM SUCESSO! ===")

if __name__ == "__main__":
    asyncio.run(main())
