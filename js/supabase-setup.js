// Script de Configuración Inicial para Supabase
class SupabaseSetup {
    constructor() {
        this.setupComplete = false;
        this.init();
    }

    init() {
        this.addSetupUI();
        this.checkCurrentConfig();
    }

    addSetupUI() {
        // Solo agregar UI si no existe
        if (document.getElementById('supabase-setup-modal')) return;

        const modalHTML = `
            <div id="supabase-setup-modal" class="setup-modal" style="display: none;">
                <div class="setup-modal-content">
                    <div class="setup-header">
                        <h2><i class="fas fa-database"></i> Configuración de Supabase</h2>
                        <button class="setup-close" onclick="supabaseSetup.closeModal()">&times;</button>
                    </div>
                    
                    <div class="setup-body">
                        <div class="setup-step">
                            <h3>Paso 1: Credenciales de Supabase</h3>
                            <div class="setup-form">
                                <div class="form-group">
                                    <label for="supabase-url">URL del Proyecto:</label>
                                    <input type="text" id="supabase-url" placeholder="https://tu-proyecto.supabase.co">
                                    <small>Encuentra esto en Settings > API de tu proyecto Supabase</small>
                                </div>
                                
                                <div class="form-group">
                                    <label for="supabase-key">Clave Anónima:</label>
                                    <input type="password" id="supabase-key" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...">
                                    <small>Tu clave pública anónima (anon key)</small>
                                </div>
                                
                                <button onclick="supabaseSetup.testConnection()" class="btn-primary">
                                    <i class="fas fa-plug"></i> Probar Conexión
                                </button>
                            </div>
                        </div>

                        <div id="setup-step-2" class="setup-step" style="display: none;">
                            <h3>Paso 2: Crear Tablas</h3>
                            <p>Ejecuta este SQL en tu panel de Supabase:</p>
                            <div class="sql-code">
                                <pre id="sql-tables"></pre>
                                <button onclick="supabaseSetup.copySql()" class="btn-copy">
                                    <i class="fas fa-copy"></i> Copiar SQL
                                </button>
                            </div>
                        </div>

                        <div id="setup-step-3" class="setup-step" style="display: none;">
                            <h3>Paso 3: Migrar Datos</h3>
                            <p>Migra tus productos existentes a Supabase:</p>
                            <button onclick="supabaseSetup.migrateData()" class="btn-secondary">
                                <i class="fas fa-upload"></i> Migrar Productos
                            </button>
                        </div>

                        <div id="setup-status" class="setup-status"></div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.addSetupStyles();
    }

    addSetupStyles() {
        if (document.getElementById('setup-styles')) return;

        const styles = `
            <style id="setup-styles">
                .setup-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0,0,0,0.7);
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .setup-modal-content {
                    background: white;
                    padding: 30px;
                    border-radius: 15px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.3);
                }
                
                .setup-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #f0f0f0;
                }
                
                .setup-header h2 {
                    margin: 0;
                    color: #2c3e50;
                }
                
                .setup-close {
                    background: none;
                    border: none;
                    font-size: 24px;
                    cursor: pointer;
                    color: #95a5a6;
                }
                
                .setup-step {
                    margin-bottom: 30px;
                }
                
                .setup-step h3 {
                    color: #34495e;
                    margin-bottom: 15px;
                }
                
                .form-group {
                    margin-bottom: 20px;
                }
                
                .form-group label {
                    display: block;
                    margin-bottom: 5px;
                    font-weight: 500;
                    color: #2c3e50;
                }
                
                .form-group input {
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #e0e0e0;
                    border-radius: 8px;
                    font-size: 14px;
                    transition: border-color 0.3s;
                }
                
                .form-group input:focus {
                    outline: none;
                    border-color: #3498db;
                }
                
                .form-group small {
                    display: block;
                    margin-top: 5px;
                    color: #7f8c8d;
                    font-size: 12px;
                }
                
                .sql-code {
                    position: relative;
                    background: #f8f9fa;
                    border: 1px solid #e9ecef;
                    border-radius: 8px;
                    margin: 15px 0;
                }
                
                .sql-code pre {
                    padding: 20px;
                    margin: 0;
                    overflow-x: auto;
                    font-size: 12px;
                    line-height: 1.5;
                }
                
                .btn-copy {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 12px;
                }
                
                .setup-status {
                    margin-top: 20px;
                    padding: 15px;
                    border-radius: 8px;
                    font-weight: 500;
                }
                
                .setup-status.success {
                    background: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }
                
                .setup-status.error {
                    background: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
                
                .setup-status.info {
                    background: #d1ecf1;
                    color: #0c5460;
                    border: 1px solid #bee5eb;
                }
                
                .btn-primary, .btn-secondary {
                    padding: 12px 24px;
                    border: none;
                    border-radius: 8px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s;
                    margin-right: 10px;
                }
                
                .btn-primary {
                    background: #3498db;
                    color: white;
                }
                
                .btn-primary:hover {
                    background: #2980b9;
                }
                
                .btn-secondary {
                    background: #95a5a6;
                    color: white;
                }
                
                .btn-secondary:hover {
                    background: #7f8c8d;
                }
            </style>
        `;

        document.head.insertAdjacentHTML('beforeend', styles);
    }

    checkCurrentConfig() {
        // Verificar si Supabase ya está configurado
        if (typeof SUPABASE_URL !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_URL') {
            console.log('✅ Supabase parece estar configurado');
            this.setupComplete = true;
        } else {
            console.log('⚠️ Supabase necesita configuración');
            this.showSetupModal();
        }
    }

    showSetupModal() {
        const modal = document.getElementById('supabase-setup-modal');
        if (modal) {
            modal.style.display = 'flex';
            this.loadSqlTemplate();
        }
    }

    closeModal() {
        const modal = document.getElementById('supabase-setup-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    loadSqlTemplate() {
        const sqlCode = `-- Crear tablas para la perfumería
CREATE TABLE marcas (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE categorias (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    descripcion_corta VARCHAR(500),
    marca_id BIGINT REFERENCES marcas(id),
    categoria_id BIGINT REFERENCES categorias(id),
    precio DECIMAL(10,2) NOT NULL,
    imagen_principal VARCHAR(500),
    notas_salida TEXT[],
    notas_corazon TEXT[],
    notas_fondo TEXT[],
    stock INTEGER DEFAULT 0,
    disponible BOOLEAN DEFAULT true,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_marca ON productos(marca_id);
CREATE INDEX idx_productos_precio ON productos(precio);

-- Categorías iniciales
INSERT INTO categorias (nombre, slug, descripcion) VALUES
('Para Ellos', 'para-ellos', 'Fragancias masculinas'),
('Para Ellas', 'para-ellas', 'Fragancias femeninas'),
('Unisex', 'unisex', 'Fragancias para todos'),
('Clásicas', 'clasicas', 'Fragancias atemporales'),
('Exclusivas', 'exclusivas', 'Fragancias de lujo'),
('Vintage', 'vintage', 'Fragancias retro');`;

        const sqlElement = document.getElementById('sql-tables');
        if (sqlElement) {
            sqlElement.textContent = sqlCode;
        }
    }

    async testConnection() {
        const urlInput = document.getElementById('supabase-url');
        const keyInput = document.getElementById('supabase-key');
        const statusEl = document.getElementById('setup-status');

        const url = urlInput.value.trim();
        const key = keyInput.value.trim();

        if (!url || !key) {
            this.showStatus('Por favor completa ambos campos', 'error');
            return;
        }

        this.showStatus('Probando conexión...', 'info');

        try {
            // Crear cliente temporal para prueba
            const tempClient = supabase.createClient(url, key);
            
            // Probar conexión simple
            const { data, error } = await tempClient
                .from('productos')
                .select('count')
                .limit(1);

            if (error && !error.message.includes('relation "productos" does not exist')) {
                throw error;
            }

            this.showStatus('✅ Conexión exitosa! Continúa con el siguiente paso.', 'success');
            
            // Mostrar siguiente paso
            document.getElementById('setup-step-2').style.display = 'block';
            
            // Guardar configuración temporalmente
            window.tempSupabaseConfig = { url, key };

        } catch (error) {
            this.showStatus(`❌ Error de conexión: ${error.message}`, 'error');
        }
    }

    copySql() {
        const sqlElement = document.getElementById('sql-tables');
        const sql = sqlElement.textContent;

        navigator.clipboard.writeText(sql).then(() => {
            this.showStatus('✅ SQL copiado al portapapeles. Pégalo en tu panel de Supabase.', 'success');
            
            // Mostrar siguiente paso
            setTimeout(() => {
                document.getElementById('setup-step-3').style.display = 'block';
            }, 2000);
        }).catch(() => {
            this.showStatus('❌ Error al copiar. Selecciona y copia manualmente.', 'error');
        });
    }

    async migrateData() {
        if (!window.tempSupabaseConfig) {
            this.showStatus('❌ Primero debes probar la conexión', 'error');
            return;
        }

        const { url, key } = window.tempSupabaseConfig;
        
        this.showStatus('🔄 Migrando datos...', 'info');

        try {
            // Actualizar configuración global temporalmente
            window.SUPABASE_URL = url;
            window.SUPABASE_ANON_KEY = key;
            
            // Reinicializar cliente
            if (typeof initSupabase === 'function') {
                initSupabase();
            }

            // Ejecutar migración si está disponible
            if (typeof ejecutarMigracion === 'function') {
                await ejecutarMigracion();
                this.showStatus('✅ Migración completada! Recarga la página para usar Supabase.', 'success');
                
                // Sugerir actualizar configuración
                setTimeout(() => {
                    const updateConfig = confirm(
                        'Migración exitosa! ¿Quieres actualizar automáticamente el archivo de configuración? ' +
                        '\n\nNota: Esto reemplazará js/supabase-config.js con tus credenciales.'
                    );
                    
                    if (updateConfig) {
                        this.generateConfigFile(url, key);
                    }
                }, 3000);
                
            } else {
                this.showStatus('⚠️ Script de migración no disponible. Migra manualmente.', 'error');
            }

        } catch (error) {
            this.showStatus(`❌ Error en migración: ${error.message}`, 'error');
        }
    }

    generateConfigFile(url, key) {
        const configContent = `// Configuración de Supabase - Generado automáticamente
const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${key}';

// Inicializar cliente de Supabase
let supabaseClient = null;

// Función para inicializar Supabase
function initSupabase() {
    if (typeof supabase !== 'undefined' && SUPABASE_URL !== 'TU_SUPABASE_URL') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        return true;
    }
    return false;
}

// ... resto del archivo de configuración se mantiene igual`;

        // Crear blob y descargar
        const blob = new Blob([configContent], { type: 'text/javascript' });
        const downloadUrl = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = 'supabase-config.js';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(downloadUrl);

        this.showStatus('📁 Archivo descargado! Reemplaza js/supabase-config.js con el archivo descargado.', 'success');
    }

    showStatus(message, type) {
        const statusEl = document.getElementById('setup-status');
        if (statusEl) {
            statusEl.textContent = message;
            statusEl.className = `setup-status ${type}`;
        }
    }
}

// Inicializar automáticamente cuando se carga
document.addEventListener('DOMContentLoaded', function() {
    // Solo mostrar setup si no estamos en modo desarrollo
    if (!localStorage.getItem('supabase-setup-skip')) {
        window.supabaseSetup = new SupabaseSetup();
    }
});

// Función para mostrar setup manualmente
function showSupabaseSetup() {
    if (!window.supabaseSetup) {
        window.supabaseSetup = new SupabaseSetup();
    }
    window.supabaseSetup.showSetupModal();
}
