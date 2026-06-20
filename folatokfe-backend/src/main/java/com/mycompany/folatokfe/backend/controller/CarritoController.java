package com.mycompany.folatokfe.backend.controller;

import com.mycompany.folatokfe.backend.dto.CarritoItemDTO;
import com.mycompany.folatokfe.backend.dto.CarritoItemRequest;
import com.mycompany.folatokfe.backend.model.Usuario;
import com.mycompany.folatokfe.backend.service.CarritoService;
import com.mycompany.folatokfe.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class CarritoController {

    private final CarritoService carritoService;
    private final UsuarioService usuarioService;

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        String email = authentication.getName();
        return usuarioService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
    }

    @GetMapping
    public ResponseEntity<List<CarritoItemDTO>> obtenerCarrito(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return ResponseEntity.ok(carritoService.obtenerItemsDelCarrito(usuario));
    }

    @PostMapping("/items")
    public ResponseEntity<CarritoItemDTO> agregarItem(@Valid @RequestBody CarritoItemRequest request,
                                                       Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return ResponseEntity.ok(carritoService.agregarItem(usuario, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CarritoItemDTO> actualizarCantidad(@PathVariable Long itemId,
                                                              @RequestParam Integer cantidad,
                                                              Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        CarritoItemDTO dto = carritoService.actualizarCantidad(usuario, itemId, cantidad);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> eliminarItem(@PathVariable Long itemId,
                                             Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        carritoService.eliminarItem(usuario, itemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> vaciarCarrito(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        carritoService.vaciarCarrito(usuario);
        return ResponseEntity.noContent().build();
    }
}