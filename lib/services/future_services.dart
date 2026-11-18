/// Integration boundaries only. Phase one never creates a camera or audio service.
abstract interface class CameraService {
  Future<List<String>> listDevices();
  Future<void> startPreview(String deviceId, {bool mirrored = true});
  Future<void> stopPreview();
  Future<void> dispose();
}

abstract interface class AudioService {
  void setVolumes({
    required double master,
    required double music,
    required double effects,
  });
  Future<void> playCue(String cue);
  Future<void> dispose();
}
