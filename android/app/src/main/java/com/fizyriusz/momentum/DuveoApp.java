package com.fizyriusz.momentum;

import android.app.Application;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.IntentFilter;
import android.os.Build;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class DuveoApp extends Application {

    public static final String GEOFENCE_CHANNEL_ID = "duveo_geofence_channel";
    private NativeGeofenceReceiver geofenceReceiver;

    @Override
    public void onCreate() {
        super.onCreate();
        createNotificationChannel();
        registerGeofenceReceiver();
    }

    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            CharSequence name = "Powiadomienia Miejsc (Duveo)";
            String description = "Powiadomienia o zadaniach w pobliżu zarejestrowanych stref GPS";
            int importance = NotificationManager.IMPORTANCE_HIGH;
            NotificationChannel channel = new NotificationChannel(GEOFENCE_CHANNEL_ID, name, importance);
            channel.setDescription(description);
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 300, 200, 300});
            channel.enableLights(true);

            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(channel);
            }
        }
    }

    private void registerGeofenceReceiver() {
        geofenceReceiver = new NativeGeofenceReceiver();
        IntentFilter filter = new IntentFilter("com.capgo.capacitor_background_geolocation.geofence");
        LocalBroadcastManager.getInstance(this).registerReceiver(geofenceReceiver, filter);
    }
}
