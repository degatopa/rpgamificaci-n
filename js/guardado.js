// Guardar y cargar la partida en el navegador (localStorage),
// y hacer o recuperar copias de seguridad en un archivo .json.
const Guardado = {
  CLAVE: 'rpgamificacion-partida',

  // Devuelve la partida guardada, o null si no hay ninguna
  cargar() {
    let texto = null;
    try {
      texto = localStorage.getItem(this.CLAVE);
      if (!texto) return null;
      const estado = JSON.parse(texto);
      if (Motor.pareceEstadoValido(estado)) return estado;
    } catch (e) {
      // sigue abajo
    }
    // Hay algo guardado pero está dañado: se aparta para no perderlo
    if (texto) {
      try { localStorage.setItem(`${this.CLAVE}-danada-${Date.now()}`, texto); } catch (e) { /* sin espacio */ }
    }
    return null;
  },

  guardar(estado) {
    try {
      localStorage.setItem(this.CLAVE, JSON.stringify(estado));
      return true;
    } catch (e) {
      return false;
    }
  },

  borrar() {
    try { localStorage.removeItem(this.CLAVE); } catch (e) { /* nada */ }
  },

  // Descarga un archivo con toda la partida
  exportar(estado) {
    const blob = new Blob([JSON.stringify(estado, null, 2)], { type: 'application/json' });
    const enlace = document.createElement('a');
    enlace.href = URL.createObjectURL(blob);
    enlace.download = `rpgamificacion-copia-${estado.ultimoDia}.json`;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => URL.revokeObjectURL(enlace.href), 1000);
  },

  // Lee un archivo de copia y devuelve la partida (o null si no es válido)
  leerArchivo(archivo) {
    return new Promise(resolver => {
      const lector = new FileReader();
      lector.onload = () => {
        try {
          const estado = JSON.parse(lector.result);
          resolver(Motor.pareceEstadoValido(estado) ? estado : null);
        } catch (e) {
          resolver(null);
        }
      };
      lector.onerror = () => resolver(null);
      lector.readAsText(archivo);
    });
  },
};
