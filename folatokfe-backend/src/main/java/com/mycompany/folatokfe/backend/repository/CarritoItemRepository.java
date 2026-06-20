package com.mycompany.folatokfe.backend.repository;

import com.mycompany.folatokfe.backend.model.Carrito;
import com.mycompany.folatokfe.backend.model.CarritoItem;
import com.mycompany.folatokfe.backend.model.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CarritoItemRepository extends JpaRepository<CarritoItem, Long> {
    Optional<CarritoItem> findByCarritoAndProducto(Carrito carrito, Producto producto);
    void deleteByCarritoAndProducto(Carrito carrito, Producto producto);
}
