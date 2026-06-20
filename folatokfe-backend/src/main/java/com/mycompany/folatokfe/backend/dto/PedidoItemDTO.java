package com.mycompany.folatokfe.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PedidoItemDTO {
    private Long id;
    private Long productoId;
    private String productoNombre;
    private String productoImagenUrl;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal subtotal;
}
