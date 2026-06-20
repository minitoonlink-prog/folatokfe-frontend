package com.mycompany.folatokfe.backend.controller;

import com.mycompany.folatokfe.backend.dto.PedidoDTO;
import com.mycompany.folatokfe.backend.dto.PedidoRequest;
import com.mycompany.folatokfe.backend.model.Usuario;
import com.mycompany.folatokfe.backend.service.PedidoService;
import com.mycompany.folatokfe.backend.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
@CrossOrigin(origins = "${cors.allowed-origins}")
public class PedidoController {

    private final PedidoService pedidoService;
    private final UsuarioService usuarioService;

    private Usuario obtenerUsuarioAutenticado(Authentication authentication) {
        String email = authentication.getName();
        return usuarioService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
    }

    @PostMapping
    public ResponseEntity<PedidoDTO> crearPedido(@Valid @RequestBody PedidoRequest request,
                                                 Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return ResponseEntity.ok(pedidoService.crearPedido(usuario, request));
    }

    @GetMapping
    public ResponseEntity<List<PedidoDTO>> listarMisPedidos(Authentication authentication) {
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        return ResponseEntity.ok(pedidoService.listarPedidosDeUsuario(usuario));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PedidoDTO> obtenerPedido(@PathVariable Long id,
                                                   Authentication authentication) {
        PedidoDTO pedido = pedidoService.obtenerPedidoPorId(id);
        Usuario usuario = obtenerUsuarioAutenticado(authentication);
        boolean esAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        if (!esAdmin && !pedido.getUsuarioId().equals(usuario.getId())) {
            throw new RuntimeException("No tienes permiso para ver este pedido");
        }
        return ResponseEntity.ok(pedido);
    }

    @GetMapping("/admin/todos")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PedidoDTO>> listarTodosPedidos() {
        return ResponseEntity.ok(pedidoService.listarTodosPedidos());
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PedidoDTO> actualizarEstado(@PathVariable Long id,
                                                      @RequestParam String nuevoEstado) {
        return ResponseEntity.ok(pedidoService.actualizarEstadoPedido(id, nuevoEstado));
    }
}