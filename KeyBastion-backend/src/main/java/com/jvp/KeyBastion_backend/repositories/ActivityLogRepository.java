package com.jvp.KeyBastion_backend.repositories;

import com.jvp.KeyBastion_backend.model.ActivityLog;
import com.jvp.KeyBastion_backend.model.User;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ActivityLogRepository extends JpaRepository<ActivityLog, UUID> {

    List<ActivityLog> findByUser(User user);

    @Query("SELECT al FROM ActivityLog al WHERE al.user.id = :userId ORDER BY al.timestamp DESC")
    List<ActivityLog> findTopNByUserIdOrderByTimestampDesc(@Param("userId") UUID userId, Pageable pageable);


    List<ActivityLog> findByAction(String action);

    @Query("SELECT a FROM ActivityLog a WHERE a.timestamp BETWEEN :startDate AND :endDate AND a.user = :user")
    List<ActivityLog> findActivityLogsBetweenDates(
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            @Param("user") User user);
}
