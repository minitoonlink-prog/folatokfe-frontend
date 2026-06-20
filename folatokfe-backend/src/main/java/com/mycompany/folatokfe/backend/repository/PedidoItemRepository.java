package com.mycompany.folatokfe.backend.repository;

import com.mycompany.folatokfe.backend.model.PedidoItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoItemRepository extends JpaRepository<PedidoItem, Long> {
}
