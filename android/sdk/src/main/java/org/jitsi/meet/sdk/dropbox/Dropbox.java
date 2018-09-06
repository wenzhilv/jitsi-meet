package org.jitsi.meet.sdk.dropbox;

import android.util.Log;

import com.dropbox.core.DbxException;
import com.dropbox.core.DbxRequestConfig;
import com.dropbox.core.v2.DbxClientV2;
import com.dropbox.core.v2.users.FullAccount;
import com.dropbox.core.v2.users.SpaceAllocation;
import com.dropbox.core.v2.users.SpaceUsage;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.dropbox.core.android.Auth;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import org.jitsi.meet.sdk.R;


/**
 * Implements the react-native module for the dropbox integration.
 */
public class Dropbox extends ReactContextBaseJavaModule implements LifecycleEventListener {

    private Promise promise = null;

    public Dropbox(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addLifecycleEventListener(this);
    }

    @Override
    public String getName() {
        return "Dropbox";
    }

    /**
     * Executes the dropbox auth flow.
     *
     * @param promise The promise used to return the result of the auth flow.
     */
    @ReactMethod
    public void authorize(final Promise promise) {
        String appID = this.getCurrentActivity().getString(R.string.dropbox_app_key);

        if (appID == null || "".equals(appID)) {
            promise.reject(new Exception("Dropbox integration isn't configured."));
            return;
        }
        Auth.startOAuth2Authentication(this.getCurrentActivity(), appID);
        this.promise = promise;
    }


    /**
     * Resolves the current user dropbox display name.
     *
     * @param token A dropbox access token.
     * @param promise The promise used to return the result of the auth flow.
     */
    @ReactMethod
    public void getDisplayName(final String token, final Promise promise) {
        DbxRequestConfig config
            = DbxRequestConfig.newBuilder("dropbox/java-tutorial").build();
        DbxClientV2 client = new DbxClientV2(config, token);
        // Get current account info
        try {
            FullAccount account = client.users().getCurrentAccount();
            promise.resolve(account.getName().getDisplayName());
        } catch (DbxException e) {
            promise.reject(e);
        }

    }

    /**
     * Resolves the current user space usage.
     *
     * @param token A dropbox access token.
     * @param promise The promise used to return the result of the auth flow.
     */
    @ReactMethod
    public void getSpaceUsage(final String token, final Promise promise) {
        DbxRequestConfig config
            = DbxRequestConfig.newBuilder("dropbox/java-tutorial").build();
        DbxClientV2 client = new DbxClientV2(config, token);
        try {
            SpaceUsage spaceUsage = client.users().getSpaceUsage();
            WritableMap map = Arguments.createMap();
            map.putString("used", String.valueOf(spaceUsage.getUsed()));
            SpaceAllocation allocation = spaceUsage.getAllocation();
            long allocated = 0;
            if(allocation.isIndividual()) {
                allocated += allocation.getIndividualValue().getAllocated();
            }

            if(allocation.isTeam()) {
                allocated += allocation.getTeamValue().getAllocated();
            }
            map.putString("allocated", String.valueOf(allocated));
            promise.resolve(map);
        } catch (DbxException e) {
            promise.reject(e);
        }
    }

    @Override
    public void onHostResume() {
        final String token = Auth.getOAuth2Token();
        if(token == null)
            return;

        if(this.promise != null) {
            this.promise.resolve(token);
        }
    }

    @Override
    public void onHostPause() {

    }

    @Override
    public void onHostDestroy() {

    }
}
