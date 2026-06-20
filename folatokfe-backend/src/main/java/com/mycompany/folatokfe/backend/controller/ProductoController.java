package com.mycompany.folatokfe.backend.controller;

import com.mycompany.folatokfe.backend.dto.ProductoDTO;
import com.mycompany.folatokfe.backend.dto.ProductoRequest;
import com.mycompany.folatokfe.backend.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<ProductoDTO>> listarProductos(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) String nombre) {
        if (categoriaId != null) {
            return ResponseEntity.ok(productoService.listarPorCategoria(categoriaId));
        } else if (nombre != null && !nombre.isEmpty()) {
            return ResponseEntity.ok(productoService.buscarPorNombre(nombre));
        }
        return ResponseEntity.ok(productoService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoDTO> obtenerProducto(@PathVariable Long id) {
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> crearProducto(@Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.crearProducto(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> actualizarProducto(@PathVariable Long id,
                                                          @Valid @RequestBody ProductoRequest request) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restaurar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoDTO> restaurarProducto(@PathVariable Long id) {
        productoService.restaurarProducto(id);
        return ResponseEntity.ok(productoService.obtenerPorId(id));
    }

    @DeleteMapping("/{id}/permanente")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarPermanentemente(@PathVariable Long id) {
        productoService.eliminarPermanentemente(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductoDTO>> listarTodosIncluyendoInactivos() {
        return ResponseEntity.ok(productoService.listarTodosIncluyendoInactivos());
    }
}