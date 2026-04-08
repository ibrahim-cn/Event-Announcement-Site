package com.eventannouncement.config;

import org.hibernate.event.spi.PostDeleteEvent;
import org.hibernate.event.spi.PostDeleteEventListener;
import org.hibernate.event.spi.PostInsertEvent;
import org.hibernate.event.spi.PostInsertEventListener;
import org.hibernate.event.spi.PostUpdateEvent;
import org.hibernate.event.spi.PostUpdateEventListener;
import org.hibernate.persister.entity.EntityPersister;

public class DataSqlExportEventListener implements PostInsertEventListener, PostUpdateEventListener, PostDeleteEventListener {

    private final DataSqlExportService exportService;

    public DataSqlExportEventListener(DataSqlExportService exportService) {
        this.exportService = exportService;
    }

    @Override
    public void onPostInsert(PostInsertEvent event) {
        exportService.scheduleExportAfterCommit();
    }

    @Override
    public void onPostUpdate(PostUpdateEvent event) {
        exportService.scheduleExportAfterCommit();
    }

    @Override
    public void onPostDelete(PostDeleteEvent event) {
        exportService.scheduleExportAfterCommit();
    }

    @Override
    public boolean requiresPostCommitHandling(EntityPersister persister) {
        return false;
    }
}
