from deep_sort_realtime.deepsort_tracker import DeepSort

class FaceTracker:
    def __init__(self):
        # We tune DeepSORT for face tracking:
        # max_age determines how many frames a track remains active if not detected
        # n_init is how many consistent frames until a track is confirmed
        self.tracker = DeepSort(max_age=30, n_init=3, nms_max_overlap=1.0)

    def update(self, detections, frame):
        """
        Takes detections from YOLO and updates tracking IDs.
        detections format: [([left,top,w,h], confidence, detection_class)]
        """
        # update_tracks handles id assignment based on bbox IOU and deep features mapping
        tracks = self.tracker.update_tracks(detections, frame=frame)
        return tracks
