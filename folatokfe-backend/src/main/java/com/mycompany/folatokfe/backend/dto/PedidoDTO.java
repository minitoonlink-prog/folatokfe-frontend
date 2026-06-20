package com.mycompany.folatokfe.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class PedidoDTO {
    private Long id;
    private String numeroPedido;
    private Long usuarioId;
    private String usuarioNombre;
    private String estado;
    private BigDecimal subtotal;
    private BigDecimal costoEnvio;
    private BigDecimal descuento;
    private BigDecimal total;
    private String envioNombreCompleto;
    private String envioTelefono;
    private String envioDireccion;
    private String envioCiudad;
    private String envioDepartamento;
    private String envioInstrucciones;
    private String metodoPagoTipo;
    private LocalDate fechaEntregaEstimada;
    private LocalDateTime createdAt;
    private List<PedidoItemDTO> items;
}
