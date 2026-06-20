package com.mycompany.folatokfe.backend.service;

import com.mycompany.folatokfe.backend.model.Usuario;
import com.mycompany.folatokfe.backend.model.Rol;
import com.mycompany.folatokfe.backend.repository.UsuarioRepository;
import com.mycompany.folatokfe.backend.repository.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public Optional<Usuario> findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }

    public boolean existsByEmail(String email) {
        return usuarioRepository.existsByEmail(email);
    }

    @Transactional
    public Usuario registrarUsuario(String nombre, String email, String password, String rolNombre) {
        Rol rol = rolRepository.findByNombre(rolNombre)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + rolNombre));

        Usuario usuario = new Usuario();
        usuario.setNombre(nombre);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(password));
        usuario.setRol(rol);
        usuario.setActivo(true);
        usuario.setEmailVerificado(true);

        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void actualizarUltimoLogin(Usuario usuario) {
        usuario.setUltimoLoginAt(java.time.LocalDateTime.now());
        usuarioRepository.save(usuario);
    }
}
