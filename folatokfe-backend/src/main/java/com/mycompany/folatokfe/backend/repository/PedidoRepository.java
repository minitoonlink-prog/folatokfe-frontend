package com.mycompany.folatokfe.backend.repository;

import com.mycompany.folatokfe.backend.model.Pedido;
import com.mycompany.folatokfe.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuarioOrderByCreatedAtDesc(Usuario usuario);
    List<Pedido> findByEstado(String estado);
}
