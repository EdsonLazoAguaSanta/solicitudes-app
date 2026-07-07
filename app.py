import streamlit as st
from supabase import create_client

SUPABASE_URL = "https://muqcnzsrmtkcowqyjvpk.supabase.co"
SUPABASE_KEY = "sb_publishable_Xflk5u6dGEWU47n9V6-s-Q_66yvsRKr"
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

st.set_page_config(page_title="Solicitudes", layout="wide")

query_params = st.query_params
form_type = query_params.get("form", [None])[0] if isinstance(query_params.get("form"), list) else query_params.get("form")
respondente = query_params.get("respondente", [None])[0] if isinstance(query_params.get("respondente"), list) else query_params.get("respondente")

if not form_type:
    st.title("Dashboard - Seguimiento")
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Erick Troncoso (IT)")
        try:
            r = supabase.table("solicitud_it").select("*").eq("respondente", "Erick Troncoso").execute()
            if r.data:
                d = r.data[0]
                items = []
                if d.get("host"): items.append(f"✓ Host: {d.get('host')}")
                if d.get("puerto"): items.append(f"✓ Puerto: {d.get('puerto')}")
                if d.get("usuario_sql"): items.append(f"✓ Usuario: {d.get('usuario_sql')}")
                if d.get("base_datos"): items.append(f"✓ BD: {d.get('base_datos')}")
                if d.get("tabla_estimacion"): items.append(f"✓ Tabla Est: {d.get('tabla_estimacion')}")
                if d.get("tabla_trisemanal"): items.append(f"✓ Tabla Tri: {d.get('tabla_trisemanal')}")
                if d.get("tabla_recepcion"): items.append(f"✓ Tabla Rec: {d.get('tabla_recepcion')}")
                
                if items:
                    st.success(f"✅ {len(items)} campos")
                    for i in items:
                        st.write(i)
                else:
                    st.info("Pendiente")
        except:
            st.info("Pendiente")
    
    with col2:
        st.subheader("Jerónimo Silva (Gerencia)")
        try:
            r = supabase.table("solicitud_gerencia").select("*").eq("respondente", "Jerónimo Silva").execute()
            if r.data:
                d = r.data[0]
                items = []
                if d.get("ejemplos_preguntas"):
                    c = len([x for x in d.get("ejemplos_preguntas", "").split("\n") if x.strip()])
                    items.append(f"✓ Ejemplos: {c}")
                if d.get("usuario_piloto_1") and isinstance(d.get("usuario_piloto_1"), dict):
                    u = d.get("usuario_piloto_1", {})
                    if u.get("nombre"): items.append(f"✓ Usuario: {u.get('nombre')}")
                if d.get("horarios_pico"): items.append("✓ Horarios")
                if d.get("restricciones_especiales"): items.append("✓ Restricciones")
                
                if items:
                    st.success(f"✅ {len(items)} campos")
                    for i in items:
                        st.write(i)
                else:
                    st.info("Pendiente")
        except:
            st.info("Pendiente")

elif form_type == "IT" and respondente:
    st.title(f"Solicitud IT - {respondente}")
    try:
        r = supabase.table("solicitud_it").select("*").eq("respondente", respondente).execute()
        e = r.data[0] if r.data else None
        
        st.subheader("Credenciales")
        col1, col2 = st.columns(2)
        with col1:
            host = st.text_input("Host", value=e.get("host") or "" if e else "")
        with col2:
            puerto = st.text_input("Puerto", value=e.get("puerto") or "" if e else "")
        
        col1, col2 = st.columns(2)
        with col1:
            usuario = st.text_input("Usuario", value=e.get("usuario_sql") or "" if e else "")
        with col2:
            password = st.text_input("Contraseña", type="password", value=e.get("contrasena") or "" if e else "")
        
        bd = st.text_input("Base de Datos", value=e.get("base_datos") or "" if e else "")
        
        st.subheader("Tablas")
        col1, col2, col3 = st.columns(3)
        with col1:
            tabla_est = st.text_input("Estimacion", value=e.get("tabla_estimacion") or "" if e else "")
        with col2:
            tabla_tri = st.text_input("Trisemanal", value=e.get("tabla_trisemanal") or "" if e else "")
        with col3:
            tabla_rec = st.text_input("Recepcion", value=e.get("tabla_recepcion") or "" if e else "")
        
        if st.button("Guardar"):
            from datetime import datetime
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
        
        ejemplos = st.text_area("Ejemplos", value=e.get("ejemplos_preguntas") or "" if e else "", height=150)
        
        st.subheader("Usuario Piloto")
        col1, col2 = st.columns(2)
        with col1:
            u1_n = st.text_input("Nombre", value=e.get("usuario_piloto_1", {}).get("nombre") or "" if e and isinstance(e.get("usuario_piloto_1"), dict) else "")
        with col2:
            u1_w = st.text_input("WhatsApp", value=e.get("usuario_piloto_1", {}).get("whatsapp") or "" if e and isinstance(e.get("usuario_piloto_1"), dict) else "")
        
        horarios = st.text_area("Horarios pico", value=e.get("horarios_pico") or "" if e else "", height=60)
        restricciones = st.text_area("Restricciones", value=e.get("restricciones_especiales") or "" if e else "", height=60)
        
        if st.button("Guardar"):
            from datetime import datetime
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
