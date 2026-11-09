"""Roda tudo: suítes HTML, exemplos, câmera, permissões, depurador e empacotamento Android.   Uso: python tools/run_all.py"""
import subprocess, sys
from pathlib import Path
here = Path(__file__).resolve().parent
steps = [("Suítes HTML", ["run_suites.py"]), ("Exportar exemplos", ["export_examples.py"]), ("Menu de exemplos", ["test_menu_exemplos.py"]), ("Componente Som do jogo", ["test_som.py"]), ("Componente Gráfico", ["test_grafico.py"]),
         ("Cenários dos exemplos", ["test_exemplos.py"]), ("Câmera (Estúdio de Câmera)", ["test_camera.py"]),
         ("Permissão de câmera", ["test_permissoes.py"]), ("Depurador", ["test_depurador.py"]), ("Empacotar para Android", ["test_android.py"])]
fail = []
for title, cmd in steps:
    print(f"\n=== {title} ==="); sys.stdout.flush()
    r = subprocess.run([sys.executable, str(here / cmd[0])] + cmd[1:], cwd=here.parent)
    if r.returncode: fail.append(title)
print("\n" + ("TUDO OK" if not fail else "FALHAS: " + ", ".join(fail)))
sys.exit(1 if fail else 0)
