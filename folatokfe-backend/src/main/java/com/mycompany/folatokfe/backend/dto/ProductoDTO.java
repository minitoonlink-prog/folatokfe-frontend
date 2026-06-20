package com.mycompany.folatokfe.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoDTO {
    private Long id;
    private String nombre;
    private String descripcion;
    private BigDecimal precio;
    private String imagenUrl;
    private Long categoriaId;
    private String categoriaNombre;
    private Integer stock;
    private Boolean activo;
}
