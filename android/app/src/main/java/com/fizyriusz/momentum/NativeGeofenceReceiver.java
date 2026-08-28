package com.fizyriusz.momentum;

import android.annotation.SuppressLint;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import org.json.JSONObject;

public class NativeGeofenceReceiver extends BroadcastReceiver {

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;

        String payloadStr = intent.getStringExtra("payload");
        if (payloadStr == null || payloadStr.isEmpty()) return;

        try {
            JSONObject payload = new JSONObject(payloadStr);
            boolean enter = payload.optBoolean("enter", false);
            String transition = payload.optString("transition", "");
            String identifier = payload.optString("identifier", "Zapisane Miejsce");

            // Reagujemy na wejście w strefę (enter == true lub transition == "enter")
            if (enter || "enter".equalsIgnoreCase(transition)) {
                sendGeofenceNotification(context, identifier);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @SuppressLint("MissingPermission")
    private void sendGeofenceNotification(Context context, String placeName) {
        Intent openAppIntent = new Intent(context, MainActivity.class);
        openAppIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);

        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }

        PendingIntent pendingIntent = PendingIntent.getActivity(
            context,
            (int) System.currentTimeMillis(),
            openAppIntent,
            flags
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, DuveoApp.GEOFENCE_CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle("📍 Jesteś w pobliżu: " + placeName)
            .setContentText("Masz aktywne zadania przypisane do tej lokalizacji.")
            .setStyle(new NotificationCompat.BigTextStyle()
                .bigText("Wkroczyłeś w strefę: " + placeName + ". Otwórz Duveo, aby sprawdzić swoje zadania dla tego miejsca."))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_EVENT)
            .setAutoCancel(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setVibrate(new long[]{0, 300, 200, 300})
            .setContentIntent(pendingIntent);

        NotificationManagerCompat notificationManager = NotificationManagerCompat.from(context);
        int notificationId = (int) (System.currentTimeMillis() % Integer.MAX_VALUE);

        try {
            notificationManager.notify(notificationId, builder.build());
        } catch (SecurityException se) {
            se.printStackTrace();
        }
    }
}
