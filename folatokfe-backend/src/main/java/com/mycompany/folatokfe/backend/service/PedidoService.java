package com.mycompany.folatokfe.backend.service;

import com.mycompany.folatokfe.backend.dto.PedidoDTO;
import com.mycompany.folatokfe.backend.dto.PedidoItemDTO;
import com.mycompany.folatokfe.backend.dto.PedidoRequest;
import com.mycompany.folatokfe.backend.dto.ProductoRequest;
import com.mycompany.folatokfe.backend.model.*;
import com.mycompany.folatokfe.backend.repository.PedidoRepository;
import com.mycompany.folatokfe.backend.repository.PedidoItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final PedidoItemRepository pedidoItemRepository;
    private final CarritoService carritoService;
    private final ProductoService productoService;

    @Transactional
    public PedidoDTO crearPedido(Usuario usuario, PedidoRequest request) {
        Carrito carrito = carritoService.obtenerOCrearCarrito(usuario);
        if (carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        String numeroPedido = generarNumeroPedido();

        Pedido pedido = new Pedido();
        pedido.setNumeroPedido(numeroPedido);
        pedido.setUsuario(usuario);
        pedido.setEstado("PENDIENTE");

        BigDecimal subtotal = carrito.getItems().stream()
                .map(CarritoItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setSubtotal(subtotal);
        pedido.setCostoEnvio(BigDecimal.ZERO);
        pedido.setDescuento(BigDecimal.ZERO);
        pedido.setTotal(subtotal);

        pedido.setEnvioNombreCompleto(request.getEnvioNombreCompleto());
        pedido.setEnvioTelefono(request.getEnvioTelefono());
        pedido.setEnvioDireccion(request.getEnvioDireccion());
        pedido.setEnvioCiudad(request.getEnvioCiudad());
        pedido.setEnvioDepartamento(request.getEnvioDepartamento());
        pedido.setEnvioInstrucciones(request.getEnvioInstrucciones());

        pedido.setMetodoPagoTipo(request.getMetodoPagoTipo());
        pedido.setMetodoPagoTitular(request.getMetodoPagoTitular());
        pedido.setMetodoPagoUltimosDigitos(request.getMetodoPagoUltimosDigitos());

        pedido.setFechaEntregaEstimada(LocalDate.now().plusDays(4));

        pedido = pedidoRepository.save(pedido);

        for (CarritoItem carritoItem : carrito.getItems()) {
            PedidoItem pedidoItem = new PedidoItem();
            pedidoItem.setPedido(pedido);
            pedidoItem.setProducto(carritoItem.getProducto());
            pedidoItem.setProductoNombre(carritoItem.getProducto().getNombre());
            pedidoItem.setProductoImagenUrl(carritoItem.getProducto().getImagenUrl());
            pedidoItem.setCantidad(carritoItem.getCantidad());
            pedidoItem.setPrecioUnitario(carritoItem.getPrecioUnitario());
            pedidoItem.setSubtotal(carritoItem.getSubtotal());
            pedidoItemRepository.save(pedidoItem);

            Producto producto = carritoItem.getProducto();
            producto.setStock(producto.getStock() - carritoItem.getCantidad());
            productoService.actualizarProducto(producto.getId(), convertirProductoARequest(producto));
        }

        carritoService.vaciarCarrito(usuario);

        return convertirPedidoADTO(pedido);
    }

    private String generarNumeroPedido() {
        String fecha = LocalDate.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd"));
        String aleatorio = java.util.UUID.randomUUID().toString().substring(0, 6).toUpperCase();
        return "ORD-" + fecha + "-" + aleatorio;
    }

    private ProductoRequest convertirProductoARequest(Producto producto) {
        ProductoRequest request = new ProductoRequest();
        request.setNombre(producto.getNombre());
        request.setDescripcion(producto.getDescripcion());
        request.setPrecio(producto.getPrecio());
        request.setImagenUrl(producto.getImagenUrl());
        request.setStock(producto.getStock());
        request.setActivo(producto.getActivo());
        if (producto.getCategoria() != null) {
            request.setCategoriaId(producto.getCategoria().getId());
        }
        return request;
    }

    public List<PedidoDTO> listarPedidosDeUsuario(Usuario usuario) {
        return pedidoRepository.findByUsuarioOrderByCreatedAtDesc(usuario).stream()
                .map(this::convertirPedidoADTO)
                .collect(Collectors.toList());
    }

    public PedidoDTO obtenerPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
        return convertirPedidoADTO(pedido);
    }

    public List<PedidoDTO> listarTodosPedidos() {
        return pedidoRepository.findAll().stream()
                .map(this::convertirPedidoADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public PedidoDTO actualizarEstadoPedido(Long id, String nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setEstado(nuevoEstado);
        if ("CANCELADO".equals(nuevoEstado)) {
            pedido.setCanceladoAt(LocalDateTime.now());
            for (PedidoItem item : pedido.getItems()) {
                if (item.getProducto() != null) {
                    Producto producto = item.getProducto();
                    producto.setStock(producto.getStock() + item.getCantidad());
                    productoService.actualizarProducto(producto.getId(), convertirProductoARequest(producto));
                }
            }
        }

        pedido = pedidoRepository.save(pedido);
        return convertirPedidoADTO(pedido);
    }

    private PedidoDTO convertirPedidoADTO(Pedido pedido) {
        PedidoDTO dto = new PedidoDTO();
        dto.setId(pedido.getId());
        dto.setNumeroPedido(pedido.getNumeroPedido());
        dto.setUsuarioId(pedido.getUsuario().getId());
        dto.setUsuarioNombre(pedido.getUsuario().getNombre());
        dto.setEstado(pedido.getEstado());
        dto.setSubtotal(pedido.getSubtotal());
        dto.setCostoEnvio(pedido.getCostoEnvio());
        dto.setDescuento(pedido.getDescuento());
        dto.setTotal(pedido.getTotal());
        dto.setEnvioNombreCompleto(pedido.getEnvioNombreCompleto());
        dto.setEnvioTelefono(pedido.getEnvioTelefono());
        dto.setEnvioDireccion(pedido.getEnvioDireccion());
        dto.setEnvioCiudad(pedido.getEnvioCiudad());
        dto.setEnvioDepartamento(pedido.getEnvioDepartamento());
        dto.setEnvioInstrucciones(pedido.getEnvioInstrucciones());
        dto.setMetodoPagoTipo(pedido.getMetodoPagoTipo());
        dto.setFechaEntregaEstimada(pedido.getFechaEntregaEstimada());
        dto.setCreatedAt(pedido.getCreatedAt());

        List<PedidoItemDTO> items = pedido.getItems().stream()
                .map(this::convertirItemADTO)
                .collect(Collectors.toList());
        dto.setItems(items);
        return dto;
    }

    private PedidoItemDTO convertirItemADTO(PedidoItem item) {
        PedidoItemDTO dto = new PedidoItemDTO();
        dto.setId(item.getId());
        dto.setProductoId(item.getProducto() != null ? item.getProducto().getId() : null);
        dto.setProductoNombre(item.getProductoNombre());
        dto.setProductoImagenUrl(item.getProductoImagenUrl());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}
