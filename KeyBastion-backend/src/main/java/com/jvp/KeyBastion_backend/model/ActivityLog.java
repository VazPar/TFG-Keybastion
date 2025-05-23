package com.jvp.KeyBastion_backend.model;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "activity_logs")
public class ActivityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String action; // Example: "CREATE", "UPDATE", "DELETE"

    @Column(nullable = false)
    private LocalDateTime timestamp; // Timestamp for the action

    @Column(nullable = false)
    private String ipAddress; // IP address of the user
    
    @Column(length = 500)
    private String description; // Detailed description of the activity
}
