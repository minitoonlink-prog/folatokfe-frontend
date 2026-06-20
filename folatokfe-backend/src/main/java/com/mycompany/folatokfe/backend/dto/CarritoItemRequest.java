package com.mycompany.folatokfe.backend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class CarritoItemRequest {
    @NotNull
    private Long productoId;
    @NotNull @Positive
    private Integer cantidad;
}
