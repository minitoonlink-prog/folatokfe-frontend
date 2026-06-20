package com.mycompany.folatokfe.backend.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "pedidos")
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "numero_pedido", length = 40, nullable = false, unique = true)
    private String numeroPedido;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Column(name = "estado", length = 20, nullable = false)
    private String estado = "PENDIENTE";

    @Column(name = "subtotal", precision = 12, scale = 2, nullable = false)
    private BigDecimal subtotal;

    @Column(name = "costo_envio", precision = 12, scale = 2, nullable = false)
    private BigDecimal costoEnvio = BigDecimal.ZERO;

    @Column(name = "descuento", precision = 12, scale = 2, nullable = false)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(name = "total", precision = 12, scale = 2, nullable = false)
    private BigDecimal total;

    @Column(name = "envio_nombre_completo", length = 150, nullable = false)
    private String envioNombreCompleto;

    @Column(name = "envio_telefono", length = 20, nullable = false)
    private String envioTelefono;

    @Column(name = "envio_direccion", length = 255, nullable = false)
    private String envioDireccion;

    @Column(name = "envio_ciudad", length = 100, nullable = false)
    private String envioCiudad;

    @Column(name = "envio_departamento", length = 100, nullable = false)
    private String envioDepartamento;

    @Column(name = "envio_instrucciones", length = 500)
    private String envioInstrucciones;

    @Column(name = "metodo_pago_tipo", length = 30, nullable = false)
    private String metodoPagoTipo;

    @Column(name = "metodo_pago_titular", length = 150)
    private String metodoPagoTitular;

    @Column(name = "metodo_pago_ultimos_digitos", length = 4)
    private String metodoPagoUltimosDigitos;

    @Column(name = "fecha_entrega_estimada")
    private LocalDate fechaEntregaEstimada;

    @Column(name = "cancelado_at")
    private LocalDateTime canceladoAt;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private Set<PedidoItem> items = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
