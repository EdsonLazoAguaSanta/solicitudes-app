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
    st.title("📊 Dashboard - Seguimiento")
    st.divider()
    
    col1, col2 = st.columns(2)
    
    # ERICK - IT
    with col1:
        st.subheader("Erick Troncoso (IT)")
        try:
            response = supabase.table("solicitud_it").select("*").eq("respondente", "Erick Troncoso").execute()
            if response.data:
                data = response.data[0]
                if data.get("host"):
                    with st.container(border=True):
                        st.success("✅ Datos recibidos")
                        
                        campos = {
                            "Host": data.get("host"),
                            "Puerto": data.get("puerto"),
                            "Usuario": data.get("usuario_sql"),
                            "Base de Datos": data.get("base_datos")
                        }
                        
                        for campo, valor in campos.items():
                            if valor:
                                st.write(f"✓ {campo}: **{valor}**")
                        
                        st.caption(f"Última actualización: {data.get('fecha_actualizacion', 'N/A')}")
                else:
                    st.info("⏳ Pendiente de respuesta")
            else:
                st.info("⏳ Pendiente de respuesta")
        except Exception as e:
            st.info("⏳ Pendiente...")
    
    # JERÓNIMO - GERENCIA
    with col2:
        st.subheader("Jerónimo Silva (Gerencia)")
        try:
            response = supabase.table("solicitud_gerencia").select("*").eq("respondente", "Jerónimo Silva").execute()
            if response.data:
                data = response.data[0]
                if data.get("ejemplos_preguntas") or (data.get("usuario_piloto_1") and data.get("usuario_piloto_1", {}).get("nombre")):
                    with st.container(border=True):
                        st.success("✅ Datos recibidos")
                        
                        if data.get("ejemplos_preguntas"):
                            ejemplos_count = len(data.get("ejemplos_preguntas", "").strip().split("\n"))
                            st.write(f"✓ Ejemplos de preguntas: **{ejemplos_count}**")
                        
                        if data.get("usuario_piloto_1"):
                            u1 = data.get("usuario_piloto_1", {})
                            if isinstance(u1, dict) and u1.get("nombre"):
                                st.write(f"✓ Usuario piloto 1: **{u1.get('nombre')}**")
                                if u1.get("whatsapp"):
                                    st.write(f"  WhatsApp: **{u1.get('whatsapp')}**")
                        
                        st.caption(f"Última actualización: {data.get('fecha_actualizacion', 'N/A')}")
                else:
                    st.info("⏳ Pendiente de respuesta")
            else:
                st.info("⏳ Pendiente de respuesta")
        except Exception as e:
            st.info("⏳ Pendiente...")

elif form_type == "IT" and respondente:
    st.title(f"📋 Solicitud IT - {respondente}")
    st.divider()
    
    try:
        response = supabase.table("solicitud_it").select("*").eq("respondente", respondente).execute()
        existing = response.data[0] if response.data else None
        
        st.subheader("Credenciales SQL Server")
        col1, col2 = st.columns(2)
        with col1:
            host = st.text_input("Host", value=existing.get("host") or "" if existing else "")
        with col2:
            puerto = st.text_input("Puerto", value=existing.get("puerto") or "" if existing else "")
        
        col1, col2 = st.columns(2)
        with col1:
            usuario = st.text_input("Usuario", value=existing.get("usuario_sql") or "" if existing else "")
        with col2:
            password = st.text_input("Contraseña", type="password", value=existing.get("contrasena") or "" if existing else "")
        
        bd = st.text_input("Base de Datos", value=existing.get("base_datos") or "" if existing else "")
        
        st.subheader("Tablas Críticas")
        col1, col2, col3 = st.columns(3)
        with col1:
            tabla_est = st.text_input("Tabla Estimación", value=existing.get("tabla_estimacion") or "" if existing else "")
        with col2:
            tabla_tri = st.text_input("Tabla Trisemanal", value=existing.get("tabla_trisemanal") or "" if existing else "")
        with col3:
            tabla_rec = st.text_input("Tabla Recepción", value=existing.get("tabla_recepcion") or "" if existing else "")
        
        if st.button("💾 Guardar"):
            data = {
                "respondente": respondente,
                "host": host,
                "puerto": puerto,
                "usuario_sql": usuario,
                "contrasena": password,
                "base_datos": bd,
                "tabla_estimacion": tabla_est,
                "tabla_trisemanal": tabla_tri,
                "tabla_recepcion": tabla_rec,
                "fecha_actualizacion": datetime.now().isoformat()
            }
            
            if existing:
                supabase.table("solicitud_it").update(data).eq("respondente", respondente).execute()
            else:
                supabase.table("solicitud_it").insert(data).execute()
            
            st.success("✅ Guardado exitosamente!")
            st.rerun()
    except Exception as e:
        st.error(f"Error: {e}")

elif form_type == "Gerencia" and respondente:
    st.title(f"📋 Solicitud Gerencia - {respondente}")
    st.divider()
    
    try:
        response = supabase.table("solicitud_gerencia").select("*").eq("respondente", respondente).execute()
        existing = response.data[0] if response.data else None
        
        st.subheader("Ejemplos de Preguntas")
        ejemplos = st.text_area("Escribe las preguntas (una por línea)", value=existing.get("ejemplos_preguntas") or "" if existing else "", height=150)
        
        st.subheader("Usuario Piloto #1")
        col1, col2 = st.columns(2)
        with col1:
            u1_nombre = st.text_input("Nombre", value=existing.get("usuario_piloto_1", {}).get("nombre") or "" if existing and isinstance(existing.get("usuario_piloto_1"), dict) else "")
        with col2:
            u1_whatsapp = st.text_input("WhatsApp", value=existing.get("usuario_piloto_1", {}).get("whatsapp") or "" if existing and isinstance(existing.get("usuario_piloto_1"), dict) else "")
        
        if st.button("💾 Guardar"):
            data = {
                "respondente": respondente,
                "ejemplos_preguntas": ejemplos,
                "usuario_piloto_1": {"nombre": u1_nombre, "whatsapp": u1_whatsapp},
                "fecha_actualizacion": datetime.now().isoformat()
            }
            
            if existing:
                supabase.table("solicitud_gerencia").update(data).eq("respondente", respondente).execute()
            else:
                supabase.table("solicitud_gerencia").insert(data).execute()
            
            st.success("✅ Guardado exitosamente!")
            st.rerun()
    except Exception as e:
        st.error(f"Error: {e}")
