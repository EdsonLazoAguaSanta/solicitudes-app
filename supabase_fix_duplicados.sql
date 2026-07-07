-- Ejecutar en el SQL Editor de Supabase.

-- 1) Limpiar los datos de prueba para que puedas probar desde cero.
delete from historial;
delete from solicitud_it where respondente = 'Erick Troncoso';
delete from solicitud_gerencia where respondente = 'Jerónimo Silva';

-- 2) Asegurar que "respondente" sea único en cada tabla. Si no lo es, cada
--    "Guardar" puede estar creando una fila nueva en vez de actualizar la
--    existente, lo que hace que al recargar se muestre una fila distinta
--    (vieja o duplicada) en vez de la más reciente. Si el constraint ya
--    existe, estas líneas fallarán con "already exists" — en ese caso
--    ignora el error, ya estaba bien.
alter table solicitud_it add constraint solicitud_it_respondente_key unique (respondente);
alter table solicitud_gerencia add constraint solicitud_gerencia_respondente_key unique (respondente);
