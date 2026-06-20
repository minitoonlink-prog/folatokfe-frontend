package com.mycompany.folatokfe.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PedidoRequest {
    @NotBlank
    private String envioNombreCompleto;
    @NotBlank
    private String envioTelefono;
    @NotBlank
    private String envioDireccion;
    @NotBlank
    private String envioCiudad;
    @NotBlank
    private String envioDepartamento;
    private String envioInstrucciones;
    @NotBlank
    private String metodoPagoTipo;
    private String metodoPagoTitular;
    private String metodoPagoUltimosDigitos;
}
