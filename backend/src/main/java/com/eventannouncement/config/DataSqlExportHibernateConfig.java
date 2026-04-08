package com.eventannouncement.config;

import org.hibernate.jpa.boot.spi.IntegratorProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.orm.jpa.HibernatePropertiesCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
@ConditionalOnProperty(name = "app.data-sql.auto-export", havingValue = "true", matchIfMissing = true)
public class DataSqlExportHibernateConfig {

    /** Hibernate 6.x: constant removed from {@code AvailableSettings}; key is still this string. */
    private static final String INTEGRATOR_PROVIDER_KEY = "hibernate.integrator_provider";

    @Bean
    public HibernatePropertiesCustomizer dataSqlExportHibernateCustomizer(DataSqlExportService exportService) {
        return hibernateProperties -> hibernateProperties.put(
                INTEGRATOR_PROVIDER_KEY,
                (IntegratorProvider) () -> List.of(new DataSqlExportIntegrator(exportService))
        );
    }
}
