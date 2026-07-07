-- Ejecutar en el SQL Editor de Supabase.
--
-- Nota: las restricciones UNIQUE sobre "respondente" ya existían en
-- solicitud_it y solicitud_gerencia, así que no hace falta crearlas.
-- El problema era que el código no le indicaba a upsert() cuál columna
-- usar para detectar conflictos (on_conflict), así que podía insertar
-- filas nuevas en vez de actualizar la existente. Eso ya está corregido
-- en app.py.
--
-- Esto solo limpia los datos de prueba para que puedas probar desde cero.

delete from historial;
delete from solicitud_it where respondente = 'Erick Troncoso';
delete from solicitud_gerencia where respondente = 'Jerónimo Silva';
