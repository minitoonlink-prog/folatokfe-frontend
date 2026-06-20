package com.mycompany.folatokfe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String descripcion;
    @NotNull @PositiveOrZero
    private BigDecimal precio;
    private String imagenUrl;
    private Long categoriaId;
    @PositiveOrZero
    private Integer stock = 0;
    private Boolean activo = true;
}
