package com.mycompany.folatokfe.backend.loader;

import com.mycompany.folatokfe.backend.model.*;
import com.mycompany.folatokfe.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Crear roles si no existen
        if (rolRepository.count() == 0) {
            Rol adminRol = new Rol("ADMIN", "Administrador");
            Rol clienteRol = new Rol("CLIENTE", "Cliente");
            rolRepository.save(adminRol);
            rolRepository.save(clienteRol);
            System.out.println("Roles creados");
        }

        // Crear usuario admin
        if (!usuarioRepository.existsByEmail("admin@folatokfe.com")) {
            Rol adminRol = rolRepository.findByNombre("ADMIN").orElseThrow();
            Usuario admin = new Usuario();
            admin.setNombre("Administrador Folatokfe");
            admin.setEmail("admin@folatokfe.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setRol(adminRol);
            admin.setActivo(true);
            admin.setEmailVerificado(true);
            usuarioRepository.save(admin);
            System.out.println("Usuario admin creado");
        }

        // Crear usuario cliente demo
        if (!usuarioRepository.existsByEmail("cliente@example.com")) {
            Rol clienteRol = rolRepository.findByNombre("CLIENTE").orElseThrow();
            Usuario cliente = new Usuario();
            cliente.setNombre("Cliente Demo");
            cliente.setEmail("cliente@example.com");
            cliente.setPasswordHash(passwordEncoder.encode("cliente123"));
            cliente.setRol(clienteRol);
            cliente.setActivo(true);
            cliente.setEmailVerificado(true);
            usuarioRepository.save(cliente);
            System.out.println("Usuario cliente demo creado");
        }

        // Crear categorías
        if (categoriaRepository.count() == 0) {
            categoriaRepository.save(new Categoria("Corporativas", "Galletas para marketing y regalos empresariales"));
            categoriaRepository.save(new Categoria("Personalizadas", "Galletas para ocasiones especiales y emociones"));
            categoriaRepository.save(new Categoria("Didácticas", "Galletas pensadas para actividades educativas"));
            categoriaRepository.save(new Categoria("Emoji", "Galletas para trabajar inteligencia emocional"));
            System.out.println("Categorías creadas");
        }

        // Crear productos si no existen
        if (productoRepository.count() == 0) {
            Categoria corporativas = categoriaRepository.findByNombre("Corporativas").orElseThrow();
            Categoria personalizadas = categoriaRepository.findByNombre("Personalizadas").orElseThrow();
            Categoria didacticas = categoriaRepository.findByNombre("Didácticas").orElseThrow();
            Categoria emoji = categoriaRepository.findByNombre("Emoji").orElseThrow();

            Producto p1 = new Producto();
            p1.setNombre("Galletas Corporativas");
            p1.setDescripcion("Perfectas para hacer marketing, agradecer la fidelidad de los clientes y una manera innovadora e impactante de visibilizar tu negocio");
            p1.setPrecio(new BigDecimal("72000"));
            p1.setImagenUrl("https://images.unsplash.com/photo-1722239315167-96c02b9b54dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600");
            p1.setCategoria(corporativas);
            p1.setStock(100);
            p1.setActivo(true);
            productoRepository.save(p1);

            Producto p2 = new Producto();
            p2.setNombre("Galletas Personalizadas");
            p2.setDescripcion("Para expresar tus emociones de una manera única y especial con la persona que quieres o amas");
            p2.setPrecio(new BigDecimal("120000"));
            p2.setImagenUrl("https://images.unsplash.com/photo-1577744735110-c79b9b89cbc1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600");
            p2.setCategoria(personalizadas);
            p2.setStock(80);
            p2.setActivo(true);
            productoRepository.save(p2);

            Producto p3 = new Producto();
            p3.setNombre("Galletas Didacticas");
            p3.setDescripcion("Una estrategia didáctica innovadora para trabajar la motricidad de las manos, imaginación, la creatividad, combinación de colores, y vivir una experiencia dulcemente original");
            p3.setPrecio(new BigDecimal("120000"));
            p3.setImagenUrl("https://images.unsplash.com/photo-1587973496572-b5c0f44c554d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600");
            p3.setCategoria(didacticas);
            p3.setStock(60);
            p3.setActivo(true);
            productoRepository.save(p3);

            Producto p4 = new Producto();
            p4.setNombre("Galletas Emoji");
            p4.setDescripcion("Son galletas perfectas para trabajar las emociones con los más pequeños de la casa, permitir identificar al niño cómo se siente, una forma innovadora para entablar conversación y trabajar el equilibrio emocional desde el arte comestible.");
            p4.setPrecio(new BigDecimal("72000"));
            p4.setImagenUrl("https://images.unsplash.com/photo-1586276872491-ebe740d830f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=600");
            p4.setCategoria(emoji);
            p4.setStock(90);
            p4.setActivo(true);
            productoRepository.save(p4);

            System.out.println("Productos creados");
        }
    }
}
