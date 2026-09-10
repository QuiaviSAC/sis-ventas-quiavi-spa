# Motorix

React + Vite + Tailwind CSS project para gestion de taller automotriz y ventas/inventario.

## Development Server

\\\ash
npm run dev
\\\

## Supabase Schema Reference

El sistema interactua con las siguientes tablas y campos principales en Supabase (con trazabilidad: eliminado, fecha_creacion, fecha_actualizacion, fecha_eliminacion, creado_por, actualizado_por, eliminado_por):

1. **clientes**: id, tipo_cliente, dni, nombres, apellidos, ruc, razon_social, nombre_comercial, telefono, correo, direccion, estado
2. **roles**: id, nombre, code, descripcion, estado
3. **usuarios**: id, id_rol, user_name, password, nombre, apellidos, correo, estado
4. **categorias**: id, nombre, descripcion, estado
5. **unidades**: id, nombre, descripcion, abreviatura, estado
6. **productos**: id, id_categoria, codigo_producto, nombre, descripcion, estado
7. **presentaciones**: id, id_unidad, id_producto, nombre, precio, estado
8. **ventas**: id, id_cliente, id_usuario, fecha, subtotal, descuento, total, tipo_de_pago, estado
9. **detalles_venta**: id, id_venta, id_presentacion, cantidad, precio_unitario, descuento, subtotal
10. **inventarios**: id, id_producto, stock_actual, stock_minimo
11. **movimientos_inventario**: id, id_producto, id_usuario, tipo_movimiento, descripcion, cantidad, observacion, fecha_movimiento

## Project Structure

- \src/lib/supabase.ts\ - Cliente singleton de Supabase
- \src/services/\ - Capa de acceso a datos para Supabase
- \src/hooks/\ - Custom hooks reactivos
- \src/context/AuthContext.tsx\ - Autenticacion y sesion
- \src/types/index.ts\ - Tipado compatible con el schema
- \src/pages/\ - Vistas del sistema (Dashboard, Productos, Inventario, Ventas, Reportes, Configuracion)
