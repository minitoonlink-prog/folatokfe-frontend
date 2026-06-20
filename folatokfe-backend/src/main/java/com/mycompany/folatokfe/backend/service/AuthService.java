package com.mycompany.folatokfe.backend.service;

import com.mycompany.folatokfe.backend.config.JwtUtil;
import com.mycompany.folatokfe.backend.dto.LoginRequest;
import com.mycompany.folatokfe.backend.dto.RegisterRequest;
import com.mycompany.folatokfe.backend.dto.AuthResponse;
import com.mycompany.folatokfe.backend.model.Usuario;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioService usuarioService;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Usuario usuario = usuarioService.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        usuarioService.actualizarUltimoLogin(usuario);

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().getNombre());

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioService.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        Usuario usuario = usuarioService.registrarUsuario(
                request.getNombre(),
                request.getEmail(),
                request.getPassword(),
                "CLIENTE"
        );

        String token = jwtUtil.generateToken(usuario.getEmail(), usuario.getRol().getNombre());

        return new AuthResponse(
                token,
                "Bearer",
                usuario.getId(),
                usuario.getNombre(),
                usuario.getEmail(),
                usuario.getRol().getNombre()
        );
    }
}
