# -*- coding: utf-8 -*-
"""Gera audiobook com narração profissional em pt-BR (feminina e masculina)
para o 'Guia de Cuidado Integral' e exporta dados para o app."""
import asyncio, json, os, re, sys
import edge_tts

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_AUDIO = os.path.join(ROOT, "public", "audio", "cuidado-integral")
VOICES = {
    "feminina": "pt-BR-FranciscaNeural",
    "masculina": "pt-BR-AntonioNeural"
}
RATE = "-5%"

CHAPTERS_DATA = [
    {
        "id": "cap-0",
        "title": "Introdução & Aviso Importante",
        "display_title": "Introdução & Aviso Importante",
        "display_content": """Guia de Cuidado Integral
Orientações práticas para o equilíbrio da mente, do corpo e da alimentação.

A saúde mental e a saúde física estão profundamente interconectadas. O cuidado com quadros de ansiedade e depressão exige uma abordagem integrativa, que compreenda o indivíduo em sua totalidade. Este guia reúne orientações baseadas em evidências para auxiliar no resgate do bem-estar e da qualidade de vida.

Aviso Importante:
Este material tem caráter informativo e de apoio. Ele não substitui o acompanhamento médico psiquiátrico, psicológico ou nutricional profissional.""",
        "speech_paragraphs": [
            "Guia de Cuidado Integral: Orientações práticas para o equilíbrio da mente, do corpo e da alimentação.",
            "A saúde mental e a saúde física estão profundamente interconectadas. O cuidado com quadros de ansiedade e depressão exige uma abordagem integrativa, que compreenda o indivíduo em sua totalidade. Este guia reúne orientações baseadas em evidências para auxiliar no resgate do seu bem-estar e da sua qualidade de vida.",
            "Aviso importante:",
            "Este material tem caráter informativo e de apoio. Ele não substitui o acompanhamento médico psiquiátrico, psicológico ou nutricional profissional."
        ]
    },
    {
        "id": "cap-1",
        "title": "1. O Cuidado com a Mente (Saúde Emocional)",
        "display_title": "1. O Cuidado com a Mente (Saúde Emocional)",
        "display_content": """1. O Cuidado com a Mente (Saúde Emocional)

Práticas Cognitivas:
• Validação: Permita-se sentir sem julgamentos severos.
• Aterramento (5-4-3-2-1): Identifique 5 coisas visíveis, 4 táteis, 3 auditivas, 2 olfativas e 1 gustativa.

Rotina e Limites:
• Micro-metas: Divida tarefas grandes em passos minúsculos.
• Desconexão digital: Reduza o tempo de tela e notícias alarmantes.""",
        "speech_paragraphs": [
            "Capítulo um: O cuidado com a mente e a saúde emocional.",
            "Para cultivar o equilíbrio interno, começamos pelas práticas cognitivas.",
            "Primeiro: a validação emocional. Permita-se sentir o que está sentindo, sem julgamentos severos e com profunda gentileza consigo mesmo.",
            "Segundo: a técnica de aterramento cinco, quatro, três, dois, um. Em momentos de agitação ou ansiedade, reconecte-se com o presente identificando ao seu redor:",
            "Cinco coisas visíveis que você pode ver.",
            "Quatro coisas que você pode tocar.",
            "Três sons que você consegue ouvir.",
            "Dois cheiros que você sente no ambiente.",
            "E um sabor na sua boca.",
            "Essa prática simples e poderosa ancora a sua atenção no aqui e agora.",
            "Em seguida, olhe para a sua rotina e seus limites.",
            "Adote micro-metas: divida tarefas grandes em passos minúsculos e possíveis.",
            "E pratique a desconexão digital: reduza o tempo de tela e evite o contato com notícias alarmantes, preservando a sua tranquilidade."
        ]
    },
    {
        "id": "cap-2",
        "title": "2. O Cuidado com o Corpo (Atividade Física e Sono)",
        "display_title": "2. O Cuidado com o Corpo (Atividade Física e Sono)",
        "display_content": """2. O Cuidado com o Corpo (Atividade Física e Sono)

• Atividade física leve a moderada: Caminhadas de 20 a 30 minutos diárias reduzem o cortisol e aliviam sintomas depressivos.
• Higiene do sono: Mantenha horários regulares para deitar e acordar, evitando telas 1 hora antes de dormir.
• Respiração diafragmática: Pratique respirações profundas para ativar o sistema nervoso parassimpático.""",
        "speech_paragraphs": [
            "Capítulo dois: O cuidado com o corpo, atividade física e sono.",
            "O nosso corpo é a base física e fisiológica das nossas emoções.",
            "Primeiro: pratique atividade física de leve a moderada. Caminhadas diárias de vinte a trinta minutos reduzem expressivamente os níveis de cortisol, o hormônio do estresse, e aliviam os sintomas depressivos.",
            "Segundo: cuide da higiene do seu sono. Mantenha horários regulares para deitar e acordar, evitando telas de celular, computador ou televisão pelo menos uma hora antes de dormir. Um ambiente calmo e escuro favorece o sono restaurador.",
            "Terceiro: respiração diafragmática. Ao longo do dia, pratique respirações profundas e lentas com o abdômen. Esse movimento simples ativa o sistema nervoso parassimpático, diminuindo a frequência cardíaca e induzindo o relaxamento."
        ]
    },
    {
        "id": "cap-3",
        "title": "3. Alimentação, Neurotransmissores & Apoio",
        "display_title": "3. Alimentação e Neurotransmissores",
        "display_content": """3. Alimentação e Neurotransmissores

Nutrientes e Benefícios para a Mente:
• Triptofano: Precursor da serotonina (humor e sono).
  Fontes: Banana, aveia, ovos, oleaginosas, frango.
• Ômega-3: Ação anti-inflamatória cerebral e neuronal.
  Fontes: Peixes gordos, linhaça, chia.
• Magnésio / Complexo B: Redução da fadiga mental e ansiedade.
  Fontes: Folhas verde-escuras, castanhas.
• Hidratação: Evita quedas de energia e névoa mental.
  Fontes: Água, água de coco, chás calmantes.

Lembrete de Apoio:
Se você ou alguém que você conhece está enfrentando momentos difíceis, busque ajuda profissional ou ligue para o CVV (Centro de Valorização da Vida) pelo número 188 (disponível 24h).""",
        "speech_paragraphs": [
            "Capítulo três: Alimentação, neurotransmissores e apoio.",
            "A alimentação desempenha um papel fundamental no equilíbrio químico do cérebro e na regulação do humor.",
            "Primeiro: Triptofano. Ele é o aminoácido precursor da serotonina, diretamente responsável pela sensação de bem-estar e pela qualidade do sono. Você o encontra em alimentos como banana, aveia, ovos, oleaginosas e frango.",
            "Segundo: Ômega três. Possui potente ação anti-inflamatória cerebral e neuronal, fortalecendo a saúde cognitiva. As melhores fontes são peixes gordos, sementes de linhaça e chia.",
            "Terceiro: Magnésio e vitaminas do Complexo B. Ajudam a combater a fadiga mental e a reduzir os picos de ansiedade. Estão presentes em abundância em folhas verde-escuras e castanhas.",
            "Quarto: Hidratação constante. Manter o corpo hidratado evita quedas bruscas de energia física e a sensação de névoa mental. Beba água regularmente, água de coco e chás calmantes naturais.",
            "Lembrete de apoio e acolhimento:",
            "Se você ou alguém que você conhece está enfrentando momentos difíceis, busque ajuda profissional. Ou ligue gratuitamente para o Cê Vê Vê, Centro de Valorização da Vida, pelo número um, oito, oito, com atendimento acolhedor vinte e quatro horas por dia. Lembre-se: pedir apoio é um ato de coragem."
        ]
    }
]

async def synth_text(text, voice, retries=4):
    for attempt in range(retries):
        try:
            data = b""
            async for ch in edge_tts.Communicate(text, voice, rate=RATE).stream():
                if ch["type"] == "audio":
                    data += ch["data"]
            if data:
                return data
        except Exception as e:
            await asyncio.sleep(2 * (attempt + 1))
    raise RuntimeError(f"Erro ao sintetizar: {text[:60]}")

def silence_frame(sample):
    idx = sample.find(b"\xff\xf3")
    if idx < 0:
        idx = sample.find(b"\xff\xfb")
    hdr = sample[idx:idx + 4]
    return hdr + b"\x00" * (144 - 4)

async def build_audio():
    os.makedirs(OUT_AUDIO, exist_ok=True)
    sem = asyncio.Semaphore(3)
    durations = {}

    for gender, voice in VOICES.items():
        g_dir = os.path.join(OUT_AUDIO, gender)
        os.makedirs(g_dir, exist_ok=True)
        full_audio = b""
        silence = None

        print(f"Iniciando síntese: {gender} ({voice})...")
        for ci, chap in enumerate(CHAPTERS_DATA):
            paras = chap["speech_paragraphs"]
            
            async def get_part(p):
                async with sem:
                    return await synth_text(p, voice)

            parts = await asyncio.gather(*[get_part(p) for p in paras])
            if silence is None:
                silence = silence_frame(parts[0])

            pause_title = silence * 36  # ~0.8s
            pause_para = silence * 24   # ~0.55s

            data = parts[0] + pause_title
            for p in parts[1:]:
                data += p + pause_para

            mp3_path = os.path.join(g_dir, f"cap-{ci:02d}.mp3")
            with open(mp3_path, "wb") as f:
                f.write(data)

            dur_sec = len(data) * 8 / 48000
            durations[(gender, ci)] = dur_sec
            full_audio += data + silence * 50
            print(f"  [{gender}] Cap {ci} gerado: {round(dur_sec)} segundos")

        full_path = os.path.join(g_dir, "audiobook-completo.mp3")
        with open(full_path, "wb") as f:
            f.write(full_audio)
        print(f"[{gender}] Audiobook completo gerado com sucesso!")

    return durations

def export_js(durations):
    chapters = []
    for ci, chap in enumerate(CHAPTERS_DATA):
        dur_f = durations.get(("feminina", ci), 60)
        mins = max(1, round(dur_f / 60))
        chapters.append({
            "id": f"cuidado-cap-{ci}",
            "title": chap["title"],
            "duration": f"{mins} min",
            "content": chap["display_content"],
            "audio": {
                "feminina": f"/audio/cuidado-integral/feminina/cap-{ci:02d}.mp3",
                "masculina": f"/audio/cuidado-integral/masculina/cap-{ci:02d}.mp3"
            }
        })

    total_mins = sum(int(c["duration"].split()[0]) for c in chapters)

    book = {
        "id": "guia-cuidado-integral",
        "title": "Guia de Cuidado Integral",
        "subtitle": "Orientações práticas para o equilíbrio da mente, do corpo e da alimentação",
        "category": "ansiedade",
        "duration": f"{total_mins} min",
        "ambientSound": "rain",
        "author": "Equipe Multidisciplinar SerenaMente",
        "coverGradient": "from-teal-600 via-sky-600 to-indigo-700",
        "tags": ["Corpo & Mente", "Nutrição", "Ansiedade", "Sono Reparador"],
        "pdfUrl": "/Guia_de_Cuidado_Integral.pdf",
        "audioFull": {
            "feminina": "/audio/cuidado-integral/feminina/audiobook-completo.mp3",
            "masculina": "/audio/cuidado-integral/masculina/audiobook-completo.mp3"
        },
        "description": "Um guia prático e integrativo baseado em evidências para equilibrar a mente, a atividade física, o sono e a alimentação no combate à ansiedade e depressão.",
        "chapters": chapters
    }

    js_code = "// Playbook 'Guia de Cuidado Integral' gerado automaticamente\nexport const CUIDADO_INTEGRAL_PLAYBOOK = " + json.dumps(book, ensure_ascii=False, indent=2) + ";\n"
    out_file = os.path.join(ROOT, "src", "data", "cuidadoIntegralBook.js")
    with open(out_file, "w", encoding="utf-8") as f:
        f.write(js_code)
    print(f"Exportado para {out_file} com duração total de {total_mins} min.")

def main():
    durations = asyncio.run(build_audio())
    export_js(durations)
    print("Processo finalizado com sucesso!")

if __name__ == "__main__":
    main()
