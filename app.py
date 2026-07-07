import html
from datetime import datetime

import streamlit as st
from supabase import create_client

SUPABASE_URL = "https://muqcnzsrmtkcowqyjvpk.supabase.co"
SUPABASE_KEY = "sb_publishable_Xflk5u6dGEWU47n9V6-s-Q_66yvsRKr"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

st.set_page_config(page_title="Solicitudes - Bot WhatsApp", layout="wide", page_icon="🌱")

st.markdown(
    """
    <style>
    .stApp { background: #f5f5f5; }

    .app-header {
        background: linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%);
        color: white;
        padding: 30px 40px;
        border-radius: 8px;
        margin-bottom: 25px;
    }
    .app-header h1 { margin: 0 0 6px 0; font-size: 1.8em; }
    .app-header p { margin: 0; opacity: 0.9; }

    .section-title {
        color: #1B5E20;
        font-size: 1.2em;
        font-weight: 700;
        margin: 25px 0 10px 0;
        padding-bottom: 8px;
        border-bottom: 2px solid #2E7D32;
    }

    .field-hint {
        color: #666;
        font-size: 0.85em;
        margin: -10px 0 14px 2px;
    }

    .badge {
        display: inline-block;
        padding: 5px 14px;
        border-radius: 20px;
        font-size: 0.85em;
        font-weight: 600;
        margin-bottom: 12px;
    }
    .badge-ok { background: #E8F5E9; color: #1B5E20; border: 1px solid #2E7D32; }
    .badge-pending { background: #FFF3E0; color: #F57C00; border: 1px solid #F57C00; }

    .resumen-item { margin: 4px 0; font-size: 0.95em; }
    .resumen-label { color: #1B5E20; font-weight: 600; }

    .historial-fecha {
        color: #1B5E20;
        font-weight: 700;
        font-size: 0.9em;
        margin: 10px 0 4px 0;
    }
    .historial-sep { border: none; border-top: 1px solid #eee; margin: 12px 0; }

    div[data-testid="stForm"] {
        background: white;
        border-radius: 8px;
        padding: 20px 25px;
        border: 1px solid #ddd;
    }

    .stButton > button {
        background: #2E7D32;
        color: white;
        border: none;
        font-weight: 600;
    }
    .stButton > button:hover { background: #1B5E20; color: white; }
    </style>
    """,
    unsafe_allow_html=True,
)


def get_param(name):
    val = st.query_params.get(name)
    if isinstance(val, list):
        return val[0] if val else None
    return val


def header(titulo, subtitulo):
    st.markdown(
        f"<div class='app-header'><h1>{html.escape(titulo)}</h1><p>{html.escape(subtitulo)}</p></div>",
        unsafe_allow_html=True,
    )


def campo_con_ayuda(texto_ayuda):
    st.markdown(f"<div class='field-hint'>{html.escape(texto_ayuda)}</div>", unsafe_allow_html=True)


def formatear_fecha(fecha_iso):
    if not fecha_iso:
        return "sin fecha"
    try:
        dt = datetime.fromisoformat(str(fecha_iso).replace("Z", "+00:00"))
        return dt.strftime("%d-%m-%Y %H:%M")
    except ValueError:
        return str(fecha_iso)


def resumen_it(d):
    if not d:
        st.caption("Sin datos todavía.")
        return
    campos = [
        ("host", "Host / IP"),
        ("puerto", "Puerto"),
        ("usuario_sql", "Usuario"),
        ("contrasena", "Contraseña"),
        ("base_datos", "Base de Datos"),
        ("tabla_estimacion", "Tabla Estimación"),
        ("tabla_trisemanal", "Tabla Trisemanal"),
        ("tabla_recepcion", "Tabla Recepción"),
    ]
    for key, label in campos:
        valor = d.get(key)
        if key == "contrasena" and valor:
            valor = "••••••••"
        st.markdown(f"**{label}:** {valor or '—'}")


def resumen_gerencia(d):
    if not d:
        st.caption("Sin datos todavía.")
        return
    if d.get("ejemplos_preguntas"):
        st.markdown("**Ejemplos de preguntas:**")
        for i, ejemplo in enumerate(str(d["ejemplos_preguntas"]).strip().split("\n"), 1):
            if ejemplo.strip():
                st.markdown(f"{i}. {ejemplo.strip()}")
    u1 = d.get("usuario_piloto_1") or {}
    if u1.get("nombre"):
        st.markdown(f"**Usuario piloto:** {u1.get('nombre')} — {u1.get('whatsapp') or 'sin WhatsApp'}")
    if d.get("horarios_pico"):
        st.markdown(f"**Posibles horarios de mayor consulta:** {d['horarios_pico']}")
    if d.get("restricciones_especiales"):
        st.markdown(f"**Restricciones:** {d['restricciones_especiales']}")


def obtener_actual(tabla, respondente_nombre):
    r = (
        supabase.table(tabla)
        .select("*")
        .eq("respondente", respondente_nombre)
        .order("fecha_actualizacion", desc=True)
        .limit(1)
        .execute()
    )
    return r.data[0] if r.data else {}


def guardar_historial(tipo, respondente_nombre, snapshot):
    supabase.table("historial").insert(
        {
            "tipo_formulario": tipo,
            "respondente": respondente_nombre,
            "snapshot": snapshot,
            "fecha": datetime.now().isoformat(),
        }
    ).execute()


def mostrar_historial(tipo, respondente_nombre, render_fn):
    try:
        r = (
            supabase.table("historial")
            .select("*")
            .eq("tipo_formulario", tipo)
            .eq("respondente", respondente_nombre)
            .order("fecha", desc=True)
            .execute()
        )
        filas = r.data or []
    except Exception as e:
        st.caption(f"No se pudo cargar el historial: {e}")
        return

    with st.expander(f"🕒 Historial de cambios ({len(filas)})"):
        if not filas:
            st.caption("Todavía no hay guardados registrados.")
            return
        for fila in filas:
            st.markdown(
                f"<div class='historial-fecha'>Guardado el {formatear_fecha(fila.get('fecha'))}</div>",
                unsafe_allow_html=True,
            )
            render_fn(fila.get("snapshot") or {})
            st.markdown("<hr class='historial-sep'/>", unsafe_allow_html=True)


form_type = get_param("form")
respondente = get_param("respondente")

if not form_type:
    header("📊 Dashboard - Seguimiento de Solicitudes", "Proyecto Bot WhatsApp - Sistema de Cosecha")
    col1, col2 = st.columns(2)

    with col1:
        st.markdown("<div class='section-title'>🖥️ Erick Troncoso (IT)</div>", unsafe_allow_html=True)
        try:
            d = obtener_actual("solicitud_it", "Erick Troncoso")
            recibido = bool(d and (d.get("host") or d.get("usuario_sql")))
            with st.container(border=True):
                if recibido:
                    st.markdown("<span class='badge badge-ok'>✅ Datos recibidos</span>", unsafe_allow_html=True)
                    resumen_it(d)
                else:
                    st.markdown("<span class='badge badge-pending'>⏳ Pendiente de respuesta</span>", unsafe_allow_html=True)
            mostrar_historial("IT", "Erick Troncoso", resumen_it)
        except Exception as e:
            st.error(f"Error: {e}")

    with col2:
        st.markdown("<div class='section-title'>🏢 Jerónimo Silva (Gerencia)</div>", unsafe_allow_html=True)
        try:
            d = obtener_actual("solicitud_gerencia", "Jerónimo Silva")
            recibido = bool(d and (d.get("ejemplos_preguntas") or (d.get("usuario_piloto_1") or {}).get("nombre")))
            with st.container(border=True):
                if recibido:
                    st.markdown("<span class='badge badge-ok'>✅ Datos recibidos</span>", unsafe_allow_html=True)
                    resumen_gerencia(d)
                else:
                    st.markdown("<span class='badge badge-pending'>⏳ Pendiente de respuesta</span>", unsafe_allow_html=True)
            mostrar_historial("Gerencia", "Jerónimo Silva", resumen_gerencia)
        except Exception as e:
            st.error(f"Error: {e}")

elif form_type == "IT" and respondente:
    header("📋 Solicitud Técnica - IT", f"Para: {respondente}")
    try:
        actual = obtener_actual("solicitud_it", respondente)

        with st.form("form_it", clear_on_submit=True):
            st.markdown("<div class='section-title'>1. Credenciales de conexión SQL Server</div>", unsafe_allow_html=True)

            col1, col2 = st.columns(2)
            with col1:
                host = st.text_input("Host / IP")
                campo_con_ayuda("Dirección o IP donde el bot se conectará a SQL Server.")
            with col2:
                puerto = st.text_input("Puerto")
                campo_con_ayuda("Puerto TCP de SQL Server (normalmente 1433).")

            col3, col4 = st.columns(2)
            with col3:
                usuario = st.text_input("Usuario")
                campo_con_ayuda("Usuario con permiso de solo lectura (SELECT) sobre Softland.")
            with col4:
                password = st.text_input("Contraseña", type="password")
                campo_con_ayuda("Contraseña del usuario indicado arriba.")

            bd = st.text_input("Base de Datos Softland")
            campo_con_ayuda("Nombre exacto de la base de datos donde vive el schema de Softland.")

            st.markdown("<div class='section-title'>2. Tablas requeridas</div>", unsafe_allow_html=True)

            tabla_est = st.text_input("Nombre tabla de Estimación")
            campo_con_ayuda("Tabla con la estimación de cosecha (Invierno/Primavera).")

            tabla_tri = st.text_input("Nombre tabla Trisemanal actual")
            campo_con_ayuda("Tabla con la programación trisemanal vigente.")

            tabla_rec = st.text_input("Nombre tabla Recepción Planta")
            campo_con_ayuda("Tabla con la recepción de fruta en planta (fecha, variedad, cantidad, hora).")

            guardar = st.form_submit_button("💾 Guardar cambios")

        if guardar:
            payload = {
                "respondente": respondente,
                "host": host,
                "puerto": puerto,
                "usuario_sql": usuario,
                "contrasena": password,
                "base_datos": bd,
                "tabla_estimacion": tabla_est,
                "tabla_trisemanal": tabla_tri,
                "tabla_recepcion": tabla_rec,
                "fecha_actualizacion": datetime.now().isoformat(),
            }
            supabase.table("solicitud_it").upsert(payload, on_conflict="respondente").execute()
            st.success("Guardado!")
            actual = payload
            try:
                guardar_historial("IT", respondente, payload)
            except Exception as hist_err:
                st.warning(f"Se guardó tu respuesta, pero no se pudo registrar en el historial: {hist_err}")

        st.markdown("<div class='section-title'>Resumen</div>", unsafe_allow_html=True)
        with st.expander("📋 Ver resumen de lo que ingresaste", expanded=guardar):
            resumen_it(actual)

        mostrar_historial("IT", respondente, resumen_it)

    except Exception as e:
        st.error(str(e))

elif form_type == "Gerencia" and respondente:
    header("📋 Solicitud Operacional - Gerencia", f"Para: {respondente}")
    try:
        actual = obtener_actual("solicitud_gerencia", respondente)

        with st.form("form_gerencia", clear_on_submit=True):
            st.markdown("<div class='section-title'>1. Ejemplos de preguntas reales</div>", unsafe_allow_html=True)
            ejemplos = st.text_area("Ejemplos (uno por línea)", height=150)
            campo_con_ayuda('Escribe preguntas reales que le harían al bot, una por línea. Ej: "¿Qué cosecho próximas 3 semanas?"')

            st.markdown("<div class='section-title'>2. Usuario piloto para UAT</div>", unsafe_allow_html=True)
            u1_n = st.text_input("Nombre completo")
            campo_con_ayuda("Persona que probará el bot antes del go-live.")
            u1_w = st.text_input("WhatsApp")
            campo_con_ayuda("Número de WhatsApp donde probaremos el bot con esta persona (ej: +56912345678).")

            st.markdown("<div class='section-title'>3. Información adicional</div>", unsafe_allow_html=True)
            horarios = st.text_area("Horarios de mayor consultas", height=80)
            campo_con_ayuda("¿Hay horas del día donde se concentran más preguntas?")

            restricciones = st.text_area("Restricciones o consideraciones especiales", height=80)
            campo_con_ayuda("Ej: información confidencial que el bot no debe compartir, usuarios que no manejan español técnico, etc.")

            guardar = st.form_submit_button("💾 Guardar cambios")

        if guardar:
            payload = {
                "respondente": respondente,
                "ejemplos_preguntas": ejemplos,
                "usuario_piloto_1": {"nombre": u1_n, "whatsapp": u1_w},
                "horarios_pico": horarios,
                "restricciones_especiales": restricciones,
                "fecha_actualizacion": datetime.now().isoformat(),
            }
            supabase.table("solicitud_gerencia").upsert(payload, on_conflict="respondente").execute()
            st.success("Guardado!")
            actual = payload
            try:
                guardar_historial("Gerencia", respondente, payload)
            except Exception as hist_err:
                st.warning(f"Se guardó tu respuesta, pero no se pudo registrar en el historial: {hist_err}")

        st.markdown("<div class='section-title'>Resumen</div>", unsafe_allow_html=True)
        with st.expander("📋 Ver resumen de lo ingresado", expanded=guardar):
            resumen_gerencia(actual)

        mostrar_historial("Gerencia", respondente, resumen_gerencia)

    except Exception as e:
        st.error(str(e))
