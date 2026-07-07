import streamlit as st
from supabase import create_client
from datetime import datetime

SUPABASE_URL = "https://muqcnzsrmtkcowqyjvpk.supabase.co"
SUPABASE_KEY = "sb_publishable_Xflk5u6dGEWU47n9V6-s-Q_66yvsRKr"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

st.set_page_config(page_title="Solicitudes", layout="wide")

query_params = st.query_params
form_type = query_params.get("form", [None])[0] if isinstance(query_params.get("form"), list) else query_params.get("form")
respondente = query_params.get("respondente", [None])[0] if isinstance(query_params.get("respondente"), list) else query_params.get("respondente")

if not form_type:
    st.title("Dashboard - Solicitudes Recibidas")
    st.divider()
    
    col1, col2 = st.columns(2)
    
    # ERICK IT
    with col1:
        st.subheader("Erick Troncoso (IT)")
        try:
            r = supabase.table("solicitud_it").select("*").eq("respondente", "Erick Troncoso").execute()
            if r.data:
                d = r.data[0]
                if d.get("host") or d.get("usuario_sql"):
                    with st.container(border=True):
                        st.success("✅ DATOS RECIBIDOS")
                        st.write(f"**Host:** {d.get('host') or 'N/A'}")
                        st.write(f"**Puerto:** {d.get('puerto') or 'N/A'}")
                        st.write(f"**Usuario:** {d.get('usuario_sql') or 'N/A'}")
                        st.write(f"**Contraseña:** {'••••••••' if d.get('contrasena') else 'N/A'}")
                        st.write(f"**Base de Datos:** {d.get('base_datos') or 'N/A'}")
                        st.write(f"**Tabla Estimación:** {d.get('tabla_estimacion') or 'N/A'}")
                        st.write(f"**Tabla Trisemanal:** {d.get('tabla_trisemanal') or 'N/A'}")
                        st.write(f"**Tabla Recepción:** {d.get('tabla_recepcion') or 'N/A'}")
                        st.caption(f"Última actualización: {d.get('fecha_actualizacion')}")
                else:
                    st.info("⏳ Pendiente de respuesta")
        except Exception as e:
            st.error(f"Error: {e}")
    
    # JERÓNIMO GERENCIA
    with col2:
        st.subheader("Jerónimo Silva (Gerencia)")
        try:
            r = supabase.table("solicitud_gerencia").select("*").eq("respondente", "Jerónimo Silva").execute()
            if r.data:
                d = r.data[0]
                if d.get("ejemplos_preguntas") or (d.get("usuario_piloto_1") and d.get("usuario_piloto_1").get("nombre")):
                    with st.container(border=True):
                        st.success("✅ DATOS RECIBIDOS")
                        
                        if d.get("ejemplos_preguntas"):
                            st.write("**Ejemplos de Preguntas:**")
                            ejemplos = d.get("ejemplos_preguntas", "").strip().split("\n")
                            for i, ej in enumerate(ejemplos, 1):
                                if ej.strip():
                                    st.write(f"  {i}. {ej.strip()}")
                        
                        if d.get("usuario_piloto_1"):
                            u1 = d.get("usuario_piloto_1", {})
                            st.write(f"**Usuario Piloto 1:**")
                            st.write(f"  Nombre: {u1.get('nombre') or 'N/A'}")
                            st.write(f"  WhatsApp: {u1.get('whatsapp') or 'N/A'}")
                        
                        if d.get("horarios_pico"):
                            st.write(f"**Horarios Pico:** {d.get('horarios_pico')}")
                        
                        if d.get("restricciones_especiales"):
                            st.write(f"**Restricciones:** {d.get('restricciones_especiales')}")
                        
                        st.caption(f"Última actualización: {d.get('fecha_actualizacion')}")
                else:
                    st.info("⏳ Pendiente de respuesta")
        except Exception as e:
            st.error(f"Error: {e}")

elif form_type == "IT" and respondente:
    st.title(f"Solicitud IT - {respondente}")
    try:
        r = supabase.table("solicitud_it").select("*").eq("respondente", respondente).execute()
        e = r.data[0] if r.data else None
        
        host = st.text_input("Host", value=e.get("host") or "" if e else "")
        puerto = st.text_input("Puerto", value=e.get("puerto") or "" if e else "")
        usuario = st.text_input("Usuario", value=e.get("usuario_sql") or "" if e else "")
        password = st.text_input("Contraseña", type="password", value=e.get("contrasena") or "" if e else "")
        bd = st.text_input("Base de Datos", value=e.get("base_datos") or "" if e else "")
        tabla_est = st.text_input("Tabla Estimacion", value=e.get("tabla_estimacion") or "" if e else "")
        tabla_tri = st.text_input("Tabla Trisemanal", value=e.get("tabla_trisemanal") or "" if e else "")
        tabla_rec = st.text_input("Tabla Recepcion", value=e.get("tabla_recepcion") or "" if e else "")
        
        if st.button("Guardar"):
            supabase.table("solicitud_it").upsert({
                "respondente": respondente,
                "host": host, "puerto": puerto, "usuario_sql": usuario,
                "contrasena": password, "base_datos": bd,
                "tabla_estimacion": tabla_est, "tabla_trisemanal": tabla_tri,
                "tabla_recepcion": tabla_rec,
                "fecha_actualizacion": datetime.now().isoformat()
            }).execute()
            st.success("Guardado!")
    except Exception as e:
        st.error(str(e))

elif form_type == "Gerencia" and respondente:
    st.title(f"Solicitud Gerencia - {respondente}")
    try:
        r = supabase.table("solicitud_gerencia").select("*").eq("respondente", respondente).execute()
        e = r.data[0] if r.data else None
        
        ejemplos = st.text_area("Ejemplos (una por línea)", value=e.get("ejemplos_preguntas") or "" if e else "", height=150)
        u1_n = st.text_input("Usuario Piloto - Nombre", value=e.get("usuario_piloto_1", {}).get("nombre") or "" if e and isinstance(e.get("usuario_piloto_1"), dict) else "")
        u1_w = st.text_input("Usuario Piloto - WhatsApp", value=e.get("usuario_piloto_1", {}).get("whatsapp") or "" if e and isinstance(e.get("usuario_piloto_1"), dict) else "")
        horarios = st.text_area("Horarios Pico", value=e.get("horarios_pico") or "" if e else "", height=80)
        restricciones = st.text_area("Restricciones", value=e.get("restricciones_especiales") or "" if e else "", height=80)
        
        if st.button("Guardar"):
            supabase.table("solicitud_gerencia").upsert({
                "respondente": respondente,
                "ejemplos_preguntas": ejemplos,
                "usuario_piloto_1": {"nombre": u1_n, "whatsapp": u1_w},
                "horarios_pico": horarios,
                "restricciones_especiales": restricciones,
                "fecha_actualizacion": datetime.now().isoformat()
            }).execute()
            st.success("Guardado!")
    except Exception as e:
        st.error(str(e))
