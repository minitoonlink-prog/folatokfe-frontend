package com.mycompany.folatokfe.backend.service;

import com.mycompany.folatokfe.backend.dto.CarritoItemDTO;
import com.mycompany.folatokfe.backend.dto.CarritoItemRequest;
import com.mycompany.folatokfe.backend.model.Carrito;
import com.mycompany.folatokfe.backend.model.CarritoItem;
import com.mycompany.folatokfe.backend.model.Producto;
import com.mycompany.folatokfe.backend.model.Usuario;
import com.mycompany.folatokfe.backend.repository.CarritoItemRepository;
import com.mycompany.folatokfe.backend.repository.CarritoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final CarritoItemRepository carritoItemRepository;
    private final ProductoService productoService;

    @Transactional
    public Carrito obtenerOCrearCarrito(Usuario usuario) {
        return carritoRepository.findByUsuario(usuario)
                .orElseGet(() -> {
                    Carrito carrito = new Carrito();
                    carrito.setUsuario(usuario);
                    return carritoRepository.save(carrito);
                });
    }

    public List<CarritoItemDTO> obtenerItemsDelCarrito(Usuario usuario) {
        Carrito carrito = obtenerOCrearCarrito(usuario);
        return carrito.getItems().stream()
                .map(this::convertirItemADTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CarritoItemDTO agregarItem(Usuario usuario, CarritoItemRequest request) {
        Producto producto = productoService.obtenerEntidadPorId(request.getProductoId());

        if (!producto.getActivo()) {
            throw new RuntimeException("El producto no está disponible");
        }

        if (producto.getStock() < request.getCantidad()) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        Carrito carrito = obtenerOCrearCarrito(usuario);

        CarritoItem itemExistente = carritoItemRepository.findByCarritoAndProducto(carrito, producto).orElse(null);

        if (itemExistente != null) {
            int nuevaCantidad = itemExistente.getCantidad() + request.getCantidad();
            if (producto.getStock() < nuevaCantidad) {
                throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
            }
            itemExistente.setCantidad(nuevaCantidad);
            itemExistente.setPrecioUnitario(producto.getPrecio());
            itemExistente.calcularSubtotal();
            carritoItemRepository.save(itemExistente);
            return convertirItemADTO(itemExistente);
        } else {
            CarritoItem nuevoItem = new CarritoItem();
            nuevoItem.setCarrito(carrito);
            nuevoItem.setProducto(producto);
            nuevoItem.setCantidad(request.getCantidad());
            nuevoItem.setPrecioUnitario(producto.getPrecio());
            nuevoItem.calcularSubtotal();
            carritoItemRepository.save(nuevoItem);
            return convertirItemADTO(nuevoItem);
        }
    }

    @Transactional
    public CarritoItemDTO actualizarCantidad(Usuario usuario, Long itemId, Integer cantidad) {
        Carrito carrito = obtenerOCrearCarrito(usuario);
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new RuntimeException("El ítem no pertenece al carrito del usuario");
        }

        if (cantidad <= 0) {
            carritoItemRepository.delete(item);
            return null;
        }

        Producto producto = item.getProducto();
        if (producto.getStock() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStock());
        }

        item.setCantidad(cantidad);
        item.calcularSubtotal();
        carritoItemRepository.save(item);
        return convertirItemADTO(item);
    }

    @Transactional
    public void eliminarItem(Usuario usuario, Long itemId) {
        Carrito carrito = obtenerOCrearCarrito(usuario);
        CarritoItem item = carritoItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Ítem no encontrado"));

        if (!item.getCarrito().getId().equals(carrito.getId())) {
            throw new RuntimeException("El ítem no pertenece al carrito del usuario");
        }

        carritoItemRepository.delete(item);
    }

    @Transactional
    public void vaciarCarrito(Usuario usuario) {
        Carrito carrito = obtenerOCrearCarrito(usuario);
        carritoItemRepository.deleteAll(carrito.getItems());
    }

    private CarritoItemDTO convertirItemADTO(CarritoItem item) {
        CarritoItemDTO dto = new CarritoItemDTO();
        dto.setId(item.getId());
        dto.setProductoId(item.getProducto().getId());
        dto.setProductoNombre(item.getProducto().getNombre());
        dto.setImagenUrl(item.getProducto().getImagenUrl());
        dto.setCantidad(item.getCantidad());
        dto.setPrecioUnitario(item.getPrecioUnitario());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}
