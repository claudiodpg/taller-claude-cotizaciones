# 00 · Alcance

## Problema
Un equipo comercial pequeño recibe solicitudes de cotizacion por varios canales, las prepara a
mano y pierde el rastro del seguimiento. Se quiere una herramienta minima que ordene el flujo
**de solicitud a cierre** y deje registro.

## Objetivo del lab
Construir una **rebanada vertical** end-to-end, pequeña y correcta, que demuestre el ciclo de
desarrollo asistido por Claude. No es un producto: es material de taller.

## Dentro de alcance
- Ingesta de solicitudes desde un canal **simulado** (seed JSON).
- Normalizacion de los datos de entrada.
- Crear una cotizacion desde una solicitud (plantilla).
- Avanzar el estado por una maquina de estados (enviar, seguimiento, aceptar/rechazar).
- Registrar el cierre (aceptada) en un "CRM" = tabla simple.
- UI minima de lista + detalle con design tokens.
- Simulacion de identidad por `tenant` (equipo) para ejercitar control de acceso.

## Fuera de alcance (protege tiempo y cuota)
- Integraciones reales (WhatsApp, email, CRM externo).
- Autenticacion/roles reales, multitenancy real, permisos finos.
- Pagos, facturacion, reportes/dashboards.
- Nube, despliegue, contenedores.
- Edicion libre de items desde la UI (se crean via ingesta/seed).

## Actores
- **Comercial** (usuario): pertenece a un `tenant`/equipo; gestiona sus cotizaciones.
- **Canal simulado**: fuente de solicitudes (seed JSON).

## Definicion de "terminado" del lab
La rebanada vertical corre de punta a punta (`seed → lista → avanzar estado → cierre en CRM`),
con tests en verde, y el fallo de seguridad plantado (IDOR) documentado y corregido en `cp-06`.
