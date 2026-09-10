-- =========================================================================
-- TRIGGER ACTUALIZADO: Sincronizar auth.users -> public.usuarios
-- Respeta el id_rol enviado desde el registro (o asigna rol por defecto)
-- =========================================================================

-- 1. Aseguramos que existan roles base si la tabla esta vacia
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Administrador') THEN
        INSERT INTO public.roles (nombre, descripcion, estado)
        VALUES ('Administrador', 'Control total del sistema', TRUE);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Operador') THEN
        INSERT INTO public.roles (nombre, descripcion, estado)
        VALUES ('Operador', 'Operaciones diarias de inventario y ventas', TRUE);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'Mecanico') THEN
        INSERT INTO public.roles (nombre, descripcion, estado)
        VALUES ('Mecanico', 'Personal tecnico de taller', TRUE);
    END IF;
END \$\$;

-- 2. Funcion trigger con lectura del id_rol de los metadatos
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS \$\$
DECLARE
    target_role_id UUID;
BEGIN
    -- Intentar obtener el id_rol enviado desde el formulario de registro
    IF NEW.raw_user_meta_data->>'id_rol' IS NOT NULL AND NEW.raw_user_meta_data->>'id_rol' <> '' THEN
        target_role_id := (NEW.raw_user_meta_data->>'id_rol')::UUID;
    END IF;

    -- Si no se envio o no es valido, buscar el rol 'Operador'
    IF target_role_id IS NULL THEN
        SELECT id INTO target_role_id 
        FROM public.roles 
        WHERE nombre = 'Operador' AND estado = TRUE AND eliminado = FALSE
        LIMIT 1;
    END IF;

    -- Si aun no existe, tomar el primer rol activo disponible
    IF target_role_id IS NULL THEN
        SELECT id INTO target_role_id 
        FROM public.roles 
        WHERE estado = TRUE AND eliminado = FALSE
        LIMIT 1;
    END IF;

    -- Insertar en public.usuarios
    INSERT INTO public.usuarios (
        id,
        id_rol,
        user_name,
        password,
        nombre,
        apellidos,
        correo,
        estado,
        eliminado,
        fecha_creacion
    ) VALUES (
        NEW.id,
        target_role_id,
        COALESCE(NEW.raw_user_meta_data->>'user_name', split_part(NEW.email, '@', 1)),
        'SUPABASE_MANAGED_AUTH',
        COALESCE(NEW.raw_user_meta_data->>'nombre', ''),
        COALESCE(NEW.raw_user_meta_data->>'apellidos', ''),
        NEW.email,
        TRUE,
        FALSE,
        CURRENT_TIMESTAMP
    );

    RETURN NEW;
END;
\$\$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
