# -*- coding: utf-8 -*-
"""Gera narração revisada, dados do app e audiobook (voz feminina e masculina) em pt-BR."""
import asyncio, json, os, re, sys
import edge_tts
sys.path.insert(0, os.path.dirname(__file__))
from book_source import CHAPTERS

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_AUDIO = os.path.join(ROOT, "public", "audio", "ha-luz")
VOICES = {"feminina": "pt-BR-FranciscaNeural", "masculina": "pt-BR-AntonioNeural"}
RATE = "-6%"

# ---------- regras de pronúncia / símbolos ----------
RULES = [
    (r"5-4-3-2-1", "cinco, quatro, três, dois, um"),
    (r"4-7-8", "quatro, sete, oito"),
    (r"mapasaudemental\.com\.br", "mapa saúde mental ponto com ponto bê érre"),
    (r"cvv\.org\.br", "cê vê vê ponto org ponto bê érre"),
    (r"\b188\b", "um, oito, oito"),
    (r"\b192\b", "um, nove, dois"),
    (r"100%", "cem por cento"),
    (r"\b16h\b", "dezesseis horas"),
    (r"\b1 coisa\b", "uma coisa"),
    (r"\b1 pela qual\b", "uma pela qual"),
    (r"\bCVV\b", "Cê Vê Vê"),
    (r"\bSAMU\b", "Samu"),
    (r"\bUPA\b", "Upa"),
    (r"\bCAPS\b", "Caps"),
    (r"\bUBS\b", "U Bê Esse"),
    (r"\bSUS\b", "Sus"),
    (r"\bTCC\b", "Tê Cê Cê"),
    (r"\bTAG\b", "Tag"),
    (r"\bTOC\b", "Toc"),
    (r"\bONGs\b", "ONGs"),
    (r"\bTV\b", "tevê"),
    (r"\bonline\b", "on-line"),
    (r"\bTrês\b", "Três"),
]
ORD = {1: "Primeiro", 2: "Segundo", 3: "Terceiro", 4: "Quarto"}
UN = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze",
      "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"]
DZ = {2: "vinte", 3: "trinta", 4: "quarenta", 5: "cinquenta", 6: "sessenta", 7: "setenta", 8: "oitenta", 9: "noventa"}


def num_pt(n):
    if n < 20:
        return UN[n]
    d, u = divmod(n, 10)
    return DZ[d] + (" e " + UN[u] if u else "")


def numbers_to_words(t):
    t = t.replace("2 a 6 semanas", "duas a seis semanas")
    t = re.sub(r"\b1 (coisa|pela)\b", r"uma \1", t)
    return re.sub(r"\b(\d{1,2})\b", lambda m: num_pt(int(m.group(1))), t)


def apply_rules(t):
    for pat, rep in RULES:
        t = re.sub(pat, rep, t)
    t = numbers_to_words(t)
    t = re.sub(r"(quatro, sete, oito|cinco, quatro, três, dois, um)(?= \w)", r"\1,", t)
    t = t.replace('"', "").replace("“", "").replace("”", "")
    t = t.replace("–", ", ").replace("—", ", ").replace("→", " vira ")
    t = t.replace("|", ", ").replace("&", " e ").replace("%", " por cento")
    t = re.sub(r"\s+", " ", t).strip()
    return t[:1].upper() + t[1:]


def end_punct(s):
    s = s.strip()
    if not s:
        return s
    return s if s[-1] in ".!?:;" else s + "."


def parse(body):
    """Retorna lista de blocos (tipo, texto)."""
    blocks = []
    for raw in body.strip().split("\n"):
        line = raw.strip()
        if not line:
            blocks.append(("br", ""))
        elif line.startswith("## "):
            blocks.append(("h", line[3:]))
        elif line.startswith("- "):
            blocks.append(("li", line[2:]))
        elif line.startswith("> "):
            blocks.append(("q", line[2:]))
        elif re.match(r"^\d\) ", line):
            blocks.append(("n", line))
        elif "|" in line and line.startswith('"'):
            blocks.append(("t", line))
        else:
            blocks.append(("p", line))
    return [b for b in blocks if b[0] != "br"]


def display_text(title, body):
    out = []
    for kind, tx in parse(body):
        if kind == "h":
            out.append("\n" + tx)
        elif kind == "li":
            out.append("• " + tx)
        elif kind == "q":
            out.append("“" + tx + "”")
        elif kind == "t":
            m, v = tx.split("|")
            out.append(f"Mito: {m}\nVerdade: {v}")
        else:
            out.append(tx)
    return "\n".join(out).strip()


def speech_paragraphs(title, body):
    """Lista de parágrafos prontos para a voz; cada item = um trecho com pausa depois."""
    paras = []
    t = title
    m = re.match(r"^(\d+)\. (.+)$", t)
    paras.append(end_punct(apply_rules(f"Capítulo {m.group(1)}. {m.group(2)}" if m else t)))
    buf = []
    def flush():
        if buf:
            paras.append(" ".join(buf)); buf.clear()
    for kind, tx in parse(body):
        tx_s = tx
        if kind == "h":
            flush()
            tx_s = re.sub(r"^\d+\.\d+ ", "", tx)
            paras.append(end_punct(apply_rules(tx_s)))
        elif kind == "li":
            buf.append(end_punct(apply_rules(tx_s)))
        elif kind == "q":
            flush(); paras.append(end_punct(apply_rules(tx_s)))
        elif kind == "t":
            flush()
            mit, ver = tx_s.split("|")
            paras.append(end_punct(apply_rules("Mito: " + mit)) + " " + end_punct(apply_rules("Verdade: " + ver)))
        elif kind == "n":
            n = int(tx_s[0])
            buf.append(end_punct(apply_rules(f"{ORD[n]}, " + tx_s[3:][0].lower() + tx_s[3:][1:])))
        else:
            flush(); paras.append(end_punct(apply_rules(tx_s)))
    flush()
    return paras


async def synth(text, voice, retries=4):
    for a in range(retries):
        try:
            data = b""
            async for ch in edge_tts.Communicate(text, voice, rate=RATE).stream():
                if ch["type"] == "audio":
                    data += ch["data"]
            if data:
                return data
        except Exception as e:
            await asyncio.sleep(2 * (a + 1))
    raise RuntimeError("falha ao sintetizar: " + text[:60])


def silence_frame(sample):
    i = sample.find(b"\xff\xf3")
    if i < 0:
        i = sample.find(b"\xff\xfb")
    hdr = sample[i:i + 4]
    return hdr + b"\x00" * (144 - 4)  # 24 kHz / 48 kbps mono, MPEG-2 L3 -> 144 bytes


async def build_audio(chapters_speech):
    os.makedirs(OUT_AUDIO, exist_ok=True)
    sem = asyncio.Semaphore(4)
    durations = {}
    for gender, voice in VOICES.items():
        d = os.path.join(OUT_AUDIO, gender); os.makedirs(d, exist_ok=True)
        full = b""
        silence = None
        for ci, paras in enumerate(chapters_speech):
            async def one(p):
                async with sem:
                    return await synth(p, voice)
            parts = await asyncio.gather(*[one(p) for p in paras])
            if silence is None:
                silence = silence_frame(parts[0])
            pause_s = silence * 22      # ~0,5 s entre parágrafos
            pause_h = silence * 40      # ~1 s após título
            data = parts[0] + pause_h
            for p in parts[1:]:
                data += p + pause_s
            fn = os.path.join(d, f"cap-{ci:02d}.mp3")
            open(fn, "wb").write(data)
            durations[(gender, ci)] = len(data) * 8 / 48000
            full += data + silence * 60
            print(gender, ci, round(durations[(gender, ci)]), "s", flush=True)
        open(os.path.join(d, "audiobook-completo.mp3"), "wb").write(full)
    return durations


def main():
    skip_audio = "--no-audio" in sys.argv
    chapters_speech = [speech_paragraphs(t, b) for t, b in CHAPTERS]
    with open(os.path.join(os.path.dirname(__file__), "narracao_revisao.txt"), "w", encoding="utf-8") as f:
        for (t, _), paras in zip(CHAPTERS, chapters_speech):
            f.write("=== " + t + " ===\n" + "\n\n".join(paras) + "\n\n")
    durs = {} if skip_audio else asyncio.run(build_audio(chapters_speech))
    chapters = []
    for i, (t, b) in enumerate(CHAPTERS):
        words = len(" ".join(chapters_speech[i]).split())
        mins = max(1, round((durs.get(("feminina", i)) or words / 2.4) / 60))
        ch = {"id": f"cap-{i}", "title": t, "duration": f"{mins} min", "content": display_text(t, b)}
        ch["audio"] = {g: f"/audio/ha-luz/{g}/cap-{i:02d}.mp3" for g in VOICES}
        chapters.append(ch)
    total = sum(int(c["duration"].split()[0]) for c in chapters)
    book = {
        "id": "ha-luz-no-fim-do-tunel", "title": "Há Luz no Fim do Túnel",
        "subtitle": "Um guia de esperança e cuidado para quem enfrenta a depressão e a ansiedade",
        "category": "depressao", "duration": f"{total} min", "ambientSound": "waves",
        "author": "Equipe SerenaMente", "coverGradient": "from-indigo-600 via-sky-500 to-amber-400",
        "tags": ["Esperança", "Depressão", "Ansiedade", "Plano de 7 dias"],
        "pdfUrl": "/Ha_Luz_no_Fim_do_Tunel.pdf",
        "audioFull": {g: f"/audio/ha-luz/{g}/audiobook-completo.mp3" for g in VOICES},
        "description": "Um guia de esperança e cuidado para quem enfrenta a depressão e a ansiedade.",
        "chapters": chapters,
    }
    js = "// Playbook 'Há Luz no Fim do Túnel' (gerado por audiobook/build_audiobook.py)\nexport const HA_LUZ_PLAYBOOK = " + json.dumps(book, ensure_ascii=False, indent=2) + ";\n"
    open(os.path.join(ROOT, "src", "data", "haLuzBook.js"), "w", encoding="utf-8").write(js)
    print("ok", total, "min")


if __name__ == "__main__":
    main()
