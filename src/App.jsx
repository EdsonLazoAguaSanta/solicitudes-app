import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// ====================================================================
// CONFIGURACIÓN SUPABASE
// ====================================================================

const SUPABASE_URL = 'https://muqcnzsrmtkcowqyjvpk.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Xflk5u6dGEWU47n9V6-s-Q_66yvsRKr';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ====================================================================
// UTILIDADES
// ====================================================================

const getQueryParam = (param) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
};

const generateLink = (type, respondente) => {
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?form=${type}&respondente=${encodeURIComponent(respondente)}`;
};

const calculateCompletion = (data) => {
  const fields = Object.values(data).filter(v => v !== null && v !== undefined && v !== '');
  const total = Object.keys(data).length;
  return total > 0 ? Math.round((fields.length / total) * 100) : 0;
};

// ====================================================================
// COMPONENTE: Formulario IT (Erick Troncoso)
// ====================================================================

function FormularioIT() {
  const [data, setData] = useState({
    host: '',
    puerto: '',
    usuario_sql: '',
    contrasena: '',
    base_datos: '',
    tabla_estimacion: '',
    tabla_trisemanal: '',
    tabla_recepcion: '',
    restricciones_firewall: '',
    usuario_rol: '',
    contacto_validacion: '',
  });

  const [schemas, setSchemas] = useState({
    estimacion: [{ columna: '', tipo: '', clave_primaria: false, notas: '' }],
    trisemanal: [{ columna: '', tipo: '', clave_primaria: false, notas: '' }],
  });

  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: respuesta, error } = await supabase
        .from('solicitud_it')
        .select('*')
        .eq('respondente', 'Erick Troncoso')
        .single();

      if (error) throw error;

      if (respuesta) {
        setData({
          host: respuesta.host || '',
          puerto: respuesta.puerto || '',
          usuario_sql: respuesta.usuario_sql || '',
          contrasena: respuesta.contrasena || '',
          base_datos: respuesta.base_datos || '',
          tabla_estimacion: respuesta.tabla_estimacion || '',
          tabla_trisemanal: respuesta.tabla_trisemanal || '',
          tabla_recepcion: respuesta.tabla_recepcion || '',
          restricciones_firewall: respuesta.restricciones_firewall || '',
          usuario_rol: respuesta.usuario_rol || '',
          contacto_validacion: respuesta.contacto_validacion || '',
        });

        if (respuesta.schema_estimacion) {
          setSchemas(prev => ({ ...prev, estimacion: respuesta.schema_estimacion }));
        }
        if (respuesta.schema_trisemanal) {
          setSchemas(prev => ({ ...prev, trisemanal: respuesta.schema_trisemanal }));
        }
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarDatos = async () => {
    try {
      const completitud = calculateCompletion(data);
      const { error } = await supabase
        .from('solicitud_it')
        .update({
          ...data,
          schema_estimacion: schemas.estimacion,
          schema_trisemanal: schemas.trisemanal,
          completitud,
          estado: completitud === 100 ? 'completada' : 'en_progreso',
        })
        .eq('respondente', 'Erick Troncoso');

      if (error) throw error;

      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newData = { ...data, [name]: value };
    setData(newData);

    // Auto-save
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      guardarDatos();
    }, 1000);
  };

  const agregarFilaSchema = (tipo) => {
    setSchemas(prev => ({
      ...prev,
      [tipo]: [...prev[tipo], { columna: '', tipo: '', clave_primaria: false, notas: '' }],
    }));
  };

  const updateSchema = (tipo, index, field, value) => {
    const newSchema = [...schemas[tipo]];
    newSchema[index][field] = value;
    setSchemas(prev => ({ ...prev, [tipo]: newSchema }));
    guardarDatos();
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <h1>📋 Solicitud Técnica - IT</h1>
        <p>Para: <strong>Erick Troncoso</strong></p>
        {guardado && <div className="guardado-badge">✅ Guardado</div>}
      </div>

      <section className="section">
        <h2>1. Credenciales SQL Server</h2>
        
        <div className="grid-2">
          <div className="field">
            <label>Host / IP:</label>
            <input
              type="text"
              name="host"
              value={data.host}
              onChange={handleChange}
              placeholder="ej: 192.168.1.100"
            />
          </div>

          <div className="field">
            <label>Puerto:</label>
            <input
              type="text"
              name="puerto"
              value={data.puerto}
              onChange={handleChange}
              placeholder="ej: 1433"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Usuario:</label>
            <input
              type="text"
              name="usuario_sql"
              value={data.usuario_sql}
              onChange={handleChange}
              placeholder="ej: sa"
            />
          </div>

          <div className="field">
            <label>Contraseña:</label>
            <input
              type="password"
              name="contrasena"
              value={data.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>
        </div>

        <div className="field">
          <label>Base de Datos Softland:</label>
          <input
            type="text"
            name="base_datos"
            value={data.base_datos}
            onChange={handleChange}
            placeholder="ej: Softland_Produccion"
          />
        </div>
      </section>

      <section className="section">
        <h2>2. Schema - Tabla Estimación</h2>

        <div className="field">
          <label>Nombre tabla:</label>
          <input
            type="text"
            name="tabla_estimacion"
            value={data.tabla_estimacion}
            onChange={handleChange}
            placeholder="ej: Estimacion_Cosecha"
          />
        </div>

        <div className="schema-table">
          <div className="schema-header">
            <div>Columna</div>
            <div>Tipo Dato</div>
            <div>Clave Primaria</div>
            <div>Notas</div>
          </div>

          {schemas.estimacion.map((row, idx) => (
            <div key={idx} className="schema-row">
              <input
                type="text"
                value={row.columna}
                onChange={(e) => updateSchema('estimacion', idx, 'columna', e.target.value)}
                placeholder="Nombre columna"
              />
              <input
                type="text"
                value={row.tipo}
                onChange={(e) => updateSchema('estimacion', idx, 'tipo', e.target.value)}
                placeholder="INT, VARCHAR, DATE"
              />
              <input
                type="checkbox"
                checked={row.clave_primaria}
                onChange={(e) => updateSchema('estimacion', idx, 'clave_primaria', e.target.checked)}
              />
              <input
                type="text"
                value={row.notas}
                onChange={(e) => updateSchema('estimacion', idx, 'notas', e.target.value)}
                placeholder="Notas"
              />
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={() => agregarFilaSchema('estimacion')}>
          + Agregar fila
        </button>
      </section>

      <section className="section">
        <h2>3. Schema - Tabla Trisemanal</h2>

        <div className="field">
          <label>Nombre tabla:</label>
          <input
            type="text"
            name="tabla_trisemanal"
            value={data.tabla_trisemanal}
            onChange={handleChange}
            placeholder="ej: Trisemanal_Actual"
          />
        </div>

        <div className="schema-table">
          <div className="schema-header">
            <div>Columna</div>
            <div>Tipo Dato</div>
            <div>Clave Primaria</div>
            <div>Notas</div>
          </div>

          {schemas.trisemanal.map((row, idx) => (
            <div key={idx} className="schema-row">
              <input
                type="text"
                value={row.columna}
                onChange={(e) => updateSchema('trisemanal', idx, 'columna', e.target.value)}
                placeholder="Nombre columna"
              />
              <input
                type="text"
                value={row.tipo}
                onChange={(e) => updateSchema('trisemanal', idx, 'tipo', e.target.value)}
                placeholder="INT, VARCHAR, DATE"
              />
              <input
                type="checkbox"
                checked={row.clave_primaria}
                onChange={(e) => updateSchema('trisemanal', idx, 'clave_primaria', e.target.checked)}
              />
              <input
                type="text"
                value={row.notas}
                onChange={(e) => updateSchema('trisemanal', idx, 'notas', e.target.value)}
                placeholder="Notas"
              />
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={() => agregarFilaSchema('trisemanal')}>
          + Agregar fila
        </button>
      </section>

      <section className="section">
        <h2>4. Tabla Recepción Planta</h2>

        <div className="field">
          <label>Nombre tabla:</label>
          <input
            type="text"
            name="tabla_recepcion"
            value={data.tabla_recepcion}
            onChange={handleChange}
            placeholder="ej: Recepcion_Planta"
          />
        </div>

        <div className="field">
          <label>Notas sobre estructura:</label>
          <textarea
            name="restricciones_firewall"
            value={data.restricciones_firewall}
            onChange={handleChange}
            placeholder="Describe configuración especial, relaciones, índices..."
          />
        </div>
      </section>

      <section className="section">
        <h2>5. Información Adicional</h2>

        <div className="field">
          <label>Restricciones Firewall/VPN:</label>
          <textarea
            name="usuario_rol"
            value={data.usuario_rol}
            onChange={handleChange}
            placeholder="¿Necesita VPN? ¿Restricciones de IP?"
          />
        </div>

        <div className="field">
          <label>Usuario/Rol recomendado:</label>
          <textarea
            name="contacto_validacion"
            value={data.contacto_validacion}
            onChange={handleChange}
            placeholder="Ej: Usuario específico, credenciales de aplicación, etc"
          />
        </div>
      </section>

      <button className="btn-primary" onClick={guardarDatos}>
        💾 Guardar cambios
      </button>
    </div>
  );
}

// ====================================================================
// COMPONENTE: Formulario Gerencia (Jerónimo Silva)
// ====================================================================

function FormularioGerencia() {
  const [data, setData] = useState({
    ejemplos_preguntas: [],
    usuario_piloto_1: { nombre: '', cargo: '', whatsapp: '', criterio: '' },
    usuario_piloto_2: { nombre: '', cargo: '', whatsapp: '', criterio: '' },
    usuario_piloto_3: { nombre: '', cargo: '', whatsapp: '', criterio: '' },
    horarios_pico: '',
    restricciones_especiales: '',
  });

  const [loading, setLoading] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const autoSaveRef = useRef(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const { data: respuesta, error } = await supabase
        .from('solicitud_gerencia')
        .select('*')
        .eq('respondente', 'Jerónimo Silva')
        .single();

      if (error) throw error;

      if (respuesta) {
        setData({
          ejemplos_preguntas: respuesta.ejemplos_preguntas || [],
          usuario_piloto_1: respuesta.usuario_piloto_1 || { nombre: '', cargo: '', whatsapp: '', criterio: '' },
          usuario_piloto_2: respuesta.usuario_piloto_2 || { nombre: '', cargo: '', whatsapp: '', criterio: '' },
          usuario_piloto_3: respuesta.usuario_piloto_3 || { nombre: '', cargo: '', whatsapp: '', criterio: '' },
          horarios_pico: respuesta.horarios_pico || '',
          restricciones_especiales: respuesta.restricciones_especiales || '',
        });
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const guardarDatos = async () => {
    try {
      const completitud = Object.values(data).filter(
        v => (typeof v === 'string' && v.trim()) || (Array.isArray(v) && v.length > 0)
      ).length / Object.keys(data).length * 100;

      const { error } = await supabase
        .from('solicitud_gerencia')
        .update({
          ...data,
          completitud: Math.round(completitud),
          estado: completitud === 100 ? 'completada' : 'en_progreso',
        })
        .eq('respondente', 'Jerónimo Silva');

      if (error) throw error;

      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
  };

  const handleChange = (path, value) => {
    const newData = { ...data };
    const keys = path.split('.');
    let obj = newData;

    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }

    obj[keys[keys.length - 1]] = value;
    setData(newData);

    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      guardarDatos();
    }, 1000);
  };

  const agregarEjemplo = () => {
    setData(prev => ({
      ...prev,
      ejemplos_preguntas: [
        ...prev.ejemplos_preguntas,
        { rol: 'Responsable Operacional', pregunta: '', respuesta_esperada: '' },
      ],
    }));
  };

  const updateEjemplo = (idx, field, value) => {
    const nuevos = [...data.ejemplos_preguntas];
    nuevos[idx][field] = value;
    setData(prev => ({ ...prev, ejemplos_preguntas: nuevos }));
    guardarDatos();
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="formulario-container">
      <div className="formulario-header">
        <h1>📋 Solicitud Operacional - Gerencia</h1>
        <p>Para: <strong>Jerónimo Silva</strong></p>
        {guardado && <div className="guardado-badge">✅ Guardado</div>}
      </div>

      <section className="section">
        <h2>1. Ejemplos de Preguntas Reales (30-40)</h2>
        <p className="section-info">Necesitamos preguntas reales que harían al bot para entrenar el NLP correctamente.</p>

        <div id="ejemplos-list">
          {data.ejemplos_preguntas.map((ejemplo, idx) => (
            <div key={idx} className="ejemplo-row">
              <select
                value={ejemplo.rol}
                onChange={(e) => updateEjemplo(idx, 'rol', e.target.value)}
              >
                <option>Responsable Operacional</option>
                <option>Zonal</option>
                <option>Planta</option>
                <option>Director</option>
              </select>

              <input
                type="text"
                placeholder="¿Qué pregunta hace?"
                value={ejemplo.pregunta}
                onChange={(e) => updateEjemplo(idx, 'pregunta', e.target.value)}
              />

              <textarea
                placeholder="¿Qué busca saber?"
                value={ejemplo.respuesta_esperada}
                onChange={(e) => updateEjemplo(idx, 'respuesta_esperada', e.target.value)}
              />
            </div>
          ))}
        </div>

        <button className="btn-secondary" onClick={agregarEjemplo}>
          + Agregar otro ejemplo ({data.ejemplos_preguntas.length}/40)
        </button>
      </section>

      <section className="section">
        <h2>2. Usuarios Piloto para UAT</h2>

        {[1, 2, 3].map((num) => (
          <div key={num} className="usuario-piloto">
            <h3>Usuario Piloto #{num}</h3>

            <div className="grid-3">
              <input
                type="text"
                placeholder="Nombre Completo"
                value={data[`usuario_piloto_${num}`].nombre}
                onChange={(e) => handleChange(`usuario_piloto_${num}.nombre`, e.target.value)}
              />

              <input
                type="text"
                placeholder="Cargo/Rol"
                value={data[`usuario_piloto_${num}`].cargo}
                onChange={(e) => handleChange(`usuario_piloto_${num}.cargo`, e.target.value)}
              />

              <input
                type="tel"
                placeholder="+56912345678"
                value={data[`usuario_piloto_${num}`].whatsapp}
                onChange={(e) => handleChange(`usuario_piloto_${num}.whatsapp`, e.target.value)}
              />
            </div>

            <textarea
              placeholder="¿Por qué esta persona?"
              value={data[`usuario_piloto_${num}`].criterio}
              onChange={(e) => handleChange(`usuario_piloto_${num}.criterio`, e.target.value)}
            />
          </div>
        ))}
      </section>

      <section className="section">
        <h2>3. Información Adicional</h2>

        <div className="field">
          <label>Horarios pico de consultas:</label>
          <textarea
            value={data.horarios_pico}
            onChange={(e) => handleChange('horarios_pico', e.target.value)}
            placeholder="Ej: Antes de 9am, después de 5pm..."
          />
        </div>

        <div className="field">
          <label>Restricciones o consideraciones especiales:</label>
          <textarea
            value={data.restricciones_especiales}
            onChange={(e) => handleChange('restricciones_especiales', e.target.value)}
            placeholder="Ej: Algunos no hablan español técnico, preferencia por respuestas cortas..."
          />
        </div>
      </section>

      <button className="btn-primary" onClick={guardarDatos}>
        💾 Guardar cambios
      </button>
    </div>
  );
}

// ====================================================================
// COMPONENTE: Dashboard Admin
// ====================================================================

function Dashboard() {
  const [respuestas, setRespuestas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarRespuestas();

    // Suscribirse a cambios en tiempo real
    const subscription = supabase
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitud_it' }, cargarRespuestas)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'solicitud_gerencia' }, cargarRespuestas)
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const cargarRespuestas = async () => {
    try {
      const [{ data: it }, { data: gerencia }] = await Promise.all([
        supabase.from('solicitud_it').select('respondente, completitud, estado, fecha_actualizacion'),
        supabase.from('solicitud_gerencia').select('respondente, completitud, estado, fecha_actualizacion'),
      ]);

      const todas = [
        ...it.map(r => ({ ...r, tipo: 'IT' })),
        ...gerencia.map(r => ({ ...r, tipo: 'Gerencia' })),
      ];

      setRespuestas(todas);
    } catch (error) {
      console.error('Error cargando respuestas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>📊 Dashboard - Seguimiento de Respuestas</h1>
        <p>Actualización en tiempo real</p>
      </div>

      <div className="dashboard-grid">
        {respuestas.map((resp, idx) => (
          <div key={idx} className="dashboard-card">
            <div className="card-header">
              <h3>{resp.respondente}</h3>
              <span className="tipo-badge">{resp.tipo}</span>
            </div>

            <div className="completitud-bar">
              <div
                className="completitud-fill"
                style={{ width: `${resp.completitud || 0}%` }}
              />
              <span className="completitud-text">{resp.completitud || 0}%</span>
            </div>

            <div className="card-info">
              <p><strong>Estado:</strong> {resp.estado === 'completada' ? '✅ Completado' : '⏳ En progreso'}</p>
              <p><strong>Última actualización:</strong> {new Date(resp.fecha_actualizacion).toLocaleString('es-CL')}</p>
            </div>

            <div className="card-links">
              <a href={generateLink(resp.tipo === 'IT' ? 'IT' : 'Gerencia', resp.respondente)} target="_blank" rel="noreferrer" className="btn-small">
                Ver formulario
              </a>
              <button onClick={() => {
                navigator.clipboard.writeText(generateLink(resp.tipo === 'IT' ? 'IT' : 'Gerencia', resp.respondente));
                alert('Link copiado al portapapeles');
              }} className="btn-small btn-secondary">
                Copiar link
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-links">
        <h2>🔗 Links para compartir</h2>
        <div className="links-list">
          {respuestas.map((resp, idx) => (
            <div key={idx} className="link-item">
              <span><strong>{resp.respondente}</strong> ({resp.tipo})</span>
              <code onClick={() => {
                navigator.clipboard.writeText(generateLink(resp.tipo === 'IT' ? 'IT' : 'Gerencia', resp.respondente));
                alert('Copiado');
              }}>
                {generateLink(resp.tipo === 'IT' ? 'IT' : 'Gerencia', resp.respondente)}
              </code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====================================================================
// COMPONENTE PRINCIPAL: Router
// ====================================================================

export default function App() {
  const formType = getQueryParam('form');
  const respondente = getQueryParam('respondente');

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
        }

        .app {
          max-width: 1200px;
          margin: 0 auto;
        }

        /* ========== FORMULARIOS ========== */

        .formulario-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          overflow: hidden;
        }

        .formulario-header {
          background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
          color: white;
          padding: 30px;
          position: relative;
        }

        .formulario-header h1 {
          font-size: 1.8em;
          margin-bottom: 5px;
        }

        .formulario-header p {
          opacity: 0.9;
        }

        .guardado-badge {
          position: absolute;
          top: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9em;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .formulario-container .section {
          padding: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .section h2 {
          color: #1B5E20;
          font-size: 1.3em;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #2E7D32;
        }

        .section h3 {
          color: #2E7D32;
          font-size: 1.1em;
          margin: 20px 0 15px 0;
        }

        .section-info {
          color: #666;
          font-size: 0.95em;
          margin-bottom: 15px;
        }

        .field {
          margin-bottom: 20px;
        }

        .field label {
          display: block;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          font-size: 0.95em;
        }

        .field input,
        .field textarea,
        .field select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-family: inherit;
          font-size: 1em;
          transition: border-color 0.2s;
        }

        .field input:focus,
        .field textarea:focus,
        .field select:focus {
          outline: none;
          border-color: #2E7D32;
          box-shadow: 0 0 0 3px rgba(46, 125, 50, 0.1);
        }

        .field textarea {
          resize: vertical;
          min-height: 100px;
        }

        .grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
          margin-bottom: 15px;
        }

        @media (max-width: 768px) {
          .grid-2, .grid-3 {
            grid-template-columns: 1fr;
          }
        }

        /* ========== SCHEMA TABLE ========== */

        .schema-table {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
          margin: 15px 0;
        }

        .schema-header {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
          gap: 10px;
          background: #2E7D32;
          color: white;
          padding: 12px;
          font-weight: 600;
          font-size: 0.9em;
        }

        .schema-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
          gap: 10px;
          padding: 12px;
          border-bottom: 1px solid #eee;
          align-items: center;
        }

        .schema-row input[type="text"] {
          margin: 0;
          padding: 8px;
          font-size: 0.9em;
        }

        .schema-row input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        /* ========== EJEMPLOS Y USUARIOS ========== */

        .ejemplo-row {
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 15px;
          margin-bottom: 15px;
          display: grid;
          gap: 12px;
        }

        .ejemplo-row select,
        .ejemplo-row input,
        .ejemplo-row textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95em;
        }

        .usuario-piloto {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .usuario-piloto h3 {
          color: #2E7D32;
          margin-bottom: 15px;
          font-size: 1em;
        }

        .usuario-piloto textarea {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-top: 12px;
          min-height: 80px;
        }

        /* ========== BOTONES ========== */

        .btn-primary, .btn-secondary, .btn-small {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1em;
        }

        .btn-primary {
          background: #2E7D32;
          color: white;
          margin-top: 20px;
          width: 100%;
        }

        .btn-primary:hover {
          background: #1B5E20;
          box-shadow: 0 4px 12px rgba(27, 94, 32, 0.3);
        }

        .btn-secondary {
          background: #f0f0f0;
          color: #333;
          margin-top: 15px;
        }

        .btn-secondary:hover {
          background: #e0e0e0;
        }

        .btn-small {
          padding: 8px 16px;
          font-size: 0.9em;
          margin: 5px 5px 5px 0;
        }

        /* ========== DASHBOARD ========== */

        .dashboard-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.1);
          padding: 40px;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 2px solid #2E7D32;
        }

        .dashboard-header h1 {
          color: #1B5E20;
          font-size: 2em;
          margin-bottom: 5px;
        }

        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 40px;
        }

        .dashboard-card {
          background: #f9f9f9;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.3s;
        }

        .dashboard-card:hover {
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .card-header h3 {
          color: #1B5E20;
          font-size: 1.1em;
        }

        .tipo-badge {
          background: #2E7D32;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.85em;
          font-weight: 600;
        }

        .completitud-bar {
          background: #e0e0e0;
          border-radius: 10px;
          height: 30px;
          margin-bottom: 15px;
          overflow: hidden;
          position: relative;
        }

        .completitud-fill {
          background: linear-gradient(90deg, #2E7D32 0%, #4CAF50 100%);
          height: 100%;
          transition: width 0.3s;
        }

        .completitud-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #333;
          font-weight: 600;
          font-size: 0.9em;
        }

        .card-info {
          background: white;
          padding: 12px;
          border-radius: 6px;
          margin-bottom: 15px;
          font-size: 0.9em;
        }

        .card-info p {
          margin: 6px 0;
          color: #666;
        }

        .card-links {
          display: flex;
          gap: 10px;
        }

        .card-links .btn-small {
          flex: 1;
          text-align: center;
          margin: 0;
        }

        .dashboard-links {
          background: #f9f9f9;
          border: 2px dashed #2E7D32;
          border-radius: 8px;
          padding: 30px;
          margin-top: 40px;
        }

        .dashboard-links h2 {
          color: #1B5E20;
          margin-bottom: 20px;
        }

        .links-list {
          display: grid;
          gap: 15px;
        }

        .link-item {
          background: white;
          padding: 15px;
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .link-item span {
          font-weight: 600;
          min-width: 200px;
        }

        .link-item code {
          background: #ecf0f1;
          padding: 10px 15px;
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 0.85em;
          flex: 1;
          cursor: pointer;
          user-select: all;
          transition: background 0.2s;
        }

        .link-item code:hover {
          background: #2E7D32;
          color: white;
        }

        /* ========== LOADING ========== */

        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 400px;
          font-size: 1.2em;
          color: white;
        }

        /* ========== RESPONSIVE ========== */

        @media (max-width: 768px) {
          .formulario-header {
            padding: 20px;
          }

          .formulario-header h1 {
            font-size: 1.4em;
          }

          .dashboard-container {
            padding: 20px;
          }

          .link-item {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {formType === 'IT' && <FormularioIT />}
      {formType === 'Gerencia' && <FormularioGerencia />}
      {!formType && <Dashboard />}
    </div>
  );
}
