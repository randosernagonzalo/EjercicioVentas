/* Los precios están en euros. */

db.ventas.insertMany( [
    {
     nombre_articulo: "muñeco",
     precio_unidad: 25, 
     costo: 13.2,
     numero_unidades: 30, 
     fecha_venta: new Date("2021-12-01"), 
     cliente:"jugueteria paco", 
     vendedor:"toyfactory" 
    },

    {nombre_articulo: "camiseta", precio_unidad: 10, costo: 4, numero_unidades: 23, fecha_venta: new Date("2022-01-03"), cliente:"modas san juan", vendedor:"fila" },
    {nombre_articulo: "muñeco", precio_unidad: 20, costo: 9, numero_unidades: 15, fecha_venta: new Date("2021-11-25"), cliente:"jugueteria paco", vendedor:"toyworld" },
    {nombre_articulo: "pelota", precio_unidad: 2.5, costo: 0.5, numero_unidades: 15, fecha_venta: new Date("2021-11-25"), cliente:"jugueteria paco", vendedor:"toyworld" },
    {nombre_articulo: "zapatillas", precio_unidad: 45, costo: 20, numero_unidades: 7, fecha_venta: new Date("2021-10-21"), cliente:"deportes ortega", vendedor:"fila" },
    {nombre_articulo: "raqueta", precio_unidad: 16.2, costo: 8, numero_unidades: 3, fecha_venta: new Date("2021-07-30"), cliente:"juguetos", vendedor:"toyfactory" },
    {nombre_articulo: "calcetines", precio_unidad: 3.6, costo: 1.2, numero_unidades: 20, fecha_venta: new Date("2021-12-30"), cliente:"deportes ortega", vendedor:"puma" },
    {nombre_articulo: "juego de mesa", precio_unidad: 15, costo: 7, numero_unidades: 5, fecha_venta: new Date("2021-10-01"), cliente:"juguetos", vendedor:"toyfactory" },
    {nombre_articulo: "pantalones", precio_unidad: 23.7, costo: 12.1, numero_unidades: 15, fecha_venta: new Date("2021-09-28"), cliente:"modas san juan", vendedor:"shain" },
    {nombre_articulo: "camiseta", precio_unidad: 17.9, costo:11, numero_unidades: 20, fecha_venta: new Date("2021-12-20"), cliente:"deportes ortega", vendedor:"adidas" },
    {nombre_articulo: "juego de mesa", precio_unidad: 12, costo: 6, numero_unidades: 10, fecha_venta: new Date("2021-10-08"), cliente:"jugueteria paco", vendedor:"toyfactory" }

] )


/* Expresa el precio total de compra de cada pedido. */
db.ventas.aggregate(
    {$project: {_id: null, nombre_articulo: 1, fecha_venta: 1, precio_total: { $multiply: ["$precio_unidad", "$numero_unidades"] } } }
)

/* Expresa el costo total de la compra de cada pedido. */
db.ventas.aggregate(
    {$project: {_id: null, nombre_articulo: 1, fecha_venta: 1, costo_total: { $multiply: ["$costo", "$numero_unidades"] } } }
)

/* Expresa el beneficio de cada producto. */
db.ventas.aggregate(
    {$project: {_id: null, nombre_articulo: 1, fecha_venta:1, beneficio: {$subtract: [ "$precio_unidad", "$costo" ] } } },
)

/* Expresa el beneficio que sacamos de cada venta.*/
db.ventas.aggregate(
    {$project: {_id: null, nombre_articulo: 1, fecha_venta:1, numero_unidades:1, beneficio: {$subtract: [ "$precio_unidad", "$costo" ] } } },
    {$project: {_id: null, nombre_articulo: 1, fecha_venta: 1, beneficio_total: { $multiply: ["$beneficio", "$numero_unidades"] } } }

)

/* Expresa los beneficios totales que hemos sacado con cada cliente para ver así cual es el cliente con el que mas beneficio conseguimos. */
db.ventas.aggregate(
    {$project: {_id: null, cliente:1, numero_unidades: 1, costo:1, precio_unidad:1,} },
    {$project: {_id: null, cliente:1, numero_unidades:1, beneficio: {$subtract: [ "$precio_unidad", "$costo" ] } } },
    {$project: {_id: null, cliente:1, b_total: { $multiply: ["$beneficio", "$numero_unidades"] } } },
    {$group: {_id: "$cliente", beneficio_total:{ $sum: "$b_total"} } },
)

/* Expresa los beneficios de cada mes registrados por lo que podemos ver cual fué el mejor mes. */
db.ventas.aggregate( 
    {$project : {_id : null,  fecha: {$dateToString: { format: "%Y-%m", date: "$fecha_venta"  } }, numero_unidades:1, costo:1, precio_unidad:1, } } ,
    {$project: {_id: null, fecha:1, numero_unidades:1, beneficio: {$subtract: [ "$precio_unidad", "$costo" ] } } },
    {$project: {_id: null, fecha:1, b_total: { $multiply: ["$beneficio", "$numero_unidades"] } } },
    {$group: {_id: "$fecha", beneficio_total:{ $sum: "$b_total"} } },
)

/* Expresa los beneficios totales que hemos sacado con cada vendedor para ver así cual es el vendedor con el que mas beneficio conseguimos. */
db.ventas.aggregate(
    {$project: {_id: null, vendedor:1, numero_unidades: 1, costo:1, precio_unidad:1,} },
    {$project: {_id: null, vendedor:1, numero_unidades:1, beneficio: {$subtract: [ "$precio_unidad", "$costo" ] } } },
    {$project: {_id: null, vendedor:1, b_total: { $multiply: ["$beneficio", "$numero_unidades"] } } },
    {$group: {_id: "$vendedor", beneficio_total:{ $sum: "$b_total"} } },
)

/* Expresa el máximo de unidades que vendio cada dia la empresa toyfactory. */
db.ventas.aggregate(
    {$match:{ vendedor: "toyfactory"} },
    {$group: {_id: "$fecha_venta", maximo_unidades: { $max: "$numero_unidades" } } },
)

/* Expresa la media de ventas que solemos hacer en un pedido. */
db.ventas.aggregate(
    {$group: { _id: null, ventas_medias: { $avg: "$numero_unidades" } } }
)

/* Suponiendo que el número de articulos vendios en un dia sea de 10, muestra cuantos dias ha repuesto el almacén deportes ortega.*/
db.ventas.aggregate(
    {$match:{ cliente: "deportes ortega"} },
    {$group: {_id: "$cliente", unidades: { $sum: "$numero_unidades" } } },
    {$project: {_id: null, dias: { $divide: [ "$unidades", 10 ] } } }
)