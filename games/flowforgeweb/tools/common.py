"""Infraestrutura comum dos testes: servidor HTTP local + caminhos.

Importar este módulo inicia (uma vez) um servidor estático servindo a raiz do projeto
em uma porta livre e define a variável de ambiente PORT.
"""
import functools, http.server, os, socketserver, threading
from pathlib import Path

TOOLS = Path(__file__).resolve().parent
ROOT = str(TOOLS.parent)                      # raiz do projeto (onde está o index.html)
OUT = str(TOOLS / "_out")                     # saídas geradas (HTML exportados, capturas de tela)
os.makedirs(OUT, exist_ok=True)

class _Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def _start():
    if os.environ.get("FF_TEST_PORT_STARTED"):
        return int(os.environ["PORT"])
    handler = functools.partial(_Quiet, directory=ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    port = srv.server_address[1]
    os.environ["PORT"] = str(port)
    return port

PORT = _start()
URL = f"http://localhost:{PORT}"
